"use client"
import type { ProductAssoc } from "@/lib/types"
import AssocEditor from "./assoc-editor"

interface RelationshipDetailPanelProps {
  assoc: ProductAssoc | null
  onUpdate: (updatedAssoc: ProductAssoc) => void
}

export default function RelationshipDetailPanel({ assoc, onUpdate }: RelationshipDetailPanelProps) {
  if (!assoc) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-gray-500 text-center">
        请从树形视图中选择一个关系查看详情
      </div>
    )
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-medium mb-4">关系详情</h2>
      <div className="flex-1 overflow-y-auto">
        <AssocEditor assoc={assoc} onUpdate={onUpdate} />
      </div>
    </div>
  )
}
