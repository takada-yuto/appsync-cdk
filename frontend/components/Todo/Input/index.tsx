import {
  namedOperations,
  useAddTodoMutation,
} from '@/graphql/generated/generated-types';
import { RalewayFont } from '@/lib/font';
import { useCallback, useState } from 'react';

export const TodoInput = () => {
  const [titleInput, setTitleInput] = useState('');
  const clearTitleInput = useCallback(() => setTitleInput(''), []);

  const [addTodo, { loading }] = useAddTodoMutation();

  const handleAddTodo = useCallback(() => {
    addTodo({
      variables: { addTodoInput: { title: titleInput } },
      refetchQueries: [namedOperations.Query.GetTodos],
      onCompleted: clearTitleInput,
    });
  }, [titleInput, addTodo, clearTitleInput]);

  return (
    <div className="flex space-x-6">
      <input
        type="text"
        className="bg-ivory-500 text-black border-2 border-black-500 h-12 w-[400px]"
        value={titleInput}
        onChange={(e) => setTitleInput(e.target.value)}
      />
      {loading ? (
        <div className="px-8">
          <svg
            className="spinner-border animate-spin h-8 w-8 border-4 border-ivory-500 border-t-transparent rounded-full"
            viewBox="0 0 24 24"
          ></svg>
        </div>
      ) : (
        <button
          className={`px-8 bg-ivory-500 text-black border-2 border-black-500 ${
            RalewayFont.className
          } ${
            !titleInput
              ? 'bg-lightgray text-black border-2 opacity-50 cursor-not-allowed'
              : ''
          }`}
          disabled={!titleInput}
          onClick={handleAddTodo}
        >
          Add Todo
        </button>
      )}
    </div>
  );
};
