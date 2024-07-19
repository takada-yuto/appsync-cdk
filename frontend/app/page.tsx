'use client';
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
import { RalewayFont } from '@/lib/font';
import Link from 'next/link';
import { Header } from './@header/page';

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
      <div
        className="relative min-h-screen flex flex-col items-centerbg-cover bg-center"
        style={{
          backgroundImage: 'url(/background.jpeg)',
          backgroundSize: '30%',
          backgroundPosition: 'center',
        }}
      >
        {isAuthenticated ? (
          <>
            <Header />
            <button
              className={`block w-full px-4 py-2 mb-4 rounded-md bg-gradient-to-r from-ivory-500 to-ivory-500 shadow-md text-black text-center hover:bg-lightgray transition duration-300 ${RalewayFont.className}`}
              onClick={() =>
                Auth.signOut().then(() => setIsAuthenticated(false))
              }
            >
              Logout
            </button>
            <TodoScreen />
          </>
        ) : (
          <>
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center">
              <div className="absolute inset-0 bg-black opacity-50"></div>
              <div className="relative w-full max-w-md p-8 bg-ivory bg-opacity-80 shadow-lg rounded-lg border border-gray-200">
                <h4 className="text-center mb-4 text-gray-700 font-semibold">
                  Welcome to web
                </h4>
                <button
                  className="block w-full px-4 py-2 rounded-md bg-lightblue text-black text-center hover:bg-lightgray transition duration-300"
                  onClick={() => Auth.federatedSignIn()}
                >
                  Login
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ApolloProvider>
  );
}
