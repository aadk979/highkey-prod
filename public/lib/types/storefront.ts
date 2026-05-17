export type ProductType = "base" | "accessory";

export type ProductDimensions = {
  maxWidthMm: number;
  maxHeightMm: number;
  minWidthMm: number;
  minHeightMm: number;
  maxPatches: number;
};

export type ProductImage = {
  id: string;
  url: string;
  filename?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  productType: ProductType;
  isCustomizable: boolean;
  basePriceCents: number;
  currencyCode: string;
  imageIds: string[];
  customisationImageIds?: string[];
  dimensions: ProductDimensions | null;
  isActive: boolean;
  availableStock: number;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedProducts = {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PublicPromotion = {
  id: string;
  productId: string | null;
  storeWide: boolean;
  discountPercentage: number | null;
  discountValueCents: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: Product | null;
};

export type PaginatedPromotions = {
  data: PublicPromotion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CollectionLocation = {
  id: string;
  name: string;
  address: string;
  postalCode: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FulfillmentMethodQuote = "delivery" | "self_collect";
export type FulfillmentMethodSession = "self_collect" | "delivery";

export type CheckoutCustomer = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
};

export type CheckoutFulfillmentQuote = {
  method: FulfillmentMethodQuote;
  collectionLocationId?: string;
  deliveryAddress?: string;
};

export type CheckoutFulfillmentSession = {
  method: FulfillmentMethodSession;
  collectionLocationId?: string | null;
  deliveryAddress?: string | null;
};

export type CheckoutItem = {
  productId: string;
  quantity: number;
};

export type CheckoutQuoteRequest = {
  customer: CheckoutCustomer;
  customerNote?: string;
  promotionId?: string | null;
  customizationMeta?: Record<string, string | number | boolean>;
  fulfillment: CheckoutFulfillmentQuote;
  items: CheckoutItem[];
};

export type CheckoutSessionRequest = {
  items: CheckoutItem[];
  promotionId?: string | null;
  customer: CheckoutCustomer;
  fulfillment: CheckoutFulfillmentSession;
  customizationMeta?: Record<string, string | number | boolean>;
  customerNote?: string | null;
};

export type QuoteLineItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  discountCents: number;
  lineTotalCents: number;
};

export type CheckoutQuote = {
  currencyCode: string;
  items: QuoteLineItem[];
  subtotalCents: number;
  discountTotalCents: number;
  taxTotalCents: number;
  shippingTotalCents: number;
  grandTotalCents: number;
  promotion: {
    id: string | null;
    applied: boolean;
    reason: string | null;
  };
};

export type CheckoutSession = {
  orderId: string;
  orderNumber: number;
  publicToken: string;
  checkoutUrl: string;
};

export type OrderStatus =
  | "received"
  | "preparing"
  | "shipped_out"
  | "delivered"
  | "collection_scheduled"
  | "collected"
  | "cancelled"
  | "refunded"
  | "disputed";

export type PaymentStatus =
  | "pending"
  | "requires_action"
  | "paid"
  | "failed"
  | "cancelled"
  | "partially_refunded"
  | "refunded"
  | "disputed"
  | "disputed_won"
  | "disputed_lost";

export type Promotion = {
  id: string;
  productId: string | null;
  storeWide: boolean;
  discountPercentage: number | null;
  discountValueCents: number | null;
  startDate: string;
  endDate: string;
  trackByPhone: boolean;
  usageLimit: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  appliedPromotionId: string | null;
  snapshotName: string;
  snapshotSlug: string;
  quantity: number;
  unitPriceCents: number;
  discountCents: number;
  lineTotalCents: number;
  createdAt: string;
  product: Product | null;
};

export type Order = {
  id: string;
  orderNumber: number;
  publicToken: string;
  customerName: string;
  customerEmail: string;
  countryCode: string;
  customerPhone: string;
  fulfillmentMethod: "self_collect" | "delivery";
  deliveryAddress: string | null;
  collectionLocationId: string | null;
  subtotalCents: number;
  discountTotalCents: number;
  taxTotalCents: number;
  shippingTotalCents: number;
  grandTotalCents: number;
  refundedAmountCents: number;
  currencyCode: string;
  promotionId: string | null;
  customizationMeta: Record<string, unknown> | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  customerNote: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  disputeReason: string | null;
  disputeStatus: string | null;
  disputeDueBy: string | null;
  disputedAt: string | null;
  disputeResolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  collectionLocation: CollectionLocation | null;
  promotion: Promotion | null;
};

export type ApiError = { error: string };
