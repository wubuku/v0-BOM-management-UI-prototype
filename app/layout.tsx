import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BOM Management System",
  description: "Product BOM Management Interface",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
