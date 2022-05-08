## 課題 1

### expand and contract pattern

変更を拡張・移行・縮小のフェーズに分割することで、広報互換性のない変更を安全に実装するためのパターンである。

具体的な手順は以下の通り。

1. 新しいスキーマを作成する。
2. 元のスキーマと新しいスキーマの両方に対してデータを更新（insert, update, delete）するように、アプリケーションを変更する。データの参照（select）は元のスキーマからのみ行う。
3. 新しいスキーマを作成するまでに元のスキーマが保持していたデータを、新しいスキーマにコピーする。
4. 新しいスキーマに対してテストをする。
5. データの参照を元のスキーマから新しいスキーマに切り替える。
6. 新しいスキーマが期待通りに機能していることを確認したら、元のスキーマへの更新を止める。
7. 元のスキーマを削除する。

[参考: Using the expand and contract pattern | Prisma's Data Guide](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern)
[参考: ParallelChange](https://martinfowler.com/bliki/ParallelChange.html)

### NOT NULL 制約を追加する場合の注意点

NULL があるカラムに対して NOT NULL 制約を追加する場合、以下のようにエラーになる。

```sql
mysql> SELECT version();
+-----------+
| version() |
+-----------+
| 5.7.24    |
+-----------+
1 row in set (0.00 sec)

mysql> SELECT EXISTS (SELECT * FROM employees WHERE birth_date IS NULL);
+-----------------------------------------------------------+
| EXISTS (SELECT * FROM employees WHERE birth_date IS NULL) |
+-----------------------------------------------------------+
|                                                         1 |
+-----------------------------------------------------------+
1 row in set (0.00 sec)

mysql> ALTER TABLE employees MODIFY COLUMN birth_date date NOT NULL;
ERROR 1138 (22004): Invalid use of NULL value
```

このため、NULL がなくなるように何か値を入れてから ALTER 文を実行すると良い。

## 課題 2

ペアとユーザが、1 対多から多対多の関係になるようにするための手順を記載する。

- ペアとユーザの中間テーブルを作成するマイグレーションを実行する
  - pair_id と user_id の複合ユニーク制約を付ける
- 中間テーブルにデータを移行する
  - ```sql
    INSERT INTO 中間テーブル(pair_id, user_id) SELECT pair_id, user_id FROM users;
    ```
  - 複合ユニーク制約に違反した場合は、データのメンテナンスをする
- 中間テーブルを参照・更新するようにアプリケーションを変更する
- 変更後のアプリケーションが想定通りの動作をしていることを確認でき次第、users テーブルから pair_id を削除するマイグレーションを実行する
  - 想定外の動作の場合、直ちに前 version のアプリケーションをデプロイし、データのリカバリを行う
