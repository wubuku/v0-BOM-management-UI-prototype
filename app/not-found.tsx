import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">页面未找到</h2>
      <p className="mb-6 text-gray-600">抱歉，您请求的页面不存在。</p>
      <Link href="/" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
        返回首页
      </Link>
    </div>
  )
}
