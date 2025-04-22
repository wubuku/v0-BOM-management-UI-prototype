import type { Product, ProductAssoc, ProductType, UnitOfMeasure } from "./types"

// 产品类型数据
export const productTypes: ProductType[] = [
  { id: "RAW_MATERIAL", description: "原材料" },
  { id: "WIP", description: "半成品" },
  { id: "FINISHED_GOOD", description: "成品" },
]

// 单位数据
export const uomData: UnitOfMeasure[] = [
  { id: "GRM", description: "克" },
  { id: "PCE", description: "个" },
  { id: "MLT", description: "毫升" },
]

// 产品数据
export const products: Product[] = [
  // 原材料
  {
    productId: "RAW_FLOUR",
    productName: "Cake Flour",
    description: "Standard Cake Flour",
    internalName: "CAKE_FLOUR",
    productTypeId: "RAW_MATERIAL",
    quantityUomId: "GRM",
  },
  {
    productId: "RAW_EGG",
    productName: "Fresh Eggs",
    description: "Fresh Chicken Eggs",
    internalName: "FRESH_EGG",
    productTypeId: "RAW_MATERIAL",
    quantityUomId: "PCE",
  },
  {
    productId: "RAW_SUGAR",
    productName: "White Sugar",
    description: "Refined White Sugar",
    internalName: "WHITE_SUGAR",
    productTypeId: "RAW_MATERIAL",
    quantityUomId: "GRM",
  },
  {
    productId: "RAW_MILK",
    productName: "Whole Milk",
    description: "Fresh Whole Milk",
    internalName: "WHOLE_MILK",
    productTypeId: "RAW_MATERIAL",
    quantityUomId: "MLT",
  },
  {
    productId: "RAW_CHOC",
    productName: "Dark Chocolate",
    description: "Premium Dark Chocolate",
    internalName: "DARK_CHOCOLATE",
    productTypeId: "RAW_MATERIAL",
    quantityUomId: "GRM",
  },
  {
    productId: "RAW_CREAM",
    productName: "Whipping Cream",
    description: "Fresh Whipping Cream",
    internalName: "WHIPPING_CREAM",
    productTypeId: "RAW_MATERIAL",
    quantityUomId: "MLT",
  },
  {
    productId: "RAW_FRUIT",
    productName: "Mixed Fruits",
    description: "Mixed Berries (Strawberry/Blueberry)",
    internalName: "MIXED_FRUIT",
    productTypeId: "RAW_MATERIAL",
    quantityUomId: "GRM",
  },

  // 半成品
  {
    productId: "WIP_CAKE_BASE",
    productName: "Cake Base",
    description: "Standard Cake Base",
    internalName: "CAKE_BASE",
    productTypeId: "WIP",
    quantityUomId: "PCE",
  },
  {
    productId: "WIP_CREAM_FILL",
    productName: "Cream Filling",
    description: "Whipped Cream Filling",
    internalName: "CREAM_FILLING",
    productTypeId: "WIP",
    quantityUomId: "PCE",
  },
  {
    productId: "WIP_CHOC_SAUCE",
    productName: "Chocolate Sauce",
    description: "Chocolate Sauce",
    internalName: "CHOCOLATE_SAUCE",
    productTypeId: "WIP",
    quantityUomId: "PCE",
  },

  // 成品
  {
    productId: "CHOC_CAKE_VIRTUAL",
    productName: "Chocolate Cake",
    description: "Chocolate Cake (Virtual Product)",
    internalName: "CHOCOLATE_CAKE",
    productTypeId: "FINISHED_GOOD",
    quantityUomId: "PCE",
    isVirtual: true,
  },
  {
    productId: "CHOC_CAKE_STD",
    productName: "Standard Chocolate Cake",
    description: "Standard Chocolate Cake",
    internalName: "STANDARD_CHOC_CAKE",
    productTypeId: "FINISHED_GOOD",
    quantityUomId: "PCE",
    isVariant: true,
  },
  {
    productId: "CHOC_CAKE_DLX",
    productName: "Deluxe Chocolate Cake",
    description: "Deluxe Chocolate Cake",
    internalName: "DELUXE_CHOC_CAKE",
    productTypeId: "FINISHED_GOOD",
    quantityUomId: "PCE",
    isVariant: true,
  },
  {
    productId: "CHOC_CAKE_MINI",
    productName: "Mini Chocolate Cake",
    description: "Mini Chocolate Cake",
    internalName: "MINI_CHOC_CAKE",
    productTypeId: "FINISHED_GOOD",
    quantityUomId: "PCE",
    isVariant: true,
  },
]

