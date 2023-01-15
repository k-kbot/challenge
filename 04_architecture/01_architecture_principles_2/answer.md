# 課題 1

## SOLID 原則

### 単一責任の原則（SRP：Single Responsibility Principle）

```
モジュールを変更する理由はたったひとつだけであるべきである。
```

ここでのモジュールとは、いくつかの関数やデータをまとめた凝集性のあるもの、例えばクラスである。

モジュールが複数の役割を背負っているような場合、それらの役割は結合してしまう。
その結果、ある役割が変更を受けると、そのモジュールが担っている他の役割も影響を受け、不具合が生じる恐れがある。結果、ある部分が変更を受けると、予想もしない形で壊れてしまうような脆い設計になる。

### オープン・クローズドの原則（OCP：Open-Closed Principle）

```
ソフトウェアの構成要素は拡張に対しては開いていて、修正に対して閉じていなければならない。
```

言い換えると、「ソフトウェアの振る舞いは、既存の成果物を変更せず拡張できようにするべきである」ということ。

1. 拡張に対して開かれている（Open）
   モジュールの振る舞いを拡張できるという意味。アプリケーションの使用要求が変更されても、モジュールに新たな振る舞いを追加することでその変更に対処できる。

2. 修正に対して閉じている（Closed）
   モジュールの振る舞いを拡張しても、そのモジュールのソースコードやバイナリコードは全く影響を受けない。

### リスコフの置換原則（LSP：Liskov Substitution Principle）

```
派生型はその基本形と置換可能でなければならない。
```

一例として、親クラス（基本形）と子クラス（派生型）の関係がある。
子クラスが親クラスを継承するとき、それは IS - A （「である」）の関係だといわれる。「子クラスは親クラスの一種である」ということである。

### インターフェイス分離の原則（ISP：Interface Segregation Principle）

```
クライアントに、クライアントが利用しないメソッドへの依存を強制してはならない。
```

インターフェイスに用意されている利用しないプロパティやメソッドに依存してしまうと、クライアント（インターフェースの利用者）はそういったメソッドの変更の影響を受けやすくなる。
そういった不本意な結び付きをできるだけ避けるために、インターフェースはできるだけ分離しておくべきというものである。

### 依存関係逆転の原則（DIP：Dependency Inversion Principle）

```
上位のモジュールは下位のモジュールに依存してはならない。どちらのモジュールも「抽象」に依存すべきである。

「抽象」は実装の詳細に依存してはならない。実装の詳細が「抽象」に依存すべきである。
```

アプリケーションの方針に基づく重要な判断やビジネスモデルを含み、アプリケーションの存在理由を決定づけているのは上位のモジュールである。それにもかかわらず、上位モジュールが下位モジュールに依存すると、下位モジュールの変更が直接上位モジュールに影響を与え、上位モジュールまで変更を余儀なくされることになる。

ビジネスルールを担当する上位レベルのモジュールは、実装の詳細を担当している下位のモジュール
とは独立し、立場も上になるべきである。

## 単一責任の原則と、単純にファイルを細かく分解することの違い

同じ理由で変化する（変更理由が似ている）ものを集めるのが単一責任の原則である。そして、その変化を引き起こすのはアクター（システムとやり取りする外部の人や物）である。

単純にファイルを細かく分解することは、各ファイルの変更理由が考慮されていない点で、単一責任の原則とは異なる。

## リスコフの置換原則（LSP）に違反した場合、どのような不都合が生じるか？

LSP に違反している例を以下に示す。

```typescript
// 親クラス
class Rectangle {
  width = 0;
  height = 0;

  setWidth(width: number) {
    this.width = width;
  }

  setHight(height: number) {
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

// 子クラス
class Square extends Rectangle {
  setWidth(width: number) {
    super.setWidth(width);
    super.setHight(width);
  }

  setHight(height: number) {
    super.setWidth(height);
    super.setHight(height);
  }
}

const rectangle1: Rectangle = new Rectangle();
rectangle1.setWidth(3);
rectangle1.setHight(4);
console.log(rectangle1.getArea()); // => 12

const rectangle2: Rectangle = new Square();
rectangle2.setWidth(3);
rectangle2.setHight(4);
console.log(rectangle2.getArea()); // => 16
```

## インターフェースを用いる事で、設計上どのようなメリットがあるか？

- 同じインターフェースを実装する複数のクラスに、共通のメソッド群を実装するように強制できる
- あるクラスがインターフェースを実装していれば、少なくともそのインターフェースが定めたメソッドを持っていることが保証される

## どんな時に依存性の逆転を用いる必要が生じるか？

