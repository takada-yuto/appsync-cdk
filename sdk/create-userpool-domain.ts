const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1' }); // リージョンを適切に設定してください
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const userParams = {
  UserPoolId: process.env.NEXT_USERPOOL_ID, // ユーザープールIDを設定します
  Username: process.env.NEXT_NAME, // 新規ユーザーのユーザー名
  DesiredDeliveryMediums: ['EMAIL'], // どのメディア（EMAIL または SMS）を使用してユーザーに一時パスワードを送信するか
  UserAttributes: [
    // 必要な属性を設定します
    {
      Name: 'email',
      Value: process.env.NEXT_EMAIL,
    },
  ],
};

cognitoidentityserviceprovider.adminCreateUser(
  userParams,
  function (err, data) {
    if (err) {
      console.log(err, err.stack); // エラーハンドリング
    } else {
      console.log(data); // 成功時のレスポンス
    }
  }
);

// ユーザープールのドメインを作成します
const domainParams = {
  UserPoolId: process.env.NEXT_USERPOOL_ID, // ユーザープールIDを設定します
  Domain: 'appsync-playground-' + Math.random().toString(36).substring(2, 15), // 作成するドメイン名
};

console.log('UserPoolDomain:', domainParams.Domain);

cognitoidentityserviceprovider.createUserPoolDomain(
  domainParams,
  function (err, data) {
    if (err) {
      console.log(err, err.stack); // エラーハンドリング
    } else {
      console.log(data); // 成功時のレスポンス
    }
  }
);
