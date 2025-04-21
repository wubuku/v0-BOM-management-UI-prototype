export interface Product {
  productId: string
  productName: string
  description: string
  productTypeId: string
  internalName: string
  quantityUomId: string
  isVirtual?: boolean
  isVariant?: boolean
}

export interface ProductAssoc {
  productId: string
  productIdTo: string
  productAssocTypeId: string
  fromDate: string
  quantity: number
  scrapFactor?: number
  sequenceNum?: number
  routingWorkEffortId?: string
}

export interface ProductType {
  id: string
  description: string
}

export interface UnitOfMeasure {
  id: string
  description: string
}
