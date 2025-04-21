"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, Plus, Minus } from "lucide-react"
import type { Product, ProductAssoc } from "@/lib/types"
import { products, productTypes, uomData } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface BomTreeViewProps {
  bomData: ProductAssoc[]
  rootNode: Product | null
  onSelectProduct: (product: Product | null) => void
  onSelectAssoc: (assoc: ProductAssoc | null) => void
  onStatusChange: (type: "info" | "success" | "error", message: string) => void
}

interface TreeNodeState {
  [key: string]: boolean // 节点ID -> 是否展开
}

export default function BomTreeView({
  bomData,
  rootNode,
  onSelectProduct,
  onSelectAssoc,
  onStatusChange,
}: BomTreeViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedAssocId, setSelectedAssocId] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<TreeNodeState>({})

  // 当根节点或BOM数据变化时，重置展开状态
  useEffect(() => {
    const initialExpandState: TreeNodeState = {}

    // 设置所有节点为展开状态
    const setAllExpanded = (productId: string) => {
      initialExpandState[productId] = true

      // 查找所有子节点
      const childAssocs = bomData.filter((assoc) => assoc.productId === productId)
      for (const assoc of childAssocs) {
        setAllExpanded(assoc.productIdTo)
      }
    }

    // 如果有指定的根节点
    if (rootNode) {
      initialExpandState[rootNode.productId] = true
      setAllExpanded(rootNode.productId)
    } else {
      // 如果没有指定根节点，找出所有根节点
      const childProductIds = new Set(bomData.map((a) => a.productIdTo))
      const productsInBom = new Set([...bomData.map((a) => a.productId), ...bomData.map((a) => a.productIdTo)])
      const rootProductIds = Array.from(productsInBom).filter((id) => !childProductIds.has(id))

      for (const rootId of rootProductIds) {
        initialExpandState[rootId] = true
        setAllExpanded(rootId)
      }
    }

    setExpandedNodes(initialExpandState)
  }, [rootNode, bomData])

  // 切换节点展开/折叠状态
  const toggleNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }

  // 展开所有节点
  const expandAll = () => {
    const allNodes: TreeNodeState = {}

    // 递归设置所有节点为展开状态
    const setAllExpanded = (productId: string) => {
      allNodes[productId] = true

      // 查找所有子节点
      const childAssocs = bomData.filter((assoc) => assoc.productId === productId)
      for (const assoc of childAssocs) {
        setAllExpanded(assoc.productIdTo)
      }
    }

    if (rootNode) {
      allNodes[rootNode.productId] = true
      setAllExpanded(rootNode.productId)
    } else {
      // 如果没有指定根节点，找出所有根节点
      const childProductIds = new Set(bomData.map((a) => a.productIdTo))
      const productsInBom = new Set([...bomData.map((a) => a.productId), ...bomData.map((a) => a.productIdTo)])
      const rootProductIds = Array.from(productsInBom).filter((id) => !childProductIds.has(id))

      for (const rootId of rootProductIds) {
        allNodes[rootId] = true
        setAllExpanded(rootId)
      }
    }

    setExpandedNodes(allNodes)
    onStatusChange("info", "已展开所有节点")
  }

  // 折叠所有节点
  const collapseAll = () => {
    // 获取所有节点ID
    const allNodeIds = new Set<string>()

    // 递归收集所有节点ID
    const collectNodeIds = (productId: string) => {
      allNodeIds.add(productId)

      // 查找所有子节点
      const childAssocs = bomData.filter((assoc) => assoc.productId === productId)
      for (const assoc of childAssocs) {
        collectNodeIds(assoc.productIdTo)
      }
    }

    if (rootNode) {
      collectNodeIds(rootNode.productId)
    } else {
      // 如果没有指定根节点，找出所有根节点
      const childProductIds = new Set(bomData.map((a) => a.productIdTo))
      const productsInBom = new Set([...bomData.map((a) => a.productId), ...bomData.map((a) => a.productIdTo)])
      const rootProductIds = Array.from(productsInBom).filter((id) => !childProductIds.has(id))

      for (const rootId of rootProductIds) {
        collectNodeIds(rootId)
      }
    }

    // 创建一个新的状态对象，将所有节点设置为折叠状态
    const collapsedState: TreeNodeState = {}
    allNodeIds.forEach((id) => {
      collapsedState[id] = false
    })

    setExpandedNodes(collapsedState)
    onStatusChange("info", "已折叠所有节点")
  }

  // 选择节点
  const selectNode = (product: Product) => {
    setSelectedNodeId(product.productId)
    setSelectedAssocId(null)
    onSelectProduct(product)
    onSelectAssoc(null)
  }

  // 选择关系
  const selectAssoc = (assoc: ProductAssoc, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedNodeId(null)
    setSelectedAssocId(`${assoc.productId}-${assoc.productIdTo}`)
    onSelectProduct(null)
    onSelectAssoc(assoc)
  }

  // 获取产品类型颜色
  const getProductTypeColor = (productTypeId: string) => {
    switch (productTypeId) {
      case "RAW_MATERIAL":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "WIP":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "FINISHED_GOOD":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // 检查节点是否有子节点
  const hasChildren = (productId: string) => {
    return bomData.some((assoc) => assoc.productId === productId)
  }

  // 渲染根节点
  const renderRootNode = () => {
    if (!rootNode) {
      return <div className="flex items-center justify-center h-full text-gray-500">请添加根节点</div>
    }

    const productType = productTypes.find((t) => t.id === rootNode.productTypeId)
    const uom = uomData.find((u) => u.id === rootNode.quantityUomId)
    const nodeHasChildren = hasChildren(rootNode.productId)
    const isExpanded = expandedNodes[rootNode.productId] !== false // 默认展开

    return (
      <div className="mb-6">
        <div className="flex items-start">
          {/* 展开/折叠按钮 */}
          <div className="mr-2 mt-1">
            {nodeHasChildren ? (
              <button
                onClick={(e) => toggleNode(rootNode.productId, e)}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <div className="w-6 h-6"></div>
            )}
          </div>

          {/* 节点卡片 */}
          <div className="flex-1">
            <div
              className={`p-3 rounded-md border ${
                selectedNodeId === rootNode.productId ? "ring-2 ring-primary border-primary" : "border-gray-200"
              } bg-white shadow-sm hover:shadow cursor-pointer`}
              onClick={() => selectNode(rootNode)}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">{rootNode.productName}</div>
                <Badge variant="outline" className={getProductTypeColor(rootNode.productTypeId)}>
                  {productType?.description || rootNode.productTypeId}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ID: {rootNode.productId} | 单位: {uom?.description || rootNode.quantityUomId}
              </div>
            </div>
          </div>
        </div>

        {/* 子节点 */}
        {nodeHasChildren && isExpanded && renderChildNodes(rootNode.productId)}
      </div>
    )
  }

  // 渲染子节点
  const renderChildNodes = (parentId: string) => {
    const childAssocs = bomData.filter((assoc) => assoc.productId === parentId)

    if (childAssocs.length === 0) return null

    return (
      <div className="mt-4 ml-8 relative">
        {childAssocs.map((assoc, index) => {
          const childProduct = products.find((p) => p.productId === assoc.productIdTo)
          if (!childProduct) return null

          const productType = productTypes.find((t) => t.id === childProduct.productTypeId)
          const uom = uomData.find((u) => u.id === childProduct.quantityUomId)
          const isLastChild = index === childAssocs.length - 1
          const nodeHasChildren = hasChildren(childProduct.productId)
          const isExpanded = expandedNodes[childProduct.productId] !== false // 默认展开

          return (
            <div key={childProduct.productId} className="relative mb-6">
              {/* 连接线 */}
              <div
                className="absolute border-l border-gray-300"
                style={{
                  left: "-12px",
                  top: "-20px",
                  height: isLastChild ? "36px" : "100%",
                }}
              ></div>
              <div
                className="absolute border-t border-gray-300"
                style={{
                  left: "-12px",
                  width: "12px",
                  top: "16px",
                }}
              ></div>

              <div className="flex items-start">
                {/* 展开/折叠按钮 */}
                <div className="mr-2 mt-1">
                  {nodeHasChildren ? (
                    <button
                      onClick={(e) => toggleNode(childProduct.productId, e)}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  ) : (
                    <div className="w-6 h-6"></div>
                  )}
                </div>

                {/* 节点卡片 */}
                <div className="flex-1">
                  <div
                    className={`p-3 rounded-md border ${
                      selectedNodeId === childProduct.productId
                        ? "ring-2 ring-primary border-primary"
                        : "border-gray-200"
                    } bg-white shadow-sm hover:shadow cursor-pointer`}
                    onClick={() => selectNode(childProduct)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{childProduct.productName}</div>
                      <Badge variant="outline" className={getProductTypeColor(childProduct.productTypeId)}>
                        {productType?.description || childProduct.productTypeId}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {childProduct.productId} | 单位: {uom?.description || childProduct.quantityUomId}
                    </div>

                    {/* 关系属性 */}
                    <div
                      className={`mt-2 p-2 rounded border-t ${
                        selectedAssocId === `${assoc.productId}-${assoc.productIdTo}`
                          ? "bg-primary/5 border-primary/20"
                          : "bg-gray-50 border-gray-100"
                      }`}
                      onClick={(e) => selectAssoc(assoc, e)}
                    >
                      <div className="text-xs font-medium text-gray-500 mb-1">关系属性</div>
                      <div className="flex gap-4">
                        <div className="text-sm">
                          <span className="text-xs text-gray-500">数量:</span> {assoc.quantity}
                        </div>
                        {assoc.scrapFactor !== undefined && (
                          <div className="text-sm">
                            <span className="text-xs text-gray-500">报废率:</span> {assoc.scrapFactor}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 递归渲染子节点的子节点 */}
              {nodeHasChildren && isExpanded && renderChildNodes(childProduct.productId)}
            </div>
          )
        })}
      </div>
    )
  }

  // 渲染默认树结构（当没有指定根节点时）
  const renderDefaultTree = () => {
    // 找出所有根节点（没有父节点的节点）
    const childProductIds = new Set(bomData.map((a) => a.productIdTo))
    const productsInBom = new Set([...bomData.map((a) => a.productId), ...bomData.map((a) => a.productIdTo)])
    const rootProductIds = Array.from(productsInBom).filter((id) => !childProductIds.has(id))

    if (rootProductIds.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">没有找到BOM数据，请添加根节点</div>
    }

    return (
      <div className="space-y-6">
        {rootProductIds.map((rootId) => {
          const rootProduct = products.find((p) => p.productId === rootId)
          if (!rootProduct) return null

          const productType = productTypes.find((t) => t.id === rootProduct.productTypeId)
          const uom = uomData.find((u) => u.id === rootProduct.quantityUomId)
          const nodeHasChildren = hasChildren(rootProduct.productId)
          const isExpanded = expandedNodes[rootProduct.productId] !== false // 默认展开

          return (
            <div key={rootProduct.productId} className="mb-6">
              <div className="flex items-start">
                {/* 展开/折叠按钮 */}
                <div className="mr-2 mt-1">
                  {nodeHasChildren ? (
                    <button
                      onClick={(e) => toggleNode(rootProduct.productId, e)}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  ) : (
                    <div className="w-6 h-6"></div>
                  )}
                </div>

                {/* 节点卡片 */}
                <div className="flex-1">
                  <div
                    className={`p-3 rounded-md border ${
                      selectedNodeId === rootProduct.productId
                        ? "ring-2 ring-primary border-primary"
                        : "border-gray-200"
                    } bg-white shadow-sm hover:shadow cursor-pointer`}
                    onClick={() => selectNode(rootProduct)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{rootProduct.productName}</div>
                      <Badge variant="outline" className={getProductTypeColor(rootProduct.productTypeId)}>
                        {productType?.description || rootProduct.productTypeId}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {rootProduct.productId} | 单位: {uom?.description || rootProduct.quantityUomId}
                    </div>
                  </div>
                </div>
              </div>

              {/* 子节点 */}
              {nodeHasChildren && isExpanded && renderChildNodes(rootProduct.productId)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={expandAll} className="flex items-center gap-1">
          <Plus className="h-3 w-3" />
          <span>展开全部</span>
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll} className="flex items-center gap-1">
          <Minus className="h-3 w-3" />
          <span>折叠全部</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {rootNode ? (
          renderRootNode()
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">没有找到BOM数据，请添加根节点</div>
        )}
      </div>
    </div>
  )
}
