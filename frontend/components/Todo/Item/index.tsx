import {
  Todo,
  useDeleteTodoMutation,
  useToggleTodoMutation,
} from '@/graphql/generated/generated-types';
import { RampartOneFont } from '@/lib/font';
import Image from 'next/image';
import { useCallback, useState } from 'react';

type TodoItemProps = {
  todo: Todo;
};

export const TodoItem = ({ todo }: TodoItemProps) => {
  const [todoItem, setTodoItem] = useState<Todo | null>(todo);

  const [toggleTodo, toggleTodoStatus] = useToggleTodoMutation();

  const [deleteTodo, deleteTodoStatus] = useDeleteTodoMutation();

  const handleToggleTodo = useCallback(() => {
    if (!todoItem) return;
    if (toggleTodoStatus.loading) return;
    toggleTodo({
      variables: {
        toggleTodoInput: { id: todoItem.id, completed: !todoItem.completed },
      },
      onCompleted: () => {
        setTodoItem({ ...todoItem, completed: !todoItem.completed });
      },
    });
  }, [toggleTodoStatus, todoItem, toggleTodo]);

  const handleDeleteTodo = useCallback(() => {
    if (!todoItem) return;
    if (deleteTodoStatus.loading) return;
    deleteTodo({
      variables: { id: todoItem.id },
      onCompleted: () => setTodoItem(null),
    });
  }, [deleteTodoStatus, todoItem, deleteTodo]);

  if (!todoItem) return null;

  return (
    <div className="flex items-center justify-between border border-gray-300 my-4 px-8 pt-4 pb-4 w-full h-16 shadow-md">
      <div className="flex items-center">
        {toggleTodoStatus.loading ? (
          <div className="flex items-center">
            <svg
              className="spinner-border animate-spin h-8 w-8 border-4 border-gray-500 border-t-transparent rounded-full"
              viewBox="0 0 24 24"
            ></svg>
          </div>
        ) : (
          <input
            type="checkbox"
            className="form-checkbox h-6 w-6 text-blue-600 mr-4"
            checked={todoItem.completed}
            onChange={handleToggleTodo}
          />
        )}
        <span className={`text-3xl ${RampartOneFont.className}`}>
          {todoItem.title}
        </span>
      </div>
      {deleteTodoStatus.loading ? (
        <div className="flex items-center">
          <svg
            className="spinner-border animate-spin h-8 w-8 border-4 border-gray-500 border-t-transparent rounded-full"
            viewBox="0 0 24 24"
          ></svg>
        </div>
      ) : (
        <button
          onClick={handleDeleteTodo}
          className="text-black-600 text-lg font-bold p-2 rounded-full hover:bg-red-100 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
