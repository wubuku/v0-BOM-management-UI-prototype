"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { ProductAssoc } from "@/lib/types"
import { products } from "@/lib/mock-data"

interface AssocEditorProps {
  assoc: ProductAssoc
  onUpdate: (updatedAssoc: ProductAssoc) => void
}

export default function AssocEditor({ assoc, onUpdate }: AssocEditorProps) {
  const [quantity, setQuantity] = useState(assoc.quantity.toString())
  const [scrapFactor, setScrapFactor] = useState((assoc.scrapFactor || 0).toString())
  const [error, setError] = useState<string | null>(null)

  const parentProduct = products.find((p) => p.productId === assoc.productId)
  const childProduct = products.find((p) => p.productId === assoc.productIdTo)

  const handleUpdate = () => {
    const numQuantity = Number.parseFloat(quantity)
    const numScrapFactor = Number.parseFloat(scrapFactor)

    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError("数量必须为正数")
      return
    }

    if (isNaN(numScrapFactor) || numScrapFactor < 0 || numScrapFactor > 100) {
      setError("报废率必须在0-100%之间")
      return
    }

    setError(null)
    onUpdate({
      ...assoc,
      quantity: numQuantity,
      scrapFactor: numScrapFactor,
    })
  }

  if (!parentProduct || !childProduct) {
    return <div>找不到相关产品信息</div>
  }

  return (
    <div className="space-y-4">
      <div className="text-sm">
        <div className="font-medium">{parentProduct.productName}</div>
        <div className="text-gray-500">使用</div>
        <div className="font-medium">{childProduct.productName}</div>
      </div>

      <div className="space-y-2">
        <div>
          <Label htmlFor="quantity">数量</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="scrapFactor">报废率 (%)</Label>
          <Input
            id="scrapFactor"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={scrapFactor}
            onChange={(e) => setScrapFactor(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <Button onClick={handleUpdate} className="w-full">
        更新关系
      </Button>
    </div>
  )
}
