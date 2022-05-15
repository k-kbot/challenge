## 課題 1

### 一定期間で一定数以上、フロントエンドの WEB アプリケーションがクラッシュしていたら、開発者に Slack で知らせる

Sentry, Bugsnag, New Relic, Rollbar 等のエラー監視ツールを使うと良い。

### フロントエンドで何らかのエラーが発生したら、直前までユーザが実施した作業手順、ブラウザの実行環境等の情報を付与して開発者に通知する

[Datadog Real User Monitoring（RUM）](https://www.datadoghq.com/ja/product/real-user-monitoring/)によりできると思われる。

#### Real User Monitoring（RUM）

ブラウザ上など、サービス利用者の利用者側で観測を行う取り組み、あるいはその手法のこと。
利用環境・利用端末などを含め実際のサービス利用者のリアルな状況をもとに利用体験を観測できる。

### バックエンドのアプリケーションが（メモリ不足などの理由で）クラッシュしたら、自動的にアプリケーションを再起動しつつ、開発者に Slack で知らせる

アプリケーションの実行環境が Amazon EC2 のインスタンスである場合、Amazon CloudWatch でインスタンスを自動的に再起動するアラームを作成できる。
[参考: インスタンスを停止、終了、再起動、または復旧するアラームを作成する](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/UsingAlarmActions.html)
[参考: EC2 インスタンスを自動的に復旧するように CloudWatch のアラームを設定するにはどうすればよいですか？](https://aws.amazon.com/jp/premiumsupport/knowledge-center/automatic-recovery-ec2-cloudwatch/)

また、Amazon SNS, AWS Chatbot を組み合わせることで、アラームを Slack 通知することができる。
[参考: Slack と AWS Chatbot で ChatOps をやってみよう](https://aws.amazon.com/jp/builders-flash/202006/slack-chatbot/?awsf.filter-name=*all)

### API からのレスポンスタイムが 5 秒以上かかっているエンドポイントを可視化する。もし 5 秒以上かかっているレスポンスが全体の 1 割を超えたら開発者に Slack で知らせる

[Datadog APM](https://www.datadoghq.com/ja/product/apm/)によりできると思われる。

#### Application Performance Monitoring(APM)

アプリケーションのパフォーマンス（処理の所要時間、応答時間）を計測・監視する取り組みや手法のこと。
パフォーマンスを継続的に観測することで、見落としがちなユーザー体感速度の変化を追跡し改善しやすくなる。

### データベースのスロークエリを可視化して、レスポンスに 5 秒以上かかるクエリがある場合は開発者に Slack で知らせる

Amazon RDS でスロークエリを出力する設定にして、CloudWatch, SNS, Chatbot を組み合わせることで Slack 通知できる。

### WEB アプリケーションを安定稼働させるため、監視しておいた方が良いメトリクス

- 標準的なシステムメトリクス
  - CPU 使用率
  - メモリ使用率
  - ディスク使用率
- スループット
  - 一定期間内にシステムに流れる仕事の量
- エラー率
  - リクエストの総数に対するエラー数の割合
- レイテンシ
  - 特定のアクションが完了するまでの時間を測定したもの