依存関係逆転の原則（DIP）を絶対のものとして守り続けるのは現実的ではない。
例えば、Java の String クラスは具象であり、ソースコードが具象の java.lang.string に依存するのは避けられないし、避けるべきでもない。
String クラスは、あらゆる局面で利用されるクラスであるため、危険な拡張を防止するために final 修飾子による継承の禁止が宣言されている。また、インスタンス化の後に内容が変化しない immutable な設計となっている。そのようなこともあり、String クラスの内容がコロコロ変わることを心配する必要はない。

このような理由から、DIP を考えるときには**OS やプラットフォーム周りは気にしないことが多い**。変化しないとみなして構わないので、こうした具象への依存は許容することにする。
依存したくないのは、システム内の変化しやすい具象要素で、開発中のモジュールや頻繁に変更され続けているモジュールがその対象になる。

## デメテルの法則

メソッドを呼び出すオブジェクトは次の 4 つに限定されるというもの。

- オブジェクト自身
- 引数として渡されたオブジェクト
- インスタンス変数
- 直接インスタンス化したオブジェクト

何かにアクセスする際には、`.`を 2 つ以上続けてはならない。`.`を続けること（メソッドチェーン）は暗黙的な依存関係を生むことになる。
何かにアクセスする処理をラッパーメソッドにすることで、メソッドチェーンで実現していたことをカプセル化・隠蔽する。将来このラッパーメソッドに変更があった場合に、メソッドチェーンに比べると変更箇所が少なくて済むというメリットがある。

# 課題 2

## [サンプルコード](https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgAoFcoIBZwM4oDeAUMsugVAJIAmAXMnmFKAOanIAOUA9jegjC0GTFiHZlmcEHkRhgPEAxJkyeAUgg0tDZuggcyCHgFtOAGwiQaAQTAMAInEgcAvsXfFQkWIhSo4AE8TCHAAJQhjKBoIzh5kFWRWKwwsXAI8ACFAhgAKCmhhRmY2AEpkAF4APjRMHHwIAG0AXQ9iYgRzfDxatIaAZWgAN2AkBI5OdAAjc1HkYxk9QR4oXO5gIecUTiCQ8MiVmIg4hgDg0LAIqKO48sJPMkmZucm+gnzKItE2ABouXn4gi+JXEd0M80UTGQcHM5lS9QylWQYGwwDwADodud9tdYjx0ckwPD0hAsoEPoUaKVwQsoTsmMSGkiYXC6iSMTBQDRcmtytUuJiAQIhDRKhUKv8+MLaMgAGSygVSGRyBQgdHqBCabRU8HAGDINb4Ilshpg1SqFG8ADuyBAEBtAFEoLxVgByQDKDIA7BkAYqqAQZVAPYMgCkGQBODIALBkAUQyAVQZAH4MgAA5X2ABTTAFnagHMGQCaDIBAf9d1PND1UAHp88hAD8xgFNFQDSRoAs30AsgyAawZAEwJgACGNweIA)の問題点

ドメインロジックである「ユーザの購入可否」の判定がユースケースのクラスにそのまま書かれていること。

## 改善策

### 性能面の改善

単に「取引が成功した過去の購入の有無」だけを判定するので、性能は向上する。
ただし、購入できる個数が 2 個以上に増えるような場合は対応できない。

```typescript
// 変更があるインターフェース, クラスのみ記載
interface PaymentRecordRepo {
  exists(userId: string, productId: string, succeed: boolean) => boolean
}

class PurchaseService {
  public constructor(private paymentRecordRepo: PaymentRecordRepo) {}

  public purchase(userId: string, productId: string) {
    if (this.paymentRecordRepo.exists(userId, productId, true)) {
      throw new Error('この商品はおひとりさま一品限定です！')
    }

    // 購入手続きに進む
  }
}
```

