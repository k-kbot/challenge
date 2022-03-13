## 課題１（質問）
### ビューの仕組み
SELECT文を保存したもので、テーブルのフリをした（テーブルとして扱うことができる）SELECT文とも言える。
物理的にテーブルを定義しないのでデータの保持はしないが、SQL文の構文上ではテーブルと全く同じ構文で扱うことができる。

### ビューの用途・メリット
- よく使うSELECT文をビューとして定義して、再利用することができる。

- 実テーブルを隠蔽して、ユーザに必要なデータだけを必要な形で見せることができる。

- テーブルからある条件に合致したレコードのみを抽出した、仮想的なテーブルを扱うことができる。
  - 実テーブルで作成する場合は、データの整合性確保に注意をする必要があるが、ビューであれば意識する必要はない。

### ビューとマテリアライズドビューの違い
マテリアライズドビューは`実体化されたビュー`という名の通り、実データ（レコード）を保持する。
ビューというよりほとんどテーブルに近い存在である。

マテリアライズドビューは普通のテーブルと同じ扱いができることが特徴で、以下の点でビューとは異なる。
- アクセス時にSELECT文が実行されない
- 主キーをはじめとしてインデックスを作成することができる


## 課題２（実装）
### ビューの定義
昇順でソートした従業員の誕生日（重複は除く）
```sql
SELECT DISTINCT birth_date
FROM   employees
ORDER  BY birth_date;
```

上記SELECT文をビューとして定義する。
```sql
CREATE VIEW birth_date_list
AS
SELECT DISTINCT birth_date
FROM   employees
ORDER  BY birth_date;
```

### パフォーマンスの比較
- ビューを使ったデータ取得（5回平均 `0.1142886`秒）
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

- ビューと同じSELECT文でデータ取得（5回平均 `0.1158218`秒）
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

ビューを使った場合、SELECT文を2回（記述したSELECT文 + ビューのSELECT文）実行することになるので、高コストな処理になる。
今回は処理が軽かったため、実行速度にほとんど差は見られなかった。
