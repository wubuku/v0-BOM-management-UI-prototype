interface StatusBarProps {
  statusMessage: {
    type: "info" | "success" | "error"
    message: string
  } | null
}

export default function StatusBar({ statusMessage }: StatusBarProps) {
  if (!statusMessage) {
    return (
      <div className="h-8 bg-gray-100 border-t border-gray-200 px-4 flex items-center text-sm text-gray-500">就绪</div>
    )
  }

  const bgColor =
    statusMessage.type === "success" ? "bg-green-100" : statusMessage.type === "error" ? "bg-red-100" : "bg-blue-100"

  const textColor =
    statusMessage.type === "success"
      ? "text-green-800"
      : statusMessage.type === "error"
        ? "text-red-800"
        : "text-blue-800"

  return (
    <div className={`h-8 ${bgColor} border-t border-gray-200 px-4 flex items-center text-sm ${textColor}`}>
      {statusMessage.message}
    </div>
  )
}
