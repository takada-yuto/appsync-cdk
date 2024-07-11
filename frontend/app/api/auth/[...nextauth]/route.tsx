import NextAuth from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CognitoProvider({
      //本当は型定義したほうがいいけどｍんどくさいので''を使う。
      clientId: process.env.COGNITO_CLIENT_ID ?? "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
      issuer: process.env.COGNITO_ISSUER ?? "",
      checks: "nonce",
      //checks: 'nonce'がないとサインインできるけどエラーが起きて別のアカウントで試せと言われる
    }),
  ],
})

export { handler as GET, handler as POST }
