import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { productTypes, uomData } from "@/lib/mock-data"

interface ProductCardProps {
  product: Product
  isSelected?: boolean
}

export default function ProductCard({ product, isSelected = false }: ProductCardProps) {
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
    <Card
      className={`${getBgColor()} cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"
      }`}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="font-medium truncate" title={product.productName}>
            {product.productName}
          </div>
          <Badge variant="secondary" className={getTypeColor()}>
            {productType?.description || product.productTypeId}
          </Badge>
        </div>

        <div className="text-xs text-gray-500 mt-1">ID: {product.productId}</div>

        <div className="text-xs text-gray-500 mt-1">单位: {uom?.description || product.quantityUomId}</div>
      </CardContent>
    </Card>
  )
}
