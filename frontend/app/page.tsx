"use client"
import { Header } from "@/components/Header"
import { TodoScreen } from "@/components/Todo/Screen"
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client"

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_APPSYNC_API_URL,
    headers: {
      "X-Api-Key": process.env.NEXT_PUBLIC_APPSYNC_API_KEY!,
    },
  }),
  cache: new InMemoryCache(),
})

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <Header />
      <TodoScreen />
    </ApolloProvider>
  )
}
