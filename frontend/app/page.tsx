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
  return (
    <ApolloProvider client={client}>
      <Header />
      <TodoScreen />
    </ApolloProvider>
  );
}
