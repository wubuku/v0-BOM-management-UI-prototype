"use client"

import { useState } from "react"
import BomTreeView from "@/components/bom-tree-view"
import ProductPanel from "@/components/product-panel"
import Toolbar from "@/components/toolbar"
import StatusBar from "@/components/status-bar"
import type { Product, ProductAssoc } from "@/lib/types"
import { products, productAssocs } from "@/lib/mock-data"

export default function BomManagementContent() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedAssoc, setSelectedAssoc] = useState<ProductAssoc | null>(null)
  const [statusMessage, setStatusMessage] = useState<{
    type: "info" | "success" | "error"
    message: string
  } | null>(null)

  const [bomData, setBomData] = useState<ProductAssoc[]>(productAssocs)

  const handleStatusMessage = (type: "info" | "success" | "error", message: string) => {
    setStatusMessage({ type, message })
    setTimeout(() => setStatusMessage(null), 5000)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toolbar
        onSave={() => handleStatusMessage("success", "BOM 数据已保存")}
        onRefresh={() => {
          setBomData(productAssocs)
          handleStatusMessage("info", "已重置为初始数据")
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 border-r border-gray-200">
          <BomTreeView
            bomData={bomData}
            onSelectProduct={setSelectedProduct}
            onSelectAssoc={setSelectedAssoc}
            onStatusChange={handleStatusMessage}
          />
        </div>

        <div className="w-80 lg:w-96 overflow-y-auto">
          <ProductPanel
            products={products}
            selectedProduct={selectedProduct}
            selectedAssoc={selectedAssoc}
            onUpdateAssoc={(updatedAssoc) => {
              const newBomData = bomData.map((assoc) =>
                assoc.productId === updatedAssoc.productId && assoc.productIdTo === updatedAssoc.productIdTo
                  ? updatedAssoc
                  : assoc,
              )
              setBomData(newBomData)
              handleStatusMessage("success", "已更新关系属性")
            }}
            onAddAssoc={(newAssoc) => {
              // 检查是否已存在相同的关系
              const exists = bomData.some(
                (assoc) => assoc.productId === newAssoc.productId && assoc.productIdTo === newAssoc.productIdTo,
              )

              if (exists) {
                handleStatusMessage("error", "该关系已存在")
                return
              }

              // 检查是否会形成循环依赖
              const checkCyclicDependency = (
                parentId: string,
                childId: string,
                visited = new Set<string>(),
              ): boolean => {
                if (parentId === childId) return true
                if (visited.has(childId)) return false

                visited.add(childId)

                // 查找所有以childId为父节点的关系
                const childRelations = bomData.filter((assoc) => assoc.productId === childId)

                for (const relation of childRelations) {
                  if (checkCyclicDependency(parentId, relation.productIdTo, new Set(visited))) {
                    return true
                  }
                }

                return false
              }

              if (checkCyclicDependency(newAssoc.productIdTo, newAssoc.productId)) {
                handleStatusMessage("error", "添加此关系会形成循环依赖")
                return
              }

              setBomData([...bomData, newAssoc])
              handleStatusMessage("success", "已添加新的BOM关系")
            }}
          />
        </div>
      </div>

      <StatusBar statusMessage={statusMessage} />
    </div>
  )
}
