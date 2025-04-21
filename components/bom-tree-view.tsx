"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronRight, ChevronDown, Plus, Minus } from "lucide-react"
import type { Product, ProductAssoc } from "@/lib/types"
import { products, productTypes, uomData } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface BomTreeViewProps {
  bomData: ProductAssoc[]
  onSelectProduct: (product: Product | null) => void
  onSelectAssoc: (assoc: ProductAssoc | null) => void
  onStatusChange: (type: "info" | "success" | "error", message: string) => void
}

interface TreeNode {
  id: string
  product: Product
  children: TreeNode[]
  assoc?: ProductAssoc // 与父节点的关系
  expanded: boolean
}

export default function BomTreeView({ bomData, onSelectProduct, onSelectAssoc, onStatusChange }: BomTreeViewProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedAssocId, setSelectedAssocId] = useState<string | null>(null)

  // 构建树形结构
  const buildTree = useCallback(() => {
    // 找出所有根节点（没有父节点的节点）
    const allProductIds = new Set(products.map((p) => p.productId))
    const childProductIds = new Set(bomData.map((a) => a.productIdTo))

    // 找出所有在BOM关系中出现的产品ID
    const productsInBom = new Set([...bomData.map((a) => a.productId), ...bomData.map((a) => a.productIdTo)])

    // 根节点是在BOM中出现但不是任何节点的子节点的产品
    const rootProductIds = Array.from(productsInBom).filter((id) => !childProductIds.has(id))

    // 递归构建树
    const buildSubtree = (productId: string, visited = new Set<string>()): TreeNode | null => {
      if (visited.has(productId)) {
        // 检测到循环依赖
        onStatusChange("error", `检测到循环依赖: ${productId}`)
        return null
      }

      const product = products.find((p) => p.productId === productId)
      if (!product) return null

      visited.add(productId)

      // 查找所有子节点
      const childAssocs = bomData.filter((a) => a.productId === productId)
      const children: TreeNode[] = []

      for (const assoc of childAssocs) {
        const childNode = buildSubtree(assoc.productIdTo, new Set(visited))
        if (childNode) {
          childNode.assoc = assoc
          children.push(childNode)
        }
      }

      return {
        id: productId,
        product,
        children,
        expanded: true, // 默认展开
      }
    }

    // 构建所有根节点的子树
    const tree: TreeNode[] = []
    for (const rootId of rootProductIds) {
      const rootNode = buildSubtree(rootId)
      if (rootNode) {
        tree.push(rootNode)
      }
    }

    return tree
  }, [bomData, onStatusChange])

  // 初始化树形结构
  useEffect(() => {
    const tree = buildTree()
    setTreeData(tree)
  }, [bomData, buildTree])

  // 修改 toggleNode 函数，确保折叠/展开功能正常工作
  const toggleNode = (nodeId: string) => {
    setTreeData((prevTree) => {
      const updateNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, expanded: !node.expanded }
          }
          if (node.children.length > 0) {
            return { ...node, children: updateNode(node.children) }
          }
          return node
        })
      }
      return updateNode(prevTree)
    })
  }

  // 展开所有节点
  const expandAll = () => {
    setTreeData((prevTree) => {
      const expandNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => ({
          ...node,
          expanded: true,
          children: expandNodes(node.children),
        }))
      }
      return expandNodes(prevTree)
    })
    onStatusChange("info", "已展开所有节点")
  }

  // 折叠所有节点
  const collapseAll = () => {
    setTreeData((prevTree) => {
      const collapseNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => ({
          ...node,
          expanded: false,
          children: collapseNodes(node.children),
        }))
      }
      return collapseNodes(prevTree)
    })
    onStatusChange("info", "已折叠所有节点")
  }

  // 选择节点
  const selectNode = (node: TreeNode) => {
    setSelectedNodeId(node.id)
    setSelectedAssocId(null)
    onSelectProduct(node.product)
    onSelectAssoc(null)
  }

  // 选择关系
  const selectAssoc = (assoc: ProductAssoc) => {
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

  // 修改 renderTreeNode 函数，改进节点间距和连线显示
  const renderTreeNode = (node: TreeNode, level = 0, isLastChild = true) => {
    const productType = productTypes.find((t) => t.id === node.product.productTypeId)
    const uom = uomData.find((u) => u.id === node.product.quantityUomId)

    return (
      <div key={node.id} className="relative mb-3">
        {/* 节点内容 */}
        <div className="flex items-start group">
          {/* 缩进和连接线 */}
          {level > 0 && (
            <div className="flex items-center h-full">
              {Array.from({ length: level }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 flex items-center justify-center ${
                    i === level - 1 ? "" : "border-l border-gray-300"
                  }`}
                  style={{ height: "100%" }}
                >
                  {i === level - 1 && (
                    <div
                      className={`w-8 h-0.5 ${
                        isLastChild ? "border-l border-b rounded-bl" : "border-t"
                      } border-gray-300`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 展开/折叠图标 */}
          <div className="flex items-center">
            {node.children.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNode(node.id)
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                {node.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <div className="w-6 h-6"></div>
            )}
          </div>

          {/* 节点信息 */}
          <div
            className={`flex flex-col p-2 rounded-md border ${
              selectedNodeId === node.id ? "ring-2 ring-primary" : ""
            } hover:bg-gray-50 cursor-pointer`}
            onClick={() => selectNode(node)}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{node.product.productName}</span>
              <Badge variant="outline" className={getProductTypeColor(node.product.productTypeId)}>
                {productType?.description || node.product.productTypeId}
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              ID: {node.product.productId} | 单位: {uom?.description || node.product.quantityUomId}
            </div>
          </div>

          {/* 关系信息 (如果有) - 重新设计为更明确的关系表示 */}
          {node.assoc && (
            <div className="ml-4 flex items-center">
              <div className="h-0.5 w-6 bg-gray-300"></div>
              <div
                className={`px-3 py-2 border rounded-md cursor-pointer ${
                  selectedAssocId === `${node.assoc.productId}-${node.assoc.productIdTo}`
                    ? "bg-primary/10 border-primary"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  selectAssoc(node.assoc!)
                }}
              >
                <div className="text-xs font-medium text-gray-500 mb-1">关系属性</div>
                <div className="flex gap-3">
                  <div className="text-sm">
                    <span className="text-xs text-gray-500">数量:</span> {node.assoc.quantity}
                  </div>
                  {node.assoc.scrapFactor ? (
                    <div className="text-sm">
                      <span className="text-xs text-gray-500">报废率:</span> {node.assoc.scrapFactor}%
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 子节点 */}
        {node.expanded && node.children.length > 0 && (
          <div className="ml-6 mt-3 pl-4 border-l border-gray-300">
            {node.children.map((child, index) => renderTreeNode(child, level + 1, index === node.children.length - 1))}
          </div>
        )}
      </div>
    )
  }

  // 修改树形视图的整体布局
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
        {treeData.length > 0 ? (
          <div className="space-y-4">{treeData.map((node) => renderTreeNode(node))}</div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">没有找到BOM数据，请从右侧拖入产品</div>
        )}
      </div>
    </div>
  )
}
