"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </ThemeProvider>
  )
}
