# 課題１（実装）

## スロークエリログを有効にする

```sql
mysql> SET GLOBAL slow_query_log = ON;
Query OK, 0 rows affected (0.04 sec)
```

## 実行に 0.1 秒以上かかったクエリをスロークエリログに記録する

```sql
mysql>  SET GLOBAL long_query_time = 0.1;
Query OK, 0 rows affected (0.00 sec)
mysql> SHOW VARIABLES LIKE 'long_query_time';
+-----------------+----------+
| Variable_name   | Value    |
+-----------------+----------+
| long_query_time | 0.100000 |
+-----------------+----------+
1 row in set (0.01 sec)
```

スロークエリログの保存先を確認する。

```sql
mysql> SHOW VARIABLES LIKE 'slow_query_log_file';
+---------------------+--------------------------------------+
| Variable_name       | Value                                |
+---------------------+--------------------------------------+
| slow_query_log_file | /var/lib/mysql/4c940e44c78f-slow.log |
+---------------------+--------------------------------------+
1 row in set (0.00 sec)
```

この時点では、スロークエリログには何も記録されていない。

```shell
$ cat /var/lib/mysql/4c940e44c78f-slow.log
mysqld, Version: 5.7.24 (MySQL Community Server (GPL)). started with:
Tcp port: 3306  Unix socket: /var/run/mysqld/mysqld.sock
Time                 Id Command    Argument
```

## 実行時間 0.1 秒以下のクエリ

```sql
mysql> SELECT COUNT(*)
    -> FROM   employees;
-- 略
1 row in set (0.03 sec)
```

```sql
mysql> SELECT DISTINCT gender
    -> FROM   employees;
-- 略
2 rows in set (0.26 sec)
```

```sql
mysql> SELECT *
    -> FROM   employees
    -> WHERE  emp_no = '10001';
-- 略
1 row in set (0.00 sec)
```

クエリの実行時間が全て 0.1 秒未満のため、スロークエリログには何も記録されていない。

```shell
$ cat /var/lib/mysql/4c940e44c78f-slow.log
mysqld, Version: 5.7.24 (MySQL Community Server (GPL)). started with:
Tcp port: 3306  Unix socket: /var/run/mysqld/mysqld.sock
Time                 Id Command    Argument
```

## 実行時間が 0.1 秒より長いクエリ

```sql
SELECT *
FROM   employees
ORDER  BY birth_date, hire_date;
-- 略
300024 rows in set (0.26 sec)
```

```sql
SELECT *
FROM   employees
JOIN   salaries
ON     employees.emp_no = salaries.emp_no;
-- 略
2844047 rows in set (2.62 sec)
```

```sql
SELECT gender, COUNT(*) AS number_of_people
FROM   employees
GROUP  BY gender;
-- 略
2 rows in set (0.10 sec)
```

実行時間が 0.1 秒以上のクエリがスロークエリログに記録される。

```shell
$ cat /var/lib/mysql/4c940e44c78f-slow.log
# Query_time: 0.260382  Lock_time: 0.000107 Rows_sent: 300024  Rows_examined: 600048
SELECT *
FROM   employees
ORDER  BY birth_date, hire_date;

# Query_time: 2.622890  Lock_time: 0.000120 Rows_sent: 2844047  Rows_examined: 5688094
SELECT *
FROM   employees
JOIN   salaries
ON     employees.emp_no = salaries.emp_no;

# Query_time: 0.105410  Lock_time: 0.000109 Rows_sent: 2  Rows_examined: 300028
SELECT gender, COUNT(*) AS number_of_people
FROM   employees
GROUP  BY gender;
```

# 課題２（実装）

## 最も頻度が高くスロークエリに現れるクエリ

```shell
$ mysqldumpslow -s c -t 1 /var/lib/mysql/4c940e44c78f-slow.log

Reading mysql slow query log from /var/lib/mysql/4c940e44c78f-slow.log
Count: 1  Time=0.26s (0s)  Lock=0.00s (0s)  Rows=300024.0 (300024), root[root]@localhost
  SELECT *
  FROM   employees
  ORDER  BY birth_date, hire_date
```

## 実行時間が最も長いクエリ

```shell
$ mysqldumpslow -s t -t 1 /var/lib/mysql/4c940e44c78f-slow.log

Reading mysql slow query log from /var/lib/mysql/4c940e44c78f-slow.log
Count: 1  Time=0.26s (0s)  Lock=0.00s (0s)  Rows=300024.0 (300024), root[root]@localhost
  SELECT *
  FROM   employees
  ORDER  BY birth_date, hire_date
```

## ロック時間が最も長いクエリ

