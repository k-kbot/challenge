## 課題 1

### チーム開発で lint を使うべき理由

- コンパイラでチェックされないバグの要因になりそうなコードを検出することで、システムの品質の向上が期待できる。
- スタイルの不揃いなコードを検出することで、コードレビューにおいて指摘する手間を省くことができる。
  - 基本的なコードの書き方を指摘するのは、指摘する方もされる方もあまり良い気持ちにはならない。

### ESLint の重要なルール

- semi
  - 文の末尾のセミコロン有無を強制する。
- quotes
  - 文字列（String）を定義する際に`'`, `"`, `` ` ``のいずれかを一貫して使用することを強制する。
- indent
  - インデントに一貫してタブまたは半角スペース（とその数）を使用することを強制する。

上記は好みが分かれるところであるため、レビュー等での水掛け論を防ぐためにもルールにするべきと考える。

- no-var

  - `var`ではなく`const`, `let`での変数宣言を強制する。

- max-depth
  - ネストの最大の深さを指定する。
    - ネストが深くなるほど、コードの理解が難しくなるため。

### eslint-config-airbnb の導入

[導入したリポジトリ](https://github.com/k-kbot/challenge_setting_eslint)

#### ESLint をローカルインストール

```shell
$ npm i -D eslint
```

#### ESLint の初期設定

```shell
$ npx eslint --init

# 対話式で設定する
✔ How would you like to use ESLint? · style
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · react
✔ Does your project use TypeScript? · No / Yes # Noを選択
✔ Where does your code run? · browser
✔ How would you like to define a style for your project? · guide
✔ Which style guide do you want to follow? · airbnb # airbnbを選択
✔ What format do you want your config file to be in? · JavaScript
Checking peerDependencies of eslint-config-airbnb@latest
The config that you've selected requires the following dependencies:

eslint-plugin-react@^7.28.0 eslint-config-airbnb@latest eslint@^7.32.0 || ^8.2.0 eslint-plugin-import@^2.25.3 eslint-plugin-jsx-a11y@^6.5.1 eslint-plugin-react-hooks@^4.3.0
✔ Would you like to install them now? · No / Yes # Yesを選択
✔ Which package manager do you want to use? · npm
```

#### ESLint の実行

以下の内容の`index.js`を用意する。

```js
console.log("Hello, world");
```

この`index.js`に対して、ESLint を実行すると、ルール違反を検出できる。

```shell
$ npx eslint index.js

  1:1   warning  Unexpected console statement  no-console
  1:13  error    Strings must use singlequote  quotes

✖ 2 problems (1 error, 1 warning)
  1 error and 0 warnings potentially fixable with the `--fix` option.
```

## 課題 2

### pre-commit hook の作成

[作成した PR](https://github.com/k-kbot/challenge_setting_eslint/pull/1)

- [husky](https://github.com/typicode/husky)
  - Git の commit または push 時に、処理をフックするツール
- [lint-staged](https://github.com/okonet/lint-staged)
  - Git のステージングされたファイルに対して linter を実行するツール

上記のツールをローカルインストールする。

```shell
$ npm i -D husky lint-staged
```

husky を初期化する。

```shell
$ npx husky-init
```

husky の初期化によって作成された`.husky/pre-commit`に、pre-commit 時に実行するコマンドを記載する。

```diff
  #!/usr/bin/env sh
  . "$(dirname -- "$0")/_/husky.sh"

- npm run test
+ npm run lint-staged
```

package.json に、`index.js`を対象に`eslint --fix`する設定を記載する。

```json
  "scripts": {
    "prepare": "husky install",
    "lint-staged": "lint-staged"
  },

  # 略

  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "index.js": [
      "eslint --fix"
    ]
  }
```

### pre-commit hook の問題点

- ローカルでの Git の commit 時にオプション`--no--verify`を指定すると、pre-commit hook を無視できてしまう。
- GitHub でマージコンフリクトを解決する際に使用するエディタを使うと、ローカルの pre-commit hook は作用しない。そのため、ESLint のルールに違反したコードがリモートリポジトリに混入する恐れがある。
