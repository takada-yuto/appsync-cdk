import { useGetTodosQuery } from "@/graphql/generated/generated-types"
import { TodoList } from "../List"
import { TodoInput } from "../Input"
import { useMemo, useState } from "react"
import { TodoFilter } from "../Filter"

export const FILTER_VALUES = [
  "ALL",
  "COMPLETED",
  "NOT COMPLETED",
  "MUST",
] as const

type FilterTupel = typeof FILTER_VALUES

export type Filter = FilterTupel[number]

export const TodoScreen = () => {
  const { data } = useGetTodosQuery()
  const [filter, setFilter] = useState<Filter>("ALL")

  const todos = useMemo(() => {
    if (!data) return []

    switch (filter) {
      case "ALL":
        return data.getTodos
      case "COMPLETED":
        return data.getTodos.filter((todo) => todo.completed)
      case "NOT COMPLETED":
        return data.getTodos.filter((todo) => !todo.completed)
      case "MUST":
        return data.getTodos.filter((todo) => todo.title.includes("帰"))
    }
  }, [data, filter])

  return (
    <div className="w-full px-8 flex flex-col">
      <TodoInput />
      <TodoFilter filter={filter} setFilter={setFilter} />
      <TodoList todos={todos} />
    </div>
  )
}
