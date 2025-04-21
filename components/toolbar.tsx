"use client"

import { Save, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToolbarProps {
  onSave: () => void
  onRefresh: () => void
}

export default function Toolbar({ onSave, onRefresh }: ToolbarProps) {
  return (
    <div className="flex items-center p-2 bg-white border-b border-gray-200 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800 mr-6">BOM 管理系统</h1>

      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onSave} className="flex items-center gap-1">
          <Save className="h-4 w-4" />
          <span>保存</span>
        </Button>

        <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          <span>重置</span>
        </Button>
      </div>
    </div>
  )
}
