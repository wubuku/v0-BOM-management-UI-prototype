export default function NotFound() {
  return (
    <html>
      <head>
        <title>Page Not Found</title>
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
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>页面未找到</h2>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>抱歉，您请求的页面不存在。</p>
          <a
            href="/"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "0.25rem",
              textDecoration: "none",
            }}
          >
            返回首页
          </a>
        </div>
      </body>
    </html>
  )
}
