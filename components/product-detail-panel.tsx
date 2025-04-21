"use client"

import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Product } from "@/lib/types"
import { productTypes, uomData } from "@/lib/mock-data"

interface ProductDetailPanelProps {
  product: Product | null
  onAddChild: () => void
}

export default function ProductDetailPanel({ product, onAddChild }: ProductDetailPanelProps) {
  if (!product) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-gray-500 text-center">
        请从树形视图中选择一个节点查看详情
      </div>
    )
  }

  const productType = productTypes.find((t) => t.id === product.productTypeId)
  const uom = uomData.find((u) => u.id === product.quantityUomId)

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">产品详情</h2>
        <Button variant="outline" size="sm" onClick={onAddChild} className="flex items-center gap-1">
          <PlusCircle className="h-3 w-3" />
          <span>添加子节点</span>
        </Button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        <div>
          <Label className="text-xs text-gray-500">产品名称</Label>
          <div className="font-medium">{product.productName}</div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">产品ID</Label>
          <div>{product.productId}</div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">描述</Label>
          <div className="text-sm">{product.description}</div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">内部名称</Label>
          <div>{product.internalName}</div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">产品类型</Label>
          <div>{productType?.description || product.productTypeId}</div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">单位</Label>
          <div>{uom?.description || product.quantityUomId}</div>
        </div>

        {product.isVirtual && (
          <div>
            <Label className="text-xs text-gray-500">虚拟产品</Label>
            <div>是</div>
          </div>
        )}

        {product.isVariant && (
          <div>
            <Label className="text-xs text-gray-500">变体产品</Label>
            <div>是</div>
          </div>
        )}
      </div>
    </div>
  )
}