```shell
$ mysqldumpslow -s l -t 1 /var/lib/mysql/4c940e44c78f-slow.log

Reading mysql slow query log from /var/lib/mysql/4c940e44c78f-slow.log
Count: 1  Time=0.11s (0s)  Lock=0.00s (0s)  Rows=2.0 (2), root[root]@localhost
  SELECT gender, COUNT(*) AS number_of_people
  FROM   employees
  GROUP  BY gender
```

# 課題３（実装）

```sql
SELECT *
FROM   employees
ORDER  BY birth_date, hire_date;
```

上記クエリの実行が高速化するように複合インデックスを作成する。

```sql
mysql> CREATE INDEX idx_employees_birth_hire_date ON employees (birth_date, hire_date);
```

しかし、期待したような結果は得られなかった。

# 課題４（質問）

## LIMIT 1 で 1 件しか取得しないクエリでも、時間がかかる場合がある理由

MySQL では LIMIT 句は最後に実行される。
LIMIT 句以外の処理が終わった後に、LIMIT 句で指定した行数を返すに過ぎないため、処理時間は LIMIT 句以外の部分に依存する。

参考: MySQL のクエリの実行順序

1. FROM（JOIN 含む）
2. WHERE
3. GROUP BY
4. HAVING
5. WINDOW 関数
6. SELECT
7. DISTINCT
8. UNION
9. ORDER BY
10. LIMIT と OFFSET

## テーブル結合の際の WHERE での絞り込み・ON での絞り込みの違い

内部結合ではパフォーマンスに差はない。

```sql
mysql> EXPLAIN SELECT * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no WHERE gender = "M" AND birth_date > "1960-01-01";
+----+-------------+-------+------------+--------+------------------------------------------------------+---------+---------+--------------------+------+----------+-------------+
| id | select_type | table | partitions | type   | possible_keys                                        | key     | key_len | ref                | rows | filtered | Extra       |
+----+-------------+-------+------------+--------+------------------------------------------------------+---------+---------+--------------------+------+----------+-------------+
|  1 | SIMPLE      | s     | NULL       | ALL    | PRIMARY                                              | NULL    | NULL    | NULL               |    1 |   100.00 | NULL        |
|  1 | SIMPLE      | e     | NULL       | eq_ref | PRIMARY,idx_birth_date,idx_employees_birth_hire_date | PRIMARY | 4       | employees.s.emp_no |    1 |    25.00 | Using where |
+----+-------------+-------+------------+--------+------------------------------------------------------+---------+---------+--------------------+------+----------+-------------+

mysql> EXPLAIN SELECT * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no AND gender = "M" AND birth_date > "1960-01-01";
+----+-------------+-------+------------+--------+------------------------------------------------------+---------+---------+--------------------+------+----------+-------------+
| id | select_type | table | partitions | type   | possible_keys                                        | key     | key_len | ref                | rows | filtered | Extra       |
+----+-------------+-------+------------+--------+------------------------------------------------------+---------+---------+--------------------+------+----------+-------------+
|  1 | SIMPLE      | s     | NULL       | ALL    | PRIMARY                                              | NULL    | NULL    | NULL               |    1 |   100.00 | NULL        |
|  1 | SIMPLE      | e     | NULL       | eq_ref | PRIMARY,idx_birth_date,idx_employees_birth_hire_date | PRIMARY | 4       | employees.s.emp_no |    1 |    25.00 | Using where |
+----+-------------+-------+------------+--------+------------------------------------------------------+---------+---------+--------------------+------+----------+-------------+
```

ただし、外部結合では結果が異なる。
ON での絞り込みでは条件に該当しないレコードも出力されるが、WHERE での絞り込みはテーブルを結合した結果に対してフィルタリングするため、条件に該当しないレコードは出力されない。

# 課題 5（質問）

## オフセットページネーション

結果セットの開始位置と取得するレコードの数を指定してページネーションを実行する方法。

### メリット

どのページにでもすぐにジャンプすることができる。

### デメリット

指定したページに辿り着くためには、最初のレコードから OFFSET 句でスキップする必要があるため、後ろのページになるほど結果セットの取得が遅くなる。
また、レコードの追加・削除によりページがずれる恐れがある。

## カーソルベースページネーション

最後に閲覧したリソースを示すカーソルを使用してページ分割する方法。
このカーソルは通常、ID などの一意の識別子になる。ユーザが次のページを要求すると、このカーソルを使用して次の結果セットを取得する。

### メリット

クエリで OFFSET 句を使用しないため、オフセットページネーションに比べて高速になる。

### デメリット

カーソルだけを使用して特定のページにジャンプすることはできない。例えば、ページサイズが 20 の場合、ページ 400 の開始を表すカーソルがどれであるかを正確に予測することができない。これは、ユーザが特定のページに素早くアクセスする必要がある場合に問題になる可能性がある。

参考: [Pagination (Reference)](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

# 課題 6

MySQL における`long_query_time`のデフォルト値は何秒か？
