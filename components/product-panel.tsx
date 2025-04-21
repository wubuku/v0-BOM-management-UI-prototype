"use client"

import { useState } from "react"
import { Search, Filter, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Product, ProductAssoc } from "@/lib/types"
import { productTypes, uomData } from "@/lib/mock-data"
import ProductCard from "./product-card"
import AssocEditor from "./assoc-editor"

interface ProductPanelProps {
  products: Product[]
  selectedProduct: Product | null
  selectedAssoc: ProductAssoc | null
  onUpdateAssoc: (updatedAssoc: ProductAssoc) => void
  onAddAssoc: (newAssoc: ProductAssoc) => void
}

export default function ProductPanel({
  products,
  selectedProduct,
  selectedAssoc,
  onUpdateAssoc,
  onAddAssoc,
}: ProductPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedChildProduct, setSelectedChildProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState("1")
  const [scrapFactor, setScrapFactor] = useState("0")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType ? product.productTypeId === filterType : true

    return matchesSearch && matchesType
  })

  const handleAddAssoc = () => {
    if (!selectedProduct || !selectedChildProduct) return

    const newAssoc: ProductAssoc = {
      productId: selectedProduct.productId,
      productIdTo: selectedChildProduct.productId,
      productAssocTypeId: "MANUF_COMPONENT",
      fromDate: "2024-01-01 00:00:00",
      quantity: Number.parseFloat(quantity),
      scrapFactor: Number.parseFloat(scrapFactor),
      sequenceNum: 1,
    }

    onAddAssoc(newAssoc)
    setShowAddDialog(false)
    setSelectedChildProduct(null)
    setQuantity("1")
    setScrapFactor("0")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-medium mb-4">产品面板</h2>

        <div className="space-y-3">
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
                <SelectItem value="ALL">全部类型</SelectItem>
                {productTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectedAssoc ? (
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="text-md font-medium mb-3">关系属性编辑</h3>
          <AssocEditor assoc={selectedAssoc} onUpdate={onUpdateAssoc} />
        </div>
      ) : selectedProduct ? (
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-md font-medium">产品详情</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>添加子产品</span>
            </Button>
          </div>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-gray-500">产品ID</Label>
              <div>{selectedProduct.productId}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">产品名称</Label>
              <div>{selectedProduct.productName}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">描述</Label>
              <div className="text-sm">{selectedProduct.description}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">产品类型</Label>
              <div>
                {productTypes.find((t) => t.id === selectedProduct.productTypeId)?.description ||
                  selectedProduct.productTypeId}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">单位</Label>
              <div>
                {uomData.find((u) => u.id === selectedProduct.quantityUomId)?.description ||
                  selectedProduct.quantityUomId}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.map((product) => (
            <div key={product.productId} onClick={() => setSelectedChildProduct(product)}>
              <ProductCard product={product} isSelected={selectedChildProduct?.productId === product.productId} />
            </div>
          ))}

          {filteredProducts.length === 0 && <div className="text-center py-8 text-gray-500">没有找到匹配的产品</div>}
        </div>
      </div>

      {/* 添加子产品对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加子产品</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="parentProduct">父产品</Label>
              <div className="p-2 border rounded-md mt-1">{selectedProduct?.productName}</div>
            </div>

            <div>
              <Label htmlFor="childProduct">子产品</Label>
              <div className="p-2 border rounded-md mt-1">
                {selectedChildProduct ? (
                  selectedChildProduct.productName
                ) : (
                  <span className="text-gray-500">请从产品列表中选择</span>
                )}
              </div>
            </div>

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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddAssoc} disabled={!selectedChildProduct}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
