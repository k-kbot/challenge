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
SELECT *
FROM   employees
ORDER  BY birth_date;
```

```sql
SELECT *
FROM   employees
JOIN   salaries
ON     employees.emp_no = salaries.emp_no;
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
root@7020b185d4b1:/# cat /var/lib/mysql/7020b185d4b1-slow.log

Time                 Id Command    Argument
# Time: 2021-06-29T03:46:09.433035Z
# User@Host: root[root] @ localhost []  Id:     3
# Query_time: 0.139441  Lock_time: 0.000091 Rows_sent: 300024  Rows_examined: 300024
SET timestamp=1624938369;
SELECT * FROM employees;
# Time: 2021-06-29T03:46:52.542420Z
# User@Host: root[root] @ localhost []  Id:     3
# Query_time: 0.220781  Lock_time: 0.000117 Rows_sent: 300024  Rows_examined: 600048
SET timestamp=1624938412;
SELECT * FROM employees ORDER BY birth_date;
# Time: 2021-06-29T03:48:47.261628Z
# User@Host: root[root] @ localhost []  Id:     3
# Query_time: 3.101893  Lock_time: 0.000154 Rows_sent: 2844047  Rows_examined: 5688094
SET timestamp=1624938527;
SELECT * FROM employees JOIN salaries ON employees.emp_no = salaries.emp_no;
```
