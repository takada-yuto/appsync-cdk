import {
  Todo,
  useDeleteTodoMutation,
  useToggleTodoMutation,
} from "@/graphql/generated/generated-types"
import Image from "next/image"
import { useCallback, useState } from "react"

type TodoItemProps = {
  todo: Todo
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  const [todoItem, setTodoItem] = useState<Todo | null>(todo)

  const [toggleTodo, toggleTodoStatus] = useToggleTodoMutation()

  const [deleteTodo, deleteTodoStatus] = useDeleteTodoMutation()

  const handleToggleTodo = useCallback(() => {
    if (!todoItem) return
    if (toggleTodoStatus.loading) return
    toggleTodo({
      variables: {
        toggleTodoInput: { id: todoItem.id, completed: !todoItem.completed },
      },
      onCompleted: () => {
        setTodoItem({ ...todoItem, completed: !todoItem.completed })
      },
    })
  }, [toggleTodoStatus.loading, todoItem, toggleTodo])

  const handleDeleteTodo = useCallback(() => {
    if (!todoItem) return
    if (deleteTodoStatus.loading) return
    deleteTodo({
      variables: { id: todoItem.id },
      onCompleted: () => setTodoItem(null),
    })
  }, [deleteTodoStatus, todoItem, deleteTodo])

  if (!todoItem) return null

  return (
    <div className="flex border border-blue-300 my-4 px-8 pt-4 w-full h-16">
      <input
        type="checkbox"
        className="form-checkbox h-6 mx-2 w-6 text-blue-600"
        checked={todoItem.completed}
        onChange={handleToggleTodo}
      />
      <span className="text-2xl">{todoItem.title}</span>
      {deleteTodoStatus.loading ? (
        <div>
          <svg
            className="spinner-border animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"
            viewBox="0 0 24 24"
          ></svg>
        </div>
      ) : (
        <button
          onClick={handleDeleteTodo}
          className="text-blue-500 h-6 mx-2 w-6"
        >
          <Image src={"/trash_can.png"} alt="Delete" width={500} height={300} />
        </button>
      )}
    </div>
  )
}
