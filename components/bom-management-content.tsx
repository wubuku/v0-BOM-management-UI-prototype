"use client"

import { useState, useEffect, useCallback } from "react"
import BomTreeView from "@/components/bom-tree-view"
import ProductDetailPanel from "@/components/product-detail-panel"
import RelationshipDetailPanel from "@/components/relationship-detail-panel"
import ProductSearchModal from "@/components/product-search-modal"
import AddAssocDialog from "@/components/add-assoc-dialog"
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
  const [bomData, setBomData] = useState<ProductAssoc[]>(productAssocs) // 初始化为示例数据
  const [rootNode, setRootNode] = useState<Product | null>(null)

  // 模态窗口状态
  const [showProductSearchModal, setShowProductSearchModal] = useState(false)
  const [showAddAssocDialog, setShowAddAssocDialog] = useState(false)
  const [modalPurpose, setModalPurpose] = useState<"root" | "child">("root")

  // 临时存储选中的产品（用于添加子节点）
  const [selectedChildProduct, setSelectedChildProduct] = useState<Product | null>(null)

  // 初始化时确定根节点
  useEffect(() => {
    if (bomData.length > 0) {
      const childProductIds = new Set(bomData.map((a) => a.productIdTo))
      const productsInBom = new Set([...bomData.map((a) => a.productId), ...bomData.map((a) => a.productIdTo)])
      const rootProductIds = Array.from(productsInBom).filter((id) => !childProductIds.has(id))

      if (rootProductIds.length > 0) {
        const rootProduct = products.find((p) => p.productId === rootProductIds[0])
        if (rootProduct) {
          setRootNode(rootProduct)
        }
      } else {
        setRootNode(null)
      }
    }
  }, [bomData])

  const handleStatusMessage = (type: "info" | "success" | "error", message: string) => {
    setStatusMessage({ type, message })
    setTimeout(() => setStatusMessage(null), 5000)
  }

  // 检查是否有根节点
  const hasRootNode = useCallback(() => {
    return rootNode !== null
  }, [rootNode])

  // 打开产品搜索模态窗口
  const openProductSearch = (purpose: "root" | "child") => {
    setModalPurpose(purpose)
    setShowProductSearchModal(true)
  }

  // 处理产品选择
  const handleProductSelect = (product: Product) => {
    if (modalPurpose === "root") {
      // 设置为根节点
      setRootNode(product)
      setSelectedProduct(product)

      // 查找产品的所有子节点关系（在原始的productAssocs中查找）
      const childRelations = findAllChildRelations(product.productId, productAssocs)

      // 设置BOM数据为根节点的所有子节点关系
      setBomData(childRelations)

      if (childRelations.length > 0) {
        handleStatusMessage(
          "success",
          `已将 ${product.productName} 设为根节点，并自动添加了 ${childRelations.length} 个子节点关系`,
        )
      } else {
        handleStatusMessage("success", `已将 ${product.productName} 设为根节点`)
      }
    } else if (modalPurpose === "child" && selectedProduct) {
      // 为选中的节点添加子节点
      setSelectedChildProduct(product)
      setShowAddAssocDialog(true)
    }

    // 关闭产品搜索模态窗口
    setShowProductSearchModal(false)
  }

  // 递归查找产品的所有子节点关系
  const findAllChildRelations = (productId: string, allProductAssocs: ProductAssoc[]): ProductAssoc[] => {
    // 找出直接子节点关系
    const directChildRelations = allProductAssocs.filter((assoc) => assoc.productId === productId)

    // 如果没有直接子节点，返回空数组
    if (directChildRelations.length === 0) {
      return []
    }

    // 收集所有子节点关系
    let allRelations: ProductAssoc[] = [...directChildRelations]

    // 递归查找每个子节点的子节点关系
    for (const relation of directChildRelations) {
      const childRelations = findAllChildRelations(relation.productIdTo, allProductAssocs)
      allRelations = [...allRelations, ...childRelations]
    }

    return allRelations
  }

  // 处理添加关系
  const handleAddAssoc = (quantity: number, scrapFactor: number) => {
    if (!selectedProduct || !selectedChildProduct) return

    // 检查是否已存在相同的关系
    const exists = bomData.some(
      (assoc) => assoc.productId === selectedProduct.productId && assoc.productIdTo === selectedChildProduct.productId,
    )

    if (exists) {
      handleStatusMessage("error", "该关系已存在")
      setShowAddAssocDialog(false)
      setSelectedChildProduct(null)
      return
    }

    // 检查是否会形成循环依赖
    const checkCyclicDependency = (parentId: string, childId: string, visited = new Set<string>()): boolean => {
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

    if (checkCyclicDependency(selectedChildProduct.productId, selectedProduct.productId)) {
      handleStatusMessage("error", "添加此关系会形成循环依赖")
      setShowAddAssocDialog(false)
      setSelectedChildProduct(null)
      return
    }

    // 创建新的关系
    const newAssoc: ProductAssoc = {
      productId: selectedProduct.productId,
      productIdTo: selectedChildProduct.productId,
      productAssocTypeId: "MANUF_COMPONENT",
      fromDate: "2024-01-01 00:00:00",
      quantity,
      scrapFactor,
      sequenceNum: bomData.filter((a) => a.productId === selectedProduct.productId).length + 1,
    }

    // 查找子节点是否有自己的子节点关系（在原始的productAssocs中查找）
    const childRelations = findAllChildRelations(selectedChildProduct.productId, productAssocs)

    // 过滤掉已经存在于当前bomData中的关系
    const newChildRelations = childRelations.filter(
      (relation) =>
        !bomData.some(
          (existing) => existing.productId === relation.productId && existing.productIdTo === relation.productIdTo,
        ),
    )

    // 更新BOM数据，包括新的关系和所有子节点关系
    setBomData([...bomData, newAssoc, ...newChildRelations])

    // 显示成功消息，包括子节点信息
    if (newChildRelations.length > 0) {
      handleStatusMessage("success", `已添加新的BOM关系，并自动包含了 ${newChildRelations.length} 个子节点关系`)
    } else {
      handleStatusMessage("success", "已添加新的BOM关系")
    }

    setShowAddAssocDialog(false)
    setSelectedChildProduct(null)
  }

  // 更新关系属性
  const handleUpdateAssoc = (updatedAssoc: ProductAssoc) => {
    const newBomData = bomData.map((assoc) =>
      assoc.productId === updatedAssoc.productId && assoc.productIdTo === updatedAssoc.productIdTo
        ? updatedAssoc
        : assoc,
    )
    setBomData(newBomData)
    handleStatusMessage("success", "已更新关系属性")
  }

  // 清空画布
  const handleClearCanvas = () => {
    setBomData([])
    setSelectedProduct(null)
    setSelectedAssoc(null)
    setRootNode(null)
    handleStatusMessage("info", "已清空画布")
  }

  // 重置为初始数据
  const handleReset = () => {
    setBomData(productAssocs)
    handleStatusMessage("info", "已重置为初始数据")
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toolbar
        onSave={() => handleStatusMessage("success", "BOM 数据已保存")}
        onRefresh={handleReset}
        onClear={handleClearCanvas}
        onAddRoot={() => openProductSearch("root")}
        hasRootNode={hasRootNode()}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 border-r border-gray-200">
          <BomTreeView
            bomData={bomData}
            rootNode={rootNode}
            onSelectProduct={setSelectedProduct}
            onSelectAssoc={setSelectedAssoc}
            onStatusChange={handleStatusMessage}
          />
        </div>

        <div className="w-80 lg:w-96 overflow-y-auto">
          {selectedAssoc ? (
            <RelationshipDetailPanel assoc={selectedAssoc} onUpdate={handleUpdateAssoc} />
          ) : (
            <ProductDetailPanel product={selectedProduct} onAddChild={() => openProductSearch("child")} />
          )}
        </div>
      </div>

      <StatusBar statusMessage={statusMessage} />

      {/* 产品搜索模态窗口 */}
      <ProductSearchModal
        open={showProductSearchModal}
        onClose={() => setShowProductSearchModal(false)}
        onSelectProduct={handleProductSelect}
        title={modalPurpose === "root" ? "选择根节点产品" : "选择子节点产品"}
        actionLabel={modalPurpose === "root" ? "设为根节点" : "选择"}
      />

      {/* 添加关系对话框 */}
      {showAddAssocDialog && selectedProduct && selectedChildProduct && (
        <AddAssocDialog
          sourceId={selectedProduct.productId}
          targetId={selectedChildProduct.productId}
          products={products}
          onConfirm={handleAddAssoc}
          onCancel={() => {
            setShowAddAssocDialog(false)
            setSelectedChildProduct(null)
          }}
        />
      )}
    </div>
  )
}
