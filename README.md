## 手順
1. git clone
2. cd frontend
3. npm i
4. npm run build
5. cd /backend
6. awsログイン
7. cdk deploy
8. 環境変数控え
9. .envに追記
10. cd frontend && npm run build
11. cdk deploy

## ユーザー作成
- コンソールで作成もしくは以下のファイルを追加、実行
```=typescript
const AWS = require('aws-sdk');
AWS.config.update({region: '【リージョン】'}); // リージョンを適切に設定してください

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const userParams = {
  UserPoolId: '【UserPoolId】', // ユーザープールIDを設定します
  Username: '【ユーザ名】', // 新規ユーザーのユーザー名
  DesiredDeliveryMediums: ['EMAIL'], // どのメディア（EMAIL または SMS）を使用してユーザーに一時パスワードを送信するか
  UserAttributes: [ // 必要な属性を設定します
    {
      Name: 'email',
      Value: '【メールアドレス】'
    }
  ]
};

cognitoidentityserviceprovider.adminCreateUser(userParams, function(err, data) {
  if (err) {
    console.log(err, err.stack); // エラーハンドリング
  } else {
    console.log(data); // 成功時のレスポンス
  }
});

```