// BOM关系数据
export const productAssocs: ProductAssoc[] = [
  // 蛋糕胚配方
  {
    productId: "WIP_CAKE_BASE",
    productIdTo: "RAW_FLOUR",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 500.0,
    scrapFactor: 5,
    sequenceNum: 1,
  },
  {
    productId: "WIP_CAKE_BASE",
    productIdTo: "RAW_EGG",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 4,
    scrapFactor: 10,
    sequenceNum: 2,
  },
  {
    productId: "WIP_CAKE_BASE",
    productIdTo: "RAW_SUGAR",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 200.0,
    scrapFactor: 2,
    sequenceNum: 3,
  },
  {
    productId: "WIP_CAKE_BASE",
    productIdTo: "RAW_MILK",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 250.0,
    scrapFactor: 3,
    sequenceNum: 4,
  },

  // 奶油夹心配方
  {
    productId: "WIP_CREAM_FILL",
    productIdTo: "RAW_CREAM",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 500.0,
    scrapFactor: 8,
    sequenceNum: 1,
  },
  {
    productId: "WIP_CREAM_FILL",
    productIdTo: "RAW_SUGAR",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 100.0,
    scrapFactor: 2,
    sequenceNum: 2,
  },

  // 巧克力酱配方
  {
    productId: "WIP_CHOC_SAUCE",
    productIdTo: "RAW_CHOC",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 300.0,
    scrapFactor: 5,
    sequenceNum: 1,
  },
  {
    productId: "WIP_CHOC_SAUCE",
    productIdTo: "RAW_MILK",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 100.0,
    scrapFactor: 3,
    sequenceNum: 2,
  },

  // 标准蛋糕配方
  {
    productId: "CHOC_CAKE_STD",
    productIdTo: "WIP_CAKE_BASE",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 1,
    scrapFactor: 10,
    sequenceNum: 1,
    routingWorkEffortId: "TASK_CAKE_SLICE",
  },
  {
    productId: "CHOC_CAKE_STD",
    productIdTo: "WIP_CREAM_FILL",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 1,
    scrapFactor: 15,
    sequenceNum: 2,
    routingWorkEffortId: "TASK_CAKE_FILL",
  },

  // 豪华蛋糕配方 - 已注释掉，用于测试添加子节点功能
  /*
  {
    productId: "CHOC_CAKE_DLX",
    productIdTo: "WIP_CAKE_BASE",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 2,
    scrapFactor: 10,
    sequenceNum: 1,
    routingWorkEffortId: "TASK_CAKE_SLICE",
  },
  {
    productId: "CHOC_CAKE_DLX",
    productIdTo: "WIP_CREAM_FILL",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 2,
    scrapFactor: 15,
    sequenceNum: 2,
    routingWorkEffortId: "TASK_CAKE_FILL",
  },
  {
    productId: "CHOC_CAKE_DLX",
    productIdTo: "WIP_CHOC_SAUCE",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 1,
    scrapFactor: 5,
    sequenceNum: 3,
    routingWorkEffortId: "TASK_CAKE_DECOR",
  },
  {
    productId: "CHOC_CAKE_DLX",
    productIdTo: "RAW_FRUIT",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 200.0,
    scrapFactor: 20,
    sequenceNum: 4,
    routingWorkEffortId: "TASK_CAKE_DECOR",
  },
  */

  // 迷你蛋糕配方
  {
    productId: "CHOC_CAKE_MINI",
    productIdTo: "WIP_CAKE_BASE",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 0.5,
    scrapFactor: 10,
    sequenceNum: 1,
    routingWorkEffortId: "TASK_CAKE_SLICE",
  },
  {
    productId: "CHOC_CAKE_MINI",
    productIdTo: "WIP_CREAM_FILL",
    productAssocTypeId: "MANUF_COMPONENT",
    fromDate: "2024-01-01 00:00:00",
    quantity: 0.3,
    scrapFactor: 15,
    sequenceNum: 2,
    routingWorkEffortId: "TASK_CAKE_FILL",
  },
]
