"use client"
import { useSession } from "next-auth/react"
import React from "react"
export const IsLoggedIn = () => {
  const { data: session } = useSession()

  if (!session) {
    return <p>ログインしていません。</p>
  }

  return (
    <div>
      {session.user
        ? `${session.user.email}としてログインしています。`
        : "読み込み中..."}
    </div>
  )
}
