## 課題１（質問）
- 複合インデックスの仕組み
```
複数のカラムを組み合わせたインデックスのこと。
カラムの組み合わせの順番が重要で、カーディナリティが高いカラムを先にした方が効果を得やすい。
ただし、たとえカーディナリティが高くても特定の値にデータが集中しているようなカラムは向いていない。
```

- 複合インデックスを作り直す
```
複合インデックスでは、最初に指定した列でソート、次にそのソートの中で2つ目に指定した列でソート...というデータの並びになる。
そのため、最初の列にfirst_nameを指定した複合インデックスでは、last_nameだけの検索の場合に速度向上の恩恵を受けることができない。
```

- 作り直したSQL
```sql
CREATE INDEX employees_name ON employees (last_name, first_name)
```

## 課題２（実装）

### 1. 名が`G`で始まる女性の従業員
- 使用したクエリ
```sql
SELECT SQL_NO_CACHE *
FROM   employees.employees
WHERE  first_name LIKE 'G%'
AND    gender = 'F';
```

- first_nameとgenderの複合インデックスを作成
```sql
CREATE INDEX idx_first_name_and_gender ON employees.employees(first_name,gender);
```

- 実行計画
  - typeがrange（インデックスを利用した範囲検索）となっている。
```sql
mysql> EXPLAIN SELECT SQL_NO_CACHE * FROM employees.employees WHERE first_name LIKE 'G%' AND gender = 'F';
+----+-------------+-----------+------------+-------+---------------------------+---------------------------+---------+------+-------+----------+-----------------------+
| id | select_type | table     | partitions | type  | possible_keys             | key                       | key_len | ref  | rows  | filtered | Extra                 |
+----+-------------+-----------+------------+-------+---------------------------+---------------------------+---------+------+-------+----------+-----------------------+
|  1 | SIMPLE      | employees | NULL       | range | idx_first_name_and_gender | idx_first_name_and_gender | 17      | NULL | 31140 |    50.00 | Using index condition |
+----+-------------+-----------+------------+-------+---------------------------+---------------------------+---------+------+-------+----------+-----------------------+
1 row in set, 2 warnings (0.01 sec)
```

### 2. 姓が"Sullins"または"Vernadat"で1980年代に雇用された従業員
- 使用したクエリ
```sql
SELECT SQL_NO_CACHE *
FROM   employees.employees
WHERE  last_name IN('Sullins','Vernadat')
AND    hire_date LIKE '198%';
```

- last_nameとhire_dateに複合インデックスを作成
```sql
CREATE INDEX idx_last_name_and_hire_date ON employees.employees(last_name,hire_date);
```

- 実行計画
  - typeがrange（インデックスを利用した範囲検索）となっている。
```sql
mysql> EXPLAIN SELECT SQL_NO_CACHE * FROM employees.employees WHERE last_name IN('Sullins','Vernadat') AND hire_date LIKE '198%';
+----+-------------+-----------+------------+-------+-----------------------------+-----------------------------+---------+------+------+----------+-----------------------+
| id | select_type | table     | partitions | type  | possible_keys               | key                         | key_len | ref  | rows | filtered | Extra                 |
+----+-------------+-----------+------------+-------+-----------------------------+-----------------------------+---------+------+------+----------+-----------------------+
|  1 | SIMPLE      | employees | NULL       | range | idx_last_name_and_hire_date | idx_last_name_and_hire_date | 18      | NULL |  378 |    11.11 | Using index condition |
+----+-------------+-----------+------------+-------+-----------------------------+-----------------------------+---------+------+------+----------+-----------------------+
1 row in set, 3 warnings (0.00 sec)
```

### 3. 姓が`A`で始まる1960年生まれの男性の従業員
- 使用したクエリ
```sql
SELECT SQL_NO_CACHE * 
FROM   employees.employees
WHERE  last_name LIKE 'A%'
AND    birth_date LIKE '1960%'
AND    gender = 'M';
```

- birth_dateにインデックス作成
```sql
CREATE INDEX idx_last_name_and_birth_date_and_gender ON employees.employees(last_name,birth_date,gender);
```


- 実行計画
  - typeがrange（インデックスを利用した範囲検索）となっている。
```sql
mysql> EXPLAIN SELECT SQL_NO_CACHE *  FROM   employees.employees WHERE  last_name LIKE 'A%' AND    birth_date LIKE '1960%' AND    gender = 'M';
+----+-------------+-----------+------------+-------+-----------------------------------------+-----------------------------------------+---------+------+-------+----------+-----------------------+
| id | select_type | table     | partitions | type  | possible_keys                           | key                                     | key_len | ref  | rows  | filtered | Extra                 |
+----+-------------+-----------+------------+-------+-----------------------------------------+-----------------------------------------+---------+------+-------+----------+-----------------------+
|  1 | SIMPLE      | employees | NULL       | range | idx_last_name_and_birth_date_and_gender | idx_last_name_and_birth_date_and_gender | 18      | NULL | 19718 |     5.56 | Using index condition |
+----+-------------+-----------+------------+-------+-----------------------------------------+-----------------------------------------+---------+------+-------+----------+-----------------------+
1 row in set, 3 warnings (0.00 sec)
```

## 課題3（クイズ）
- 

- 

- 