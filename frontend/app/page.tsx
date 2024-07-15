'use client';
import { Header } from '@/components/Header';
import { TodoScreen } from '@/components/Todo/Screen';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client';
import { Amplify, Auth } from 'aws-amplify';
import { createAuthLink } from 'aws-appsync-auth-link';
import awsconfig from './aws-exports';
import awsconfiglocal from './aws-exports-local';
import { useEffect, useState } from 'react';

// ローカル環境かどうかを判断する関数
function isLocalEnvironment() {
  // ブラウザ環境でのみ window が定義されているかを確認
  return (
    typeof window !== 'undefined' &&
    window.location.hostname.startsWith('localhost')
  );
}

// Amplifyの設定
if (isLocalEnvironment()) {
  Amplify.configure(awsconfiglocal);
} else {
  Amplify.configure(awsconfig);
}

const authConfig = {
  url: process.env.NEXT_PUBLIC_APPSYNC_API_URL,
  region: 'ap-northeast-1',
  auth: {
    type: 'AMAZON_COGNITO_USER_POOLS',
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken(),
  },
};

const link = ApolloLink.from([
  // @ts-ignore
  createAuthLink(authConfig),
  createHttpLink({ uri: authConfig.url }),
]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link,
});

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    // ログインチェック
    Auth.currentAuthenticatedUser()
      .then((user) => {
        // タスクを取得
        setIsAuthenticated(true);
      })
      .catch((err) => {});
  }, []);
  return (
    <ApolloProvider client={client}>
      {isAuthenticated ? (
        <>
          <Header />
          <h4 className="text-center mb-4">ユーザーはログインしています。</h4>
          <button
            className="block w-full px-4 py-2 rounded-md bg-blue-500 text-white text-center mb-4"
            onClick={() => Auth.signOut().then(() => setIsAuthenticated(false))}
          >
            サインアウト
          </button>
          <TodoScreen />
        </>
      ) : (
        <>
          <div className="bg-white min-h-screen flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
              <h4 className="text-center mb-4">
                ユーザーはログインしていません。
              </h4>
              <button
                className="block w-full px-4 py-2 rounded-md bg-blue-500 text-white text-center"
                onClick={() => Auth.federatedSignIn()}
              >
                ログイン/サインアップ
              </button>
            </div>
          </div>
        </>
      )}
    </ApolloProvider>
  );
}
