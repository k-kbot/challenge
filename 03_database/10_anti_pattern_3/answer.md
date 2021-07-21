## 課題１
### どんな問題が生じるか？
#### 参照整合性が保たれない
Commentテーブルの`belongs_to_id`には外部キー制約が設定されていないため、Manga, Novelテーブルに存在しないidを格納できてしまう。
そのため、DBの制約で参照整合性を保証することができず、関連付けの管理がアプリケーション側に依存することになる。

## 課題２
### 解決策1
#### Commentテーブルと各親テーブルの中間テーブルを作成する
Manga, Novelテーブルそれぞれに対応した中間テーブルを作成し、各中間テーブルでCommnetテーブルへの外部キー制約に加えて、Manga, Novelテーブルにも同じく外部キー制約を設定する。
外部キー制約により参照整合性が保証される。

#### ER図
```plantuml
@startuml
hide circle

entity Manga {
  * id: varchar
  --
  name: varchar
}
entity Novel {
  * id: varchar
  --
  name: varchar
}
entity Comment {
  * id: number
  --
  text: varchar
}
entity Manga_comment_relations {
  * id: varchar
  --
  * manga_id: varchar <<FK>>
  * comment_id: varchar <<FK>>
}
entity Novel_comment_relations {
  * id: varchar
  --
  * novel_id: varchar <<FK>>
  * comment_id: varchar <<FK>>
}
Manga ||-ri-o{ Manga_comment_relations
Manga_comment_relations }o-ri-|| Comment
Comment ||-ri-o{ Novel_comment_relations
Novel_comment_relations }o-ri-|| Novel
@enduml
```

### 解決策2
#### Manga, Novel, Commentの共通の親テーブルを作成する
全ての親テーブルを継承するBookテーブル（基底テーブル）を使うことで、外部キーにより参照整合性を保証できる。

#### ER図
```plantuml
@startuml
hide circle

entity Manga {
  * id: varchar
  --
  * book_id: varchar
  name: varchar
}
entity Novel {
  * id: varchar
  --
  * book_id: varchar
  name: varchar
}
entity Book {
  * id: varchar
}
entity Comment {
  * id: number
  --
  * book_id: varchar
  text: varchar
}
Manga |o--|| Book
Novel |o--|| Book
Book ||--o{ Comment
@enduml
```

### 解決策3
#### 各親テーブルに対して1つのCommentテーブルを作成する
Commnetテーブルを分割して、Mangaテーブルに紐付くMangaCommentテーブル、Novelテーブルに紐付くNovelCommentテーブルをそれぞれ作成する。
Manga, Novelテーブルにそれぞれ外部キー制約を設定することで、参照整合性が保証される。

#### ER図
```plantuml
@startuml
hide circle

entity Manga {
  * id: varchar
  --
  name: varchar
}
entity Novel {
  * id: varchar
  --
  name: varchar
}
entity Manga_comment {
  * id: number
  --
  * manga_id: varchar <<FK>>
  text: varchar
}
entity Novel_comment {
  * id: number
  --
  * novel_id: varchar <<FK>>
  text: varchar
}

Manga ||--o{ Manga_comment
Novel ||--o{ Novel_comment
@enduml
```
