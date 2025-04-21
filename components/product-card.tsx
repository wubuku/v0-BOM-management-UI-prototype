"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { productTypes, uomData } from "@/lib/mock-data"

interface ProductCardProps {
  product: Product
  isSelected?: boolean
  showDetails?: boolean
  onSelect?: () => void
  expandable?: boolean
}

export default function ProductCard({
  product,
  isSelected = false,
  showDetails = false,
  onSelect,
  expandable = false,
}: ProductCardProps) {
  const [expanded, setExpanded] = useState(false)
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

  const handleClick = () => {
    if (onSelect) {
      onSelect()
    }
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  // 确定是否显示详情（根据外部控制或内部状态）
  const shouldShowDetails = showDetails || (expandable && expanded)

  return (
    <Card
      className={`${getBgColor()} cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="font-medium truncate" title={product.productName}>
            {product.productName}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getTypeColor()}>
              {productType?.description || product.productTypeId}
            </Badge>
            {expandable && (
              <Button variant="ghost" size="sm" className="p-0 h-6 w-6" onClick={toggleExpand}>
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-1">ID: {product.productId}</div>
        <div className="text-xs text-gray-500 mt-1">单位: {uom?.description || product.quantityUomId}</div>

        {shouldShowDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
            <div>
              <span className="text-xs text-gray-500">描述:</span> {product.description}
            </div>
            <div>
              <span className="text-xs text-gray-500">内部名称:</span> {product.internalName}
            </div>
            {product.isVirtual && (
              <div>
                <span className="text-xs text-gray-500">虚拟产品:</span> 是
              </div>
            )}
            {product.isVariant && (
              <div>
                <span className="text-xs text-gray-500">变体产品:</span> 是
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
