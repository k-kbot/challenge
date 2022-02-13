## 課題１（実装）
### スロークエリログの有効化
```sql
mysql> set global slow_query_log = ON;
```

### 実行に0.1秒以上かかったクエリをスロークエリログに記録する
```sql
mysql> set global long_query_time = 0.1;
```


### 実行時間0.1秒以下のクエリ
```sql
mysql> SELECT COUNT(*)
    -> FROM   employees;
+----------+
| COUNT(*) |
+----------+
|   300024 |
+----------+
1 row in set (0.03 sec)
```

```sql
mysql> SELECT DISTINCT gender
    -> FROM   employees;
+--------+
| gender |
+--------+
| F      |
| M      |
+--------+
2 rows in set (0.07 sec)
```

```sql
mysql> SELECT *
    -> FROM   employees
    -> WHERE  emp_no = '10001';
+--------+------------+------------+-----------+--------+------------+
| emp_no | birth_date | first_name | last_name | gender | hire_date  |
+--------+------------+------------+-----------+--------+------------+
|  10001 | 1953-09-02 | Georgi     | Facello   | M      | 1986-06-26 |
+--------+------------+------------+-----------+--------+------------+
1 row in set (0.00 sec)
```

### 実行時間が0.1秒より長いクエリ
```sql
SELECT *
FROM   employees;
```

```sql
SELECT DISTINCT birth_date
FROM   employees
ORDER  BY birth_date;
```

```sql
SELECT gender, COUNT(*) AS number_of_people
FROM   employees
GROUP  BY gender;
```

### スロークエリログの保存先
```sql
mysql> show variables like 'slow_query_log_file';
+---------------------+--------------------------------------+
| Variable_name       | Value                                |
+---------------------+--------------------------------------+
| slow_query_log_file | /var/lib/mysql/7020b185d4b1-slow.log |
+---------------------+--------------------------------------+
1 row in set (0.00 sec)
```

### スロークエリログの内容
```shell
root@ae9a7175c83d:/# cat /var/lib/mysql/ae9a7175c83d-slow.log
mysqld, Version: 5.7.24 (MySQL Community Server (GPL)). started with:
Tcp port: 3306  Unix socket: /var/run/mysqld/mysqld.sock
Time                 Id Command    Argument
# Time: 2021-06-30T04:47:06.719290Z
# User@Host: root[root] @ localhost []  Id:     3
# Query_time: 0.234641  Lock_time: 0.000158 Rows_sent: 179973  Rows_examined: 300024
use employees;
SET timestamp=1625028426;
SELECT *
FROM   employees
WHERE  gender = 'M';
# Time: 2021-06-30T04:49:01.667925Z
# User@Host: root[root] @ localhost []  Id:     3
# Query_time: 0.116124  Lock_time: 0.002800 Rows_sent: 4750  Rows_examined: 309524
SET timestamp=1625028541;
SELECT DISTINCT birth_date
FROM   employees
ORDER  BY birth_date;
# Time: 2021-06-30T04:49:09.415243Z
# User@Host: root[root] @ localhost []  Id:     3
# Query_time: 0.101278  Lock_time: 0.000137 Rows_sent: 2  Rows_examined: 300028
SET timestamp=1625028549;
SELECT gender, COUNT(*) AS number_of_people
FROM   employees
GROUP  BY gender;
```

## 課題２（実装）

- 最も頻度が高くスロークエリに現れるクエリ
```shell
mysqldumpslow -s c -t 1 [log_file ...]
```

- 実行時間が最も長いクエリ
```shell
mysqldumpslow -s t -t 1 [log_file ...]
```

- ロック時間が最も長いクエリ
```shell
mysqldumpslow -s l -t 1 [log_file ...]
```

## 課題３（実装）
### 最も頻度が高くスロークエリに現れるクエリ
- クエリの取得
```shell
root@ae9a7175c83d:/# mysqldumpslow -s c -t 1 /var/lib/mysql/ae9a7175c83d-slow.log

Reading mysql slow query log from /var/lib/mysql/ae9a7175c83d-slow.log
Count: 1  Time=0.00s (0s)  Lock=0.00s (0s)  Rows=0.0 (0), 0users@0hosts
  mysqld, Version: N.N.N (MySQL Community Server (GPL)). started with:
  # Time: N-N-30T04:N:N.719290Z
  # User@Host: root[root] @ localhost []  Id:     N
  # Query_time: N.N  Lock_time: N.N Rows_sent: N  Rows_examined: N
  use employees;
  SET timestamp=N;
  SELECT *
  FROM   employees
  WHERE  gender = 'S'

```
※なぜか`WHERE  gender = 'M'`が`WHERE  gender = 'S'`に化けている。

