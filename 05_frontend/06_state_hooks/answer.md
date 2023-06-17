## 課題 1

### フックのメリット

コンポーネント内の状態とロジックをフックに切り出せる。
これによって、コンポーネントのコードをきれいに保つことができ、コードの再利用性を高めることができる。

また、従来は state やライフサイクルメソッドは記述が冗長になりやすいクラスコンポーネントしか持つことができなかった。しかし、それらのクラスコンポーネントはフックによって関数コンポーネントでシンプルに記述できるようになった。

### 外部フック

[useToggle(useBoolean)](https://github.com/streamich/react-use/blob/master/docs/useToggle.md)
bool 値の反転や`true`/`false`への更新をシンプルに記述することができる。

[demo](https://codesandbox.io/s/focused-sammet-brw2d)

## 課題 2

以下に作成しました。
https://codesandbox.io/s/ecstatic-shaw-mlzj96

## 課題 3

### Presentational and Container Components

React 開発チームの Dan Abramov が提唱した、見た目と振る舞いを分離するためのデザインパターン。

これらを分離することで、それぞれの責務を明確に分けることができ、またテストやデバッグが容易になりコードの保守性が高まる。

[参考: Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

### Controlled Components and Uncontrolled Conponents

#### Controlled Components

コンポーネント単位で状態管理が行われているコンポーネントのこと。
状態管理している値を必要なタイミングで Web API に送信する。

#### Uncontrolled Components

input 要素などの入力要素が、ブラウザネイティブ機能として保持している値をフォーム送信時に参照することを想定して実装されたコンポーネントのこと。
送信時に参照するため、Controlled Components のように useState などで値を管理する必要がなく、送信時に ref を経由して DOM の値を参照する。そのため value と onChange の指定はない。useState で行っていた初期値指定は、defaultValue という Props で設定することができる。

## 課題 4

以下に useState を使った 2 パターンのインクリメントカウンタがある。
どのような振る舞いの違いがあるか？

```javascript
// 1️⃣
const [count, setCount] = useState(0);
const increment = () => setCount(count + 1);

// 2️⃣
const [count, setCount] = useState(0);
const increment = () => setCount((previousCount) => previousCount + 1);
```
