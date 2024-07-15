import { useGetTodosQuery } from '@/graphql/generated/generated-types';
import { TodoList } from '../List';
import { TodoInput } from '../Input';
import { useEffect, useMemo, useState } from 'react';
import { TodoFilter } from '../Filter';
import { ConvertAudio } from '@/components/ConvertAudio';
import { Auth } from 'aws-amplify';

export const FILTER_VALUES = [
  'ALL',
  'COMPLETED',
  'NOT COMPLETED',
  'MUST',
] as const;

type FilterTupel = typeof FILTER_VALUES;

export type Filter = FilterTupel[number];

export const TodoScreen = () => {
  const { data } = useGetTodosQuery();
  const [filter, setFilter] = useState<Filter>('ALL');
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

  const todos = useMemo(() => {
    if (!data) return [];

    switch (filter) {
      case 'ALL':
        return data.getTodos;
      case 'COMPLETED':
        return data.getTodos.filter((todo) => todo.completed);
      case 'NOT COMPLETED':
        return data.getTodos.filter((todo) => !todo.completed);
      case 'MUST':
        return data.getTodos.filter((todo) => todo.title.includes('帰る'));
    }
  }, [data, filter]);

  return (
    <div className="w-full px-8 flex flex-col">
      {isAuthenticated ? (
        <>
          <h4>ユーザーはログインしています。</h4>
          <button
            color="primary"
            onClick={() => Auth.signOut().then(() => setIsAuthenticated(false))}
          >
            サインアウト
          </button>
        </>
      ) : (
        <>
          <h4>ユーザーはログインしていません。</h4>
          <button color="primary" onClick={() => Auth.federatedSignIn()}>
            ログイン/サインアップ
          </button>
        </>
      )}
      <TodoInput />
      <TodoFilter filter={filter} setFilter={setFilter} />
      <TodoList todos={todos} />
      <ConvertAudio />
    </div>
  );
};
