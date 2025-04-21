"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  const handleReset = () => {
    if (typeof reset === "function") {
      reset()
    } else {
      // Fallback if reset is not available
      window.location.reload()
    }
  }

  return (
    <html>
      <head>
        <title>Something went wrong!</title>
      </head>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>出错了</h2>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>抱歉，应用程序遇到了一个错误。</p>
          <button
            onClick={handleReset}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "0.25rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            重试
          </button>
        </div>
      </body>
    </html>
  )
}
