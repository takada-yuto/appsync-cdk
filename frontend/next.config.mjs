/** @type {import('next').NextConfig} */
const isLocal = process.env.NEXTAUTH_URL === "http://localhost:3000"
const nextConfig = {
  output: "standalone",
  basePath: "/prod",
  assetPrefix: isLocal
    ? ""
    : "https://byo8hasjdd.execute-api.ap-northeast-1.amazonaws.com/prod",
}
export default nextConfig