- 高速化するインデックスの作成
```sql
CREATE INDEX idx_gender ON employees(gender);
```

### 実行時間が最も長いクエリ
- クエリの取得
```shell
root@ae9a7175c83d:/# mysqldumpslow -s t -t 1 /var/lib/mysql/ae9a7175c83d-slow.log

Reading mysql slow query log from /var/lib/mysql/ae9a7175c83d-slow.log
Count: 1  Time=0.11s (0s)  Lock=0.00s (0s)  Rows=4750.0 (4750), root[root]@localhost
  SELECT DISTINCT birth_date
  FROM   employees
  ORDER  BY birth_date

```

- 高速化するインデックスの作成
```sql
CREATE INDEX idx_birth_date ON employees(birth_date);
```

### インデックス作成後の実行速度計測
- どちらも高速化されており、実行速度（下表の`Duration` 単位は`秒`）は0.1を下回っている。
```sql
mysql> SHOW PROFILES;
+----------+------------+-------------------------------------------------------------------------------+
| Query_ID | Duration   | Query                                                                         |
+----------+------------+-------------------------------------------------------------------------------+
|        1 | 0.04961000 | SELECT gender, COUNT(*) AS number_of_people FROM employees GROUP BY gender    |
|        2 | 0.04858275 | SELECT DISTINCT birth_date FROM employees ORDER BY birth_date                 |
+----------+------------+-------------------------------------------------------------------------------+
```

## 課題４（質問）
### LIMIT 1で1件しか取得しないクエリでも、時間がかかる場合がある理由

MySQLではLIMIT句は最後に実行される。
LIMIT句以外の処理が終わった後に、LIMIT句で指定した行数を返すに過ぎないため、処理時間はLIMIT句以外の部分に依存する。
```
【参考】MySQLのクエリの実行順序
1. FROM（JOIN含む）
2. WHERE
3. GROUP BY
4. HAVING
5. WINDOW関数
6. SELECT
7. DISTINCT
8. UNION
9. ORDER BY
10. LIMIT と OFFSET
```
### WHEREでの絞り込み・ONでの絞り込みの違い
実行速度（Duration 単位: 秒）を比較したところ、大差はなかった。
出力結果は同じとなった。
```
+------------+--------------------------------------------------------------------------------------------------------------------------------+
| Duration   | Query                                                                                                                          |
+------------+--------------------------------------------------------------------------------------------------------------------------------+
| 3.98456200 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no WHERE gender = "M" AND birth_date > "1960-01-01" |
| 3.97244550 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no WHERE gender = "M" AND birth_date > "1960-01-01" |
| 4.02828675 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no WHERE gender = "M" AND birth_date > "1960-01-01" |
| 3.90722400 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no WHERE gender = "M" AND birth_date > "1960-01-01" |
| 3.99262550 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no WHERE gender = "M" AND birth_date > "1960-01-01" |
+------------+--------------------------------------------------------------------------------------------------------------------------------+
平均 3.97702875

+------------+--------------------------------------------------------------------------------------------------------------------------------+
| Duration   | Query                                                                                                                          |
+------------+--------------------------------------------------------------------------------------------------------------------------------+
| 3.99213125 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no AND gender = "M" AND birth_date > "1960-01-01"   |
| 3.98561350 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no AND gender = "M" AND birth_date > "1960-01-01"   |
| 4.39750875 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no AND gender = "M" AND birth_date > "1960-01-01"   |
| 4.38617325 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no AND gender = "M" AND birth_date > "1960-01-01"   |
| 3.99720850 | SELECT SQL_NO_CACHE * FROM employees e JOIN salaries s ON e.emp_no = s.emp_no AND gender = "M" AND birth_date > "1960-01-01"   |
+------------+--------------------------------------------------------------------------------------------------------------------------------+
平均 4.15172705
```

上記のように内部結合では出力結果に違いはなかったが、外部結合では結果が異なる。
ONでの絞り込みでは条件に該当しないレコードも出力されるが、WHEREでの絞り込みはテーブルを結合した結果に対してフィルタリングするため、条件に該当しないレコードは出力されない。


## 課題５
- デフォルトの`long_query_time`は何秒か？
