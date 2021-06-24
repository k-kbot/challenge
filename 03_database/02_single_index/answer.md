## 課題１（質問）
- インデックスの仕組み
```
電話帳や辞書の索引のように、あるルールに従って並べられたデータのこと。
テーブルの指定した列の値と行の位置情報が紐づけられている。

インデックスを使わない検索の場合、SQLで指定された表の全てのデータにアクセスして、検索条件を満たす行を1行ずつチェックする（フルテーブルスキャン）。

一方で、インデックスを使った検索では、まずインデックスにアクセスして検索条件に該当する行がテーブルのどこにあるのかを割り出す。その後、この情報を元にテーブルにアクセスすることで、効率的に検索することができる。
```

- なぜslow query logを調べるべきか
```
slow query logはMySQLで出力できるログの一種で、実行時間が指定した時間より長いSQL（スロークエリ）を出力することができる。
闇雲にインデックスを作成すると、かえってパフォーマンスが落ちることもあるため、スロークエリを改善するためのインデックス設計をするべきである。
```

- カーディナリティとは
```
特定の列の値がどのぐらいの種類の多さを持つか、ということを表す概念のこと。
例えば「性別」を表す列で、男・女・不詳を持つとすると、この列のカーディナリティは3になる。
B-treeインデックスを作るときは、カーディナリティの高い列を選ぶことが基本となる。
```

- カバリングインデックスとは
```
クエリを処理するために必要なデータを全て含んでいるインデックスのこと。
インデックスだけで検索が完結し、テーブルアクセスがないためパフォーマンス改善の効果が高い。
```


## 課題２（実装）


### 1. 名前が`G`で始まる従業員
- 使用したクエリ
```sql
SELECT SQL_NO_CACHE * FROM employees.employees WHERE first_name LIKE 'G%';
```

- first_nameにインデックス作成
```sql
CREATE INDEX idx_first_name ON employees.employees(first_name);
```

- 実行計画
  - typeがrange（インデックスを利用した範囲検索）となっている。
```sql
mysql> EXPLAIN SELECT SQL_NO_CACHE * FROM employees.employees WHERE first_name LIKE 'G%';
+----+-------------+-----------+------------+-------+----------------+----------------+---------+------+------+----------+-----------------------+
| id | select_type | table     | partitions | type  | possible_keys  | key            | key_len | ref  | rows | filtered | Extra                 |
+----+-------------+-----------+------------+-------+----------------+----------------+---------+------+------+----------+-----------------------+
|  1 | SIMPLE      | employees | NULL       | range | idx_first_name | idx_first_name | 16      | NULL |    1 |   100.00 | Using index condition |
+----+-------------+-----------+------------+-------+----------------+----------------+---------+------+------+----------+-----------------------+
1 row in set, 2 warnings (0.00 sec)
```

### 2. 1985年以前に雇用された従業員
- 使用したクエリ
```sql
SELECT SQL_NO_CACHE * FROM employees.employees WHERE hire_date < '1986-01-01';
```

- hire_dateにインデックス作成
```sql
CREATE INDEX idx_hire_date ON employees.employees(hire_date);
```

- 実行計画
  - typeがrange（インデックスを利用した範囲検索）となっている。
```sql
mysql> EXPLAIN SELECT SQL_NO_CACHE * FROM employees.employees WHERE hire_date >= '1986-01-01';
+----+-------------+-----------+------------+-------+---------------+---------------+---------+------+------+----------+-----------------------+
| id | select_type | table     | partitions | type  | possible_keys | key           | key_len | ref  | rows | filtered | Extra                 |
+----+-------------+-----------+------------+-------+---------------+---------------+---------+------+------+----------+-----------------------+
|  1 | SIMPLE      | employees | NULL       | range | idx_hire_date | idx_hire_date | 3       | NULL |    1 |   100.00 | Using index condition |
+----+-------------+-----------+------------+-------+---------------+---------------+---------+------+------+----------+-----------------------+
1 row in set, 2 warnings (0.00 sec)
```

### 3. 昇順でソートした従業員の誕生日（重複は除く）
- 使用したクエリ
```sql
SELECT SQL_NO_CACHE DISTINCT birth_date FROM employees.employees ORDER BY birth_date;
```

- birth_dateにインデックス作成
```sql
CREATE INDEX idx_birth_date ON employees.employees(birth_date);
```


- 実行計画
  - typeがindex（インデックススキャン）となっている。
```sql
mysql> EXPLAIN SELECT SQL_NO_CACHE DISTINCT birth_date FROM employees.employees ORDER BY birth_date;
+----+-------------+-----------+------------+-------+----------------+----------------+---------+------+------+----------+-------------+
| id | select_type | table     | partitions | type  | possible_keys  | key            | key_len | ref  | rows | filtered | Extra       |
+----+-------------+-----------+------------+-------+----------------+----------------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | employees | NULL       | index | idx_birth_date | idx_birth_date | 3       | NULL |    2 |   100.00 | Using index |
+----+-------------+-----------+------------+-------+----------------+----------------+---------+------+------+----------+-------------+
1 row in set, 2 warnings (0.00 sec)
```


## 課題３（実装）
- INSERT文でデータ追加
```sql
INSERT INTO employees.employees VALUES (1,'1950-01-01','John','Lennon','M','1950-01-01');
INSERT INTO employees.employees VALUES (2,'1950-02-02','Paul','McCartney','M','1950-01-01');
INSERT INTO employees.employees VALUES (3,'1950-03-03','George','Harrison','M','1950-01-01');
INSERT INTO employees.employees VALUES (4,'1950-04-04','Ringo','Starr','M','1950-01-01');
INSERT INTO employees.employees VALUES (5,'1950-05-05','Ono','Yoko','F','1950-01-01');
```

- インデックスの有無によるINSERTの時間の差とその理由
```
インデックスがある方が、INSERTに時間がかかる。
インデックスが作成されている対象の列の値が更新されると、インデックス内に保持している値も更新されるため。
```

- インデックスの有無によるDELETEの時間の差とその理由
```
DELETEもINSERTと同じく更新系のクエリであるため、インデックスがある方が時間がかかる。
```

## 課題4（クイズ）
