import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import type { Product } from "@/lib/types"
import { productTypes, uomData } from "@/lib/mock-data"

interface ProductNodeData {
  product: Product
}

function ProductNode({ data }: NodeProps<ProductNodeData>) {
  const { product } = data
  const productType = productTypes.find((t) => t.id === product.productTypeId)
  const uom = uomData.find((u) => u.id === product.quantityUomId)

  const getBgColor = () => {
    switch (product.productTypeId) {
      case "RAW_MATERIAL":
        return "bg-blue-50 border-blue-200"
      case "WIP":
        return "bg-amber-50 border-amber-200"
      case "FINISHED_GOOD":
        return "bg-green-50 border-green-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getTypeColor = () => {
    switch (product.productTypeId) {
      case "RAW_MATERIAL":
        return "bg-blue-100 text-blue-800"
      case "WIP":
        return "bg-amber-100 text-amber-800"
      case "FINISHED_GOOD":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className={`px-4 py-2 rounded-md border-2 shadow-sm ${getBgColor()} min-w-[180px] max-w-[220px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" isConnectable={false} />

      <div className="font-medium text-sm truncate" title={product.productName}>
        {product.productName}
      </div>
      <div className="text-xs text-gray-500 truncate" title={product.productId}>
        ID: {product.productId}
      </div>
      <div className="text-xs text-gray-500">单位: {uom?.description || product.quantityUomId}</div>

      <div className="mt-1">
        <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeColor()}`}>
          {productType?.description || product.productTypeId}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400" isConnectable={true} />
    </div>
  )
}

export default memo(ProductNode)
