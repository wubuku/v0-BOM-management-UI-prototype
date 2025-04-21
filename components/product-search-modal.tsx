"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { productTypes } from "@/lib/mock-data"
import ProductCard from "./product-card"
import { products } from "@/lib/mock-data" // Import products

interface ProductSearchModalProps {
  open: boolean
  onClose: () => void
  onSelectProduct: (product: Product) => void
  title?: string
  actionLabel?: string
}

export default function ProductSearchModal({
  open,
  onClose,
  onSelectProduct,
  title = "选择产品",
  actionLabel = "选择",
}: ProductSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleReset = () => {
    setSearchTerm("")
    setFilterType("")
    setSelectedProduct(null)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleSelect = () => {
    if (selectedProduct) {
      onSelectProduct(selectedProduct)
      handleReset()
      onClose()
    }
  }

  const filteredProducts =
    productTypes.length > 0
      ? products.filter((product) => {
          const matchesSearch =
            product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.productName.toLowerCase().includes(searchTerm.toLowerCase())

          const matchesType = filterType ? product.productTypeId === filterType : true

          return matchesSearch && matchesType
        })
      : []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 max-h-[70vh]">
          {/* 搜索和筛选 */}
          <div className="space-y-3 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索产品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="按类型筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 搜索结果列表 */}
          <div className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-md my-2">
            <div className="grid grid-cols-1 gap-3">
              {filteredProducts.map((product) => (
                <div key={product.productId}>
                  <ProductCard
                    product={product}
                    isSelected={selectedProduct?.productId === product.productId}
                    expandable={true}
                    onSelect={() => setSelectedProduct(product)}
                  />
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">没有找到匹配的产品</div>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSelect} disabled={!selectedProduct}>
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
