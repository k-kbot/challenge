# 課題１（質問）

## デッドロックとは

複数のトランザクションが、もう一方の処理が終わるのをお互い待って身動きが取れなくなっている状態のこと。

## デッドロックの事例

## ISOLATION LEVEL（トランザクション分離レベル）

- Read Uncommitted
  - 他のトランザクションがコミットしていない内容が見える （Dirty Read）
- Read Committed
  - 他のトランザクションがコミットしていない内容は見えない
  - 他のトランザクションがコミットした変更が途中から見える （Unrepeatable Read)
  - PostgreSQL のデフォルトのトランザクション分離レベルである
- Repeatable Read
  - 他のトランザクションがコミットしていない内容は見えない
  - 他のトランザクションがコミットした変更は見えない
  - 他のトランザクションがコミットした追加・削除が見える（Phantom Read）
    - ただし、PostgreSQL の実装では発生しない
  - MySQL のデフォルトのトランザクション分離レベルである
- Serializable
  - 他のトランザクションがコミットしていない内容は見えない
  - 他のトランザクションがコミットした変更は見えない
  - 他のトランザクションがコミットした追加・削除が見えない

## 行レベル・テーブルレベルのロック

### 行レベルのロック

行単位で対象をロックする。
1 行の場合もあれば複数行にまたがる場合もあり、すべての行を対象にすると表ロックと同義になる。

### テーブルレベルのロック

テーブルを対象にロックするため該当のテーブル内の行はすべて対象になる。

## 悲観ロックと楽観ロック

### 悲観ロック

### 楽観ロック

## 共有ロックと排他ロック

### 共有ロック

- ロック対象への参照以外のアクセスを禁止する
- ほかのトランザクションから参照（SELECT）でアクセス可能
- 読み込みロック、S lock（Shared lock）と呼ばれることもある

### 排他ロック

- ロック対象へのすべてのアクセスを禁止する
- SELECT, INSERT, UPDATE, DELETE すべて実行できない
- 書き込みロック、X lock（eXcluded lock）と呼ばれることもある

## Fuzzy(Non-Repeatable) Read と Phantom Read

### Fuzzy(Non-Repeatable) Read

自身のトランザクションの途中に、他のトランザクションがコミットした更新・削除が見えてしまう現象のこと。

### Phantom Read

自身のトランザクションの途中に、他のトランザクションがコミットした追加・削除によるレコードの増減が見えてしまう現象のこと。

参考: [データベース: トランザクション分離レベルについてまとめてみる](https://techracho.bpsinc.jp/kotetsu75/2018_12_14/66410)

# 課題２（実装）

## 再現

### Dirty Read

A, B の 2 つのトランザクションを用意して、以下の状況を再現する。

- A, B のトランザクションを開始する。
- A のトランザクション中に`emp_no = 10001`の gender を更新する。
- A のトランザクションのコミット前に、B のトランザクションから`emp_no = 10001`の更新後のレコードが取得できる。

1. `emp_no = 10001`のレコードを取得する。gender は`M`である。

```sql
mysql> SELECT gender FROM employees WHERE emp_no = 10001;
+--------+
| gender |
+--------+
| M      |
+--------+
1 row in set (0.00 sec)
```

2. A, B の両方で、ISOLATION LEVEL を`READ UNCOMMITTED`に設定する。

```sql
mysql> SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
Query OK, 0 rows affected (0.00 sec)
```

3. A, B の両方で、トランザクションを開始する。

```sql
mysql> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)
```

4. A のトランザクションで、`emp_no = 10001`の gender を`F`に更新する。

```sql
mysql> UPDATE employees SET gender = 'F' WHERE emp_no = 10001;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

5. A のトランザクションのコミット前に、B のトランザクションで`emp_no = 10001`の gender が`F`に更新されていることを確認する。

```sql
mysql> SELECT gender FROM employees WHERE emp_no = 10001;
+--------+
| gender |
+--------+
| F      |
+--------+
1 row in set (0.00 sec)
```

### Non-Repeatable Read

A, B の 2 つのトランザクションを用意して、以下の状況を再現する。

- A, B のトランザクションを開始する。
- A のトランザクション中に`emp_no = 10001`の gender を更新する。
- A のトランザクションをコミットする。
- B のトランザクションから`emp_no = 10001`の更新後のレコードが取得できる。

1 ~ 4 は Dirty Read と同じであるため、省略する。

5. A のトランザクションをコミットする。

```sql
mysql> COMMIT;
Query OK, 0 rows affected (0.00 sec)
```

6. B のトランザクションで`emp_no = 10001`の gender が`F`に更新されていることを確認する。

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

A, B の 2 つのトランザクションを用意して、以下の状況を再現する。

- A, B のトランザクションを開始する。
- A のトランザクション中に emp_no = 10000 のレコードを作成する。
- A のトランザクションをコミットする。
- B のトランザクションから emp_no = 10000 のレコードが取得できる。

1. `emp_no = 10000`のレコードが存在しないことを確認する。

```sql
mysql> SELECT * FROM employees WHERE emp_no = 10000;
Empty set (0.00 sec)
```

2, 3 は Dirty Read, Non-repeatable Read と同じであるため、省略する。

4. A のトランザクションで、`emp_no = 10000`のレコードを作成する。

```sql
mysql> INSERT INTO employees VALUES ('10000', '1950-01-01', 'Taro', 'Tanaka', 'M', '1990-01-01');
Query OK, 1 row affected (0.01 sec)
```

5 は Non-repeatable Read と同じであるため、省略する。

6. B のトランザクションで`emp_no = 10000`のレコードを取得できることを確認する。

```sql
mysql> SELECT * FROM employees WHERE emp_no = 10000;
+--------+------------+------------+-----------+--------+------------+
| emp_no | birth_date | first_name | last_name | gender | hire_date  |
+--------+------------+------------+-----------+--------+------------+
|  10000 | 1950-01-01 | Taro       | Tanaka    | M      | 1990-01-01 |
+--------+------------+------------+-----------+--------+------------+
1 row in set (0.00 sec)
```
