# 課題1
## エンティティ
マイナンバーは、日本国民を識別するための一意な番号である。

マイナンバーを持つ任意の日本国民が、その属性（氏名・住所など）を変更したとしても、同一人物と扱われる。

このように、属性ではなく同一性によって識別されるオブジェクトをエンティティという。

## 値オブジェクト（バリューオブジェクト）
日本国民は、同姓同名の人が複数存在する場合があるので、氏名では同一性を判断できない。

このように同じ値でも同一性を判断できないオブジェクトを値オブジェクトという。

## 集約
「必ず守りたい強い整合性を持ったオブジェクトのまとまり」のこと。

## ユビキタス言語
プロジェクト全体を通して、会話やドキュメント、そしてコードにさえも利用される言語のこと。ユビキタスは「いつでも、どこでも」という意味がある。

## 境界づけられたコンテキスト
例として、企業の「採用選考」というモデルを考える。

雇用者は、採用選考を実施できるが応募はできない、各選考ステップで合格を出すことはできるが辞退はできない。

逆に候補者は、採用選考に応募できるが実施できない、各選考ステップで辞退できるが自ら合格を出すことはできない。

このように、一方においては有用でありながらもう一方にとっては無意味な振る舞いが、一つのモデルに混在することとなる。システムが大規模になればなるほど、統一したモデルを作ることは現実的ではなくなる。

このようなとき、「雇用者にとっての」採用選考と「候補者にとっての」採用選考というように同じ言葉でも文脈（コンテキスト）によって異なるのであればそれを分割し、それぞれの領域でモデルの統一を目指す。こうして分けられた領域を**境界付けられたコンテキスト**という。

## ドメイン
ドメインは領域を意味する単語で、ソフトウェア開発の文脈上で利用されるドメインは、ソフトウェアを適用しようとする対象の領域のことを指す。

ドメインに含まれるのは「モノ」に限らず、起きうる事象や概念も含まれる。

## ドメインサービス
ドメインサービスは、集合に対する操作などの「モデルをオブジェクトとして表現として無理があるもの」の表現に用いる。

よく使われるのはユーザーのメールアドレスを更新する際の重複チェックで、「指定されたメールアドレスはすでに使われているか？」と尋ねたいとき、その知識を1つのユーザオブジェクト自身が答えられる、とするのは無理がある。自分自身のメールアドレスを知っていても、他のオブジェクトの状況については情報を持っていないためである。こういう場合に、ドメインサービスを使用する。

極力エンティティと値オブジェクトで実装するようにして、どうしても避けられない時にのみドメインサービスを使うようにする。ドメインサービスは手続き的になるので、従来の「ビジネスロジック層」の感覚で書いてしまう。そうすると、結局従来のようなファットなクラスが異なるレイヤーに現れただけ、という結果になってしまう。

## リポジトリ
リポジトリは「集約単位で永続化のインタフェースを提供するもの」。集約単位で、という制約を付けている理由は、強い整合性が求められるオブジェクトについて、ひとまとまりで整合性を確実に確保するため。

リポジトリは、インタフェースがドメイン層、その実装クラスがインフラ層になる。これにより、ドメイン層は永続化手段（DBやO/Rマッパの種類、テーブル構造など）に関して一切知識を持たなくなり、純粋にドメイン知識だけに集中できるようになる。

## アプリケーションサービス（ユースケース層と呼ばれることも）
ソフトウェア開発の文脈で語られる**サービス**は、クライアントのために何かを行うオブジェクトのことである。

DDDにおけるサービスは大きく分けて2つあり、ひとつがドメインのためのサービス（ドメインサービス）で、もうひとつがアプリケーションのためのサービス（アプリケーションサービス）である。

アプリケーションサービスを端的に表現するならば、ユースケースを実現するオブジェクトである。

例えばユーザ登録の必要なシステムにおいて、ユーザ機能を実現するには「ユーザを登録する」ユースケースや「ユーザ情報を変更する」ユースケースが必要であるため、ユーザ機能のアプリケーションサービスはそれらの振る舞いが定義される。

## CQRS
Command Query Responsibility Segregation（コマンドクエリ責務分離）の略で、「参照に使用するモデルと更新に使用するモデルを分離する」というアーキテクチャのこと。

コマンドとクエリを分離するアーキテクチャパターンであるCQS（Command Query Separation）が元になっている。

- コマンド（Write）
    - オブジェクトの状態を変更するメソッドは、値を戻してはいけない。戻り値の型はvoidである。
- クエリ（Read）
    - メソッドが型や値を戻す場合、オブジェクトの状態を変更してはいけない。

## DTO
オブジェクト指向プログラミングにおけるデザインパターンの一つで、関連するデータを1つにまとめたオブジェクトのこと。

必要に応じて、それらのデータを読み書きするためのメソッド（getter / setter）を定義することがある。
