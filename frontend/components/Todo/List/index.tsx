import { Todo } from "@/graphql/generated/generated-types"
import { TodoItem } from "../Item"

type TodoListProps = {
  todos: Todo[]
}

export const TodoList = ({ todos }: TodoListProps) => {
  return (
    <div className="w-full flex flex-col">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}
