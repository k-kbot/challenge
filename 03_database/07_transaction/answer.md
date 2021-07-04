## 課題１（質問）
### デッドロックとは
複数のトランザクションが、もう一方の処理が終わるのをお互い待って身動きが取れなくなっている状態のこと。

### ISOLATION LEVEL
- Read Uncommitted
  - 他のトランザクションがコミットしていない内容が見える （Dirty Read）
- Read Committed
  - 他のトランザクションがコミットしていない内容は見えない
  - 他のトランザクションがコミットした変更が途中から見える （Unrepeatable Read)
- Repeatable Read
  - 他のトランザクションがコミットしていない内容は見えない
  - 他のトランザクションがコミットした変更は見えない
  - 他のトランザクションがコミットした追加・削除が見える（Phantom Read）
     - 但し、PostgreSQLの実装では発生しない
- Serializable
  - 他のトランザクションがコミットしていない内容は見えない
  - 他のトランザクションがコミットした変更は見えない
  - 他のトランザクションがコミットした追加・削除が見えない

### 行レベルのロックとテーブルレベルのロック
- 行レベルのロック
  - 行単位で対象をロックする。1行の場合もあれば複数行にまたがる場合もあり、全ての行を対象にするとテーブルロックと同義になる。
  - レコードロックとも呼ばれる
- テーブルレベルのロック
  - テーブルを対象にロックするため該当のテーブル内は全て対象になる。

### 悲観ロックと楽観ロック
- 悲観ロック
  - 排他ロックを取得して、他の誰もレコードの更新を開始できないようにすること。
- 楽観ロック
  - トランザクションをコミットする前に、レコードが他の誰かによって更新されていたかどうかを確認し、もし更新されていたのならロールバックをする。

## 課題２（実装）
### Dirty Read
Dirty Readとは他のトランザクションから自分のコミットしていない変更内容が見えてしまう現象のこと。
A, Bの2つのトランザクションを用意して、以下の状況を再現する。
- A, Bのトランザクションを開始する。
- Aのトランザクション中に`emp_no = 10001`のgenderを更新する。
- Aのトランザクションのコミット前に、Bのトランザクションから`emp_no = 10001`の更新後のレコードが取得できる。

#### 再現
1. `emp_no = 10001`のレコードを取得する。genderは`M`である。
```sql
mysql> SELECT gender FROM employees WHERE emp_no = 10001;
+--------+
| gender |
+--------+
| M      |
+--------+
1 row in set (0.00 sec)
```

2. A, Bの両方で、ISOLATION LEVELを`READ UNCOMMITTED`に設定する。
```sql
mysql> SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
Query OK, 0 rows affected (0.00 sec)
```

3. A, Bの両方で、トランザクションを開始する。
```sql
mysql> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)
```

4. Aのトランザクションで、`emp_no = 10001`のgenderを`F`に更新する。
```sql
mysql> UPDATE employees SET gender = 'F' WHERE emp_no = 10001;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

5. Aのトランザクションのコミット前に、Bのトランザクションで`emp_no = 10001`のgenderが`F`に更新されていることを確認する。
```sql
mysql> SELECT gender FROM employees WHERE emp_no = 10001;
+--------+
| gender |
+--------+
| F      |
+--------+
1 row in set (0.00 sec)
```

### Non-repeatable Read
Non-repeatable Readはトランザクションの途中に他のトランザクションがコミットした変更が見えてしまう現象のこと。
Non-repeatable Readは`Fuzzy Read`とも呼ばれる。

A, Bの2つのトランザクションを用意して、以下の状況を再現する。
- A, Bのトランザクションを開始する。
- Aのトランザクション中に`emp_no = 10001`のgenderを更新する。
- Aのトランザクションをコミットする。
- Bのトランザクションから`emp_no = 10001`の更新後のレコードが取得できる。

#### 再現
1 ~ 4はDirty Readと同じであるため、省略する。

5. Aのトランザクションをコミットする。
```sql
mysql> COMMIT;
Query OK, 0 rows affected (0.00 sec)
```

6. Bのトランザクションで`emp_no = 10001`のgenderが`F`に更新されていることを確認する。
```sql
mysql> SELECT gender FROM employees WHERE emp_no = 10001;
+--------+
| gender |
+--------+
| F      |
+--------+
1 row in set (0.00 sec)
```

### Phantom Read
Phantom Readは他のトランザクションがコミットした追加・削除が見えてしまう現象のこと。

A, Bの2つのトランザクションを用意して、以下の状況を再現する。
- A, Bのトランザクションを開始する。
- Aのトランザクション中にemp_no = 10000のレコードを作成する。
- Aのトランザクションをコミットする。
- Bのトランザクションからemp_no = 10000のレコードが取得できる。

#### 再現
1. `emp_no = 10000`のレコードが存在しないことを確認する。
```sql
mysql> SELECT * FROM employees WHERE emp_no = 10000;
Empty set (0.00 sec)
```
2, 3はDirty Read, Non-repeatable Readと同じであるため、省略する。

4. Aのトランザクションで、`emp_no = 10000`のレコードを作成する。
```sql
mysql> INSERT INTO employees VALUES ('10000', '1950-01-01', 'Taro', 'Tanaka', 'M', '1990-01-01');
Query OK, 1 row affected (0.01 sec)
```

5はNon-repeatable Readと同じであるため、省略する。

6. Bのトランザクションで`emp_no = 10000`のレコードを取得できることを確認する。
```sql
mysql> SELECT * FROM employees WHERE emp_no = 10000;
+--------+------------+------------+-----------+--------+------------+
| emp_no | birth_date | first_name | last_name | gender | hire_date  |
+--------+------------+------------+-----------+--------+------------+
|  10000 | 1950-01-01 | Taro       | Tanaka    | M      | 1990-01-01 |
+--------+------------+------------+-----------+--------+------------+
1 row in set (0.00 sec)
```
