"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Product } from "@/lib/types"

interface AddAssocDialogProps {
  sourceId: string
  targetId: string
  products: Product[]
  onConfirm: (quantity: number, scrapFactor: number) => void
  onCancel: () => void
}

export default function AddAssocDialog({ sourceId, targetId, products, onConfirm, onCancel }: AddAssocDialogProps) {
  const [quantity, setQuantity] = useState("1")
  const [scrapFactor, setScrapFactor] = useState("0")
  const [error, setError] = useState<string | null>(null)

  const sourceProduct = products.find((p) => p.productId === sourceId)
  const targetProduct = products.find((p) => p.productId === targetId)

  const handleConfirm = () => {
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

    onConfirm(numQuantity, numScrapFactor)
  }

  if (!sourceProduct || !targetProduct) {
    return null
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加BOM关系</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="text-sm">
              <span className="font-medium">{sourceProduct.productName}</span>
              <span className="text-gray-500"> 使用 </span>
              <span className="font-medium">{targetProduct.productName}</span>
            </div>
          </div>

          <div className="grid gap-2">
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

          <div className="grid gap-2">
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

          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
