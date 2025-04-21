"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  type Node,
  type Edge,
  type Connection,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "reactflow"
import { useDrop } from "react-dnd"
import "reactflow/dist/style.css"
import type { Product, ProductAssoc } from "@/lib/types"
import ProductNode from "./product-node"
import AddAssocDialog from "./add-assoc-dialog"
import { edgeTypes } from "./edge-types"

// 注册自定义节点类型
const nodeTypes = {
  productNode: ProductNode,
}

interface BomCanvasProps {
  products: Product[]
  bomData: ProductAssoc[]
  setBomData: (data: ProductAssoc[]) => void
  onSelectProduct: (product: Product | null) => void
  onSelectAssoc: (assoc: ProductAssoc | null) => void
  onStatusChange: (type: "info" | "success" | "error", message: string) => void
}

// 内部组件，用于实际的画布实现
const BomCanvasInner = forwardRef<{ relayout: () => void }, BomCanvasProps>(
  ({ products, bomData, setBomData, onSelectProduct, onSelectAssoc, onStatusChange }, ref) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [newConnection, setNewConnection] = useState<{
      source: string
      target: string
    } | null>(null)

    const { project, fitView } = useReactFlow()

    // 暴露重新布局方法
    useImperativeHandle(ref, () => ({
      relayout: () => {
        const { nodes: newNodes, edges: newEdges } = buildGraphFromBomData()
        setNodes(newNodes)
        setEdges(newEdges)
        setTimeout(() => fitView({ padding: 0.2 }), 50)
      },
    }))

    const checkForCyclicDependency = useCallback(
      (parentId: string, childId: string, bomData: ProductAssoc[], visited = new Set<string>()): boolean => {
        if (parentId === childId) return true
        if (visited.has(childId)) return false

        visited.add(childId)

        // 查找所有以childId为父节点的关系
        const childRelations = bomData.filter((assoc) => assoc.productId === childId)

        for (const relation of childRelations) {
          if (checkForCyclicDependency(parentId, relation.productIdTo, bomData, new Set(visited))) {
            return true
          }
        }

        return false
      },
      [],
    )

    // 将BOM数据转换为节点和边
    const buildGraphFromBomData = useCallback(() => {
      const nodeMap = new Map<string, Node>()
      const edgeList: Edge[] = []
      const processedNodes = new Set<string>()

      // 创建所有产品节点
      products.forEach((product) => {
        nodeMap.set(product.productId, {
          id: product.productId,
          type: "productNode",
          position: { x: 0, y: 0 }, // 初始位置，后面会更新
          data: { product },
        })
      })

      // 找出所有根节点（没有父节点的节点）
      const childNodes = new Set<string>()
      bomData.forEach((assoc) => {
        childNodes.add(assoc.productIdTo)
        processedNodes.add(assoc.productId)
        processedNodes.add(assoc.productIdTo)
      })

      const rootNodes = Array.from(processedNodes).filter((id) => !childNodes.has(id))

      // 计算树的深度和每个节点的子节点
      const getChildrenForNode = (nodeId: string): string[] => {
        return bomData.filter((assoc) => assoc.productId === nodeId).map((assoc) => assoc.productIdTo)
      }

      // 计算节点位置
      const HORIZONTAL_SPACING = 200
      const VERTICAL_SPACING = 120

      // 使用递归函数计算每个节点及其子节点的位置
      const calculateNodePositions = (
        nodeId: string,
        level: number,
        horizontalOffset: number,
        widthMap: Map<string, number>,
      ): number => {
        const children = getChildrenForNode(nodeId)

        if (children.length === 0) {
          // 叶子节点宽度为1
          widthMap.set(nodeId, 1)
          const node = nodeMap.get(nodeId)
          if (node) {
            node.position = {
              x: horizontalOffset * HORIZONTAL_SPACING,
              y: level * VERTICAL_SPACING,
            }
          }
          return 1
        }

        let totalWidth = 0
        let currentOffset = horizontalOffset

        // 先计算所有子节点的位置和宽度
        for (const childId of children) {
          const childWidth = calculateNodePositions(childId, level + 1, currentOffset, widthMap)

          // 创建边
          const assoc = bomData.find((a) => a.productId === nodeId && a.productIdTo === childId)
          if (assoc) {
            const edgeId = `${assoc.productId}-${assoc.productIdTo}`
            edgeList.push({
              id: edgeId,
              source: assoc.productId,
              target: assoc.productIdTo,
              label: `${assoc.quantity} ${assoc.scrapFactor ? `(报废率: ${assoc.scrapFactor}%)` : ""}`,
              data: assoc,
              type: "smoothstep", // 使用平滑的阶梯线
              animated: false,
            })
          }

          totalWidth += childWidth
          currentOffset += childWidth
        }

        // 设置当前节点位置在子节点的中心
        const node = nodeMap.get(nodeId)
        if (node) {
          const centerOffset = horizontalOffset + totalWidth / 2 - 0.5
          node.position = {
            x: centerOffset * HORIZONTAL_SPACING,
            y: level * VERTICAL_SPACING,
          }
        }

        widthMap.set(nodeId, Math.max(1, totalWidth))
        return totalWidth
      }

      // 为每个根节点计算位置
      const widthMap = new Map<string, number>()
      let currentOffset = 0

      rootNodes.forEach((rootId) => {
        const width = calculateNodePositions(rootId, 0, currentOffset, widthMap)
        currentOffset += width
      })

      // 只保留需要显示的节点
      const filteredNodes = Array.from(nodeMap.values()).filter((node) => processedNodes.has(node.id))

      return { nodes: filteredNodes, edges: edgeList }
    }, [bomData, products])

    // 初始化和更新图形
    useEffect(() => {
      const { nodes: newNodes, edges: newEdges } = buildGraphFromBomData()
      setNodes(newNodes)
      setEdges(newEdges)
      setTimeout(() => fitView({ padding: 0.2 }), 50)
    }, [bomData, buildGraphFromBomData, setNodes, setEdges, fitView])

    // 处理连接创建
    const onConnect = useCallback(
      (connection: Connection) => {
        if (!connection.source || !connection.target) return

        // 检查是否会形成循环依赖
        if (checkForCyclicDependency(connection.target, connection.source, bomData)) {
          onStatusChange("error", "检测到循环依赖，无法创建关系")
          return
        }

        setNewConnection({
          source: connection.source,
          target: connection.target,
        })
        setShowAddDialog(true)
      },
      [bomData, checkForCyclicDependency, onStatusChange],
    )

    // 处理节点点击
    const onNodeClick = useCallback(
      (event: React.MouseEvent, node: Node) => {
        const product = products.find((p) => p.productId === node.id)
        if (product) {
          onSelectProduct(product)
          onSelectAssoc(null)
        }
      },
      [products, onSelectProduct, onSelectAssoc],
    )

    // 处理边点击
    const onEdgeClick = useCallback(
      (event: React.MouseEvent, edge: Edge) => {
        const assoc = bomData.find((a) => a.productId === edge.source && a.productIdTo === edge.target)
        if (assoc) {
          onSelectAssoc(assoc)
          onSelectProduct(null)
        }
      },
      [bomData, onSelectProduct, onSelectAssoc],
    )

    // 处理背景点击
    const onPaneClick = useCallback(() => {
      onSelectProduct(null)
      onSelectAssoc(null)
    }, [onSelectProduct, onSelectAssoc])

    // 处理拖放
    const [, drop] = useDrop({
      accept: "PRODUCT",
      drop: (item: { product: Product }, monitor) => {
        if (!reactFlowWrapper.current) return

        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
        const position = monitor.getClientOffset()

        if (position) {
          const { x, y } = project({
            x: position.x - reactFlowBounds.left,
            y: position.y - reactFlowBounds.top,
          })

          // 创建新节点
          const newNode: Node = {
            id: item.product.productId,
            type: "productNode",
            position: { x, y },
            data: { product: item.product },
          }

          // 检查节点是否已存在
          if (!nodes.some((node) => node.id === item.product.productId)) {
            setNodes((nds) => [...nds, newNode])
            onStatusChange("success", `已添加产品: ${item.product.productName}`)
          } else {
            // 如果节点已存在，更新其位置
            setNodes((nds) =>
              nds.map((node) => (node.id === item.product.productId ? { ...node, position: { x, y } } : node)),
            )
            onStatusChange("info", `已移动产品: ${item.product.productName}`)
          }
        }
      },
    })

    // 处理添加关系对话框确认
    const handleAddAssoc = useCallback(
      (quantity: number, scrapFactor: number) => {
        if (!newConnection) return

        const { source, target } = newConnection

        // 创建新的关系
        const newAssoc: ProductAssoc = {
          productId: source,
          productIdTo: target,
          productAssocTypeId: "MANUF_COMPONENT",
          fromDate: "2024-01-01 00:00:00",
          quantity,
          scrapFactor,
          sequenceNum: bomData.filter((a) => a.productId === source).length + 1,
        }

        // 更新BOM数据
        setBomData([...bomData, newAssoc])

        // 关闭对话框
        setShowAddDialog(false)
        setNewConnection(null)

        onStatusChange("success", "已添加新的BOM关系")
      },
      [newConnection, bomData, setBomData, onStatusChange],
    )

    return (
      <div className="h-full w-full" ref={reactFlowWrapper}>
        <div ref={drop} className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: false,
              style: { strokeWidth: 2 },
            }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            maxZoom={2}
            snapToGrid={true}
            snapGrid={[20, 20]}
          >
            <Background variant="dots" gap={12} size={1} />
            <Controls />
          </ReactFlow>
        </div>

        {showAddDialog && newConnection && (
          <AddAssocDialog
            sourceId={newConnection.source}
            targetId={newConnection.target}
            products={products}
            onConfirm={handleAddAssoc}
            onCancel={() => {
              setShowAddDialog(false)
              setNewConnection(null)
            }}
          />
        )}
      </div>
    )
  },
)

BomCanvasInner.displayName = "BomCanvasInner"

// 包装组件，提供DndProvider和ReactFlowProvider
const BomCanvas = forwardRef<{ relayout: () => void }, BomCanvasProps>((props, ref) => {
  return (
    <ReactFlowProvider>
      <BomCanvasInner {...props} ref={ref} />
    </ReactFlowProvider>
  )
})

BomCanvas.displayName = "BomCanvas"

export default BomCanvas