なお、Primsa の 2 系では exists メソッドはない。
参考: [Implementing an "exists" function](https://www.youtube.com/watch?v=ZYFhDct_cSM&list=PLn2e1F9Rfr6kpBn2TSEWzz-xrcY8Q8L-L)

## 設計面の改善

ユーザの購入可否を判定する canParchase メソッドを User クラスに定義することで、OCP に違反しない変更が可能となる。

- 購入できる個数が増減する場合、PurchaseService クラスの変更は発生せず、変更が User クラスのみに閉じる。
- 「プレミアム会員の場合は何個でも購入可能とする」という条件が追加される場合でも、変更が User クラスのみに閉じる。

```typescript
// 変更があるインターフェース, クラスのみ記載
interface PaymentRecordRepo {
  getUserBy: (userId: string) => User
  getPurchasesBy: (userId: string) => Purchase[]
}

class PurchaseService {
  public constructor(private paymentRecordRepo: PaymentRecordRepo) {}

  public execute(userId: string, productId: string) {
    const user = this.paymentRecordRepo.getUserBy(userId)

    const allPurchases = getPurchasesBy(userId: string)
    const pastPurchasesCount = allPurchases.filter((p) => p.productId === productId && p.transaction.succeeded).length

    user.canParchase(pastPurchasesCount) && purchase(userId, productId)
  }

  private purchase(userId: string, productId: string) {
    // 購入手続き
  }
}

interface UserProps {
  id: string
  name: string
  rank: 'NORMAL' | 'PREMIUM'
}

class User{
  MAX_PURCHASE_QUANTITY = 1

  public constructor(private props: UserProps) {}

  public canParchase(pastPurchasesCount: number): boolean {
    // プレミアム会員の場合は何個でも購入可能
    if (this.rank === 'PREMIUM') return true

    // プレミアム会員ではない場合は購入制限あり
    if (pastPurchasesCount > MAX_PURCHASE_QUANTITY) {
      throw new Error(`この商品はおひとりさま${this.MAX_PURCHASE_QUANTITY}品限定です！`)
    }

    return true
  }
}
```

# 課題 3

## [サンプルコード](https://www.typescriptlang.org/play?#code/MYGwhgzhAEAKCmAnCB7AdtA3gWAFDQOgAcBXAIxAEtho0wBbeALmggBdFK0BzPQ48lRrswiAOopEAay7cAgmxYARMG3h9CwdO0QlgbSQAo6jFjtkAaVm1FsJ02QuWr4ASiwb+BNgAtKEADoTeGgAXloGdXwvbz9AkXFJGR4FMOtbe2T5Nk9oAF88Atw8UEgYAGEUeiIwNABPD2iCUgpqYngUIhBmOCRUNABtAF1crTQdPQNEQyIOrp6EZHRh9xwmr19-ANnO7rSd+dyiopLtNmgtatqG8LR4AHdoSqv6wwG7x8X+wwByMB+rB9oCo1L8AEwABjBAEYALQQuEIn6uVyAh69JZoX5kAG0dEg+DgqGIuHQ5GuIauU7jc4AM0oyDYX3QaUuNXq2zm3QGEJGxVwAHoBdBAKrygEiGQDSDIA7BkAtwyADoZAMMMgHqGQDWDIB-eUAFK6ATQZANEMgH0GQCBDIBABmZGDkUsAJ0qATaVANGpgGnNQCnpoAkhkAa8qAKIZAF+KWup7GgABMXGl6YzTQEEplHDl+ULoIBVBkAfgyANQZ44ArBnlysA5gyawDqDIAzBkAIgw6lMSjOAEqjAMYMucAL2aABtM89n44AxBjwAbUYfgbAAYiQQCAAJrwUSGaEQ0dU3DB9ih4JpH70FB+yj0+B+iKMH54H0oboBEAobiGNnXdwxo-1KWAWjkVYBqFXjgBiGAt603Qc3W+0OwAyDIBITUA8QyVhuNoAgP94EAA)の問題点

Person クラスは典型的な*ドメインモデル貧血症*である。

public なフィールドは、アプリケーションのどこからでも参照・更新ができてしまう。そのため、以下のような問題が生じやすい。

- 参照: アプリケーションの成長に伴い、それらのフィールドの値を参照したドメインロジックが広範囲に散らばり、コードを追うコストが増えたり、修正漏れが発生する。
- 更新: 簡単に不正な値を設定することができるため、インスタンスの永続化の際にデータの整合性を保証することが難しくなる。

## 解決策

各フィールドのアクセス修飾子を private に変更して、それらを参照・更新する専用のメソッドを Person クラスに定義する。
そうすることで、Person クラスを見るだけで、そのクラスが持つドメインロジックを理解できるようになり、バリデーションを設けたメソッドを経由した値の更新の強制により、常に正しいインスタンスしか存在させないようにすることができる。

## getter/setter の定義では解決しない理由

- getter を使ってアプリケーションのあらゆる場所にドメインロジックを書けてしまうため。
- setter を使って不正な値を設定できてしまうため。

参考:

- ドメイン駆動設計 モデリング/実装ガイド p27 2.2.3 ドメインモデル貧血症のコードの問題点
- [ドメイン知識が漏れるとは何なのか](https://zenn.dev/praha/articles/92c6494570a4dc)
