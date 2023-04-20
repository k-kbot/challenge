# 課題１（質問）

## ビューの仕組み

SELECT 文を保存したもので、テーブルのフリをした（テーブルとして扱うことができる）SELECT 文とも言える。
物理的にテーブルを定義しないのでデータの保持はしないが、SQL 文の構文上ではテーブルと全く同じ構文で扱うことができる。

## ビューの用途・メリット

- よく使う SELECT 文をビューとして定義して、再利用することができる。
- 実テーブルを隠蔽して、ユーザに必要なデータ・見せてもいいデータだけを提供できる。
- テーブルからある条件に合致したレコードのみを抽出した、仮想的なテーブルを扱うことができる。これにより、複雑なクエリを何回も書くことがなくなる。

##　マテリアライズドビュー

マテリアライズドビューは「実体化されたビュー」という名の通り、実データ（レコード）を保持する。
ビューというよりほとんどテーブルに近い存在である。

マテリアライズドビューは普通のテーブルと同じ扱いができることが特徴で、以下の点でビューとは異なる。

- アクセス時に SELECT 文が実行されない
- 主キーをはじめとしてインデックスを作成することができる

# 課題２（実装）

## ビューの定義

昇順でソートした従業員の誕生日（重複は除く）

```sql
SELECT DISTINCT birth_date
FROM   employees
ORDER  BY birth_date;
```

上記 SELECT 文をビューとして定義する。

```sql
CREATE VIEW birth_date_list
AS
SELECT DISTINCT birth_date
FROM   employees
ORDER  BY birth_date;
```

## パフォーマンスの比較

ビューを使ったデータ取得（5 回平均 `0.1142886`秒）

```sql
+------------+----------------------------------------------------------------------------+
| Duration   | Query                                                                      |
+------------+----------------------------------------------------------------------------+
| 0.11522350 | SELECT SQL_NO_CACHE * FROM birth_date_list                                 |
| 0.11427625 | SELECT SQL_NO_CACHE * FROM birth_date_list                                 |
| 0.11071600 | SELECT SQL_NO_CACHE * FROM birth_date_list                                 |
| 0.11479525 | SELECT SQL_NO_CACHE * FROM birth_date_list                                 |
| 0.11643200 | SELECT SQL_NO_CACHE * FROM birth_date_list                                 |
+------------+----------------------------------------------------------------------------+
```

ビューと同じ SELECT 文でデータ取得（5 回平均 `0.1158218`秒）

```sql
+------------+----------------------------------------------------------------------------+
| Duration   | Query                                                                      |
+------------+----------------------------------------------------------------------------+
| 0.11641875 | SELECT SQL_NO_CACHE DISTINCT birth_date FROM employees ORDER BY birth_date |
| 0.11607375 | SELECT SQL_NO_CACHE DISTINCT birth_date FROM employees ORDER BY birth_date |
| 0.11633550 | SELECT SQL_NO_CACHE DISTINCT birth_date FROM employees ORDER BY birth_date |
| 0.11384100 | SELECT SQL_NO_CACHE DISTINCT birth_date FROM employees ORDER BY birth_date |
| 0.11644000 | SELECT SQL_NO_CACHE DISTINCT birth_date FROM employees ORDER BY birth_date |
+------------+----------------------------------------------------------------------------+
```

ビューを使った場合、SELECT 文を 2 回（記述した SELECT 文 + ビューの SELECT 文）実行することになるので、高コストな処理になる。
今回は処理が軽かったため、実行速度にほとんど差は見られなかった。
