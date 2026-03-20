// ── Domain models ────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  price: number;
  color: string;
  /** True for Orange, Pink, Green – eligible for the 5 % pair discount */
  discountable: boolean;
}

// ── API request / response shapes ────────────────────────────────────────────

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CalculationRequest {
  items: OrderItem[];
  memberCardNumber?: string;
}

export interface DiscountDetail {
  /** Product name that received a pair discount */
  name: string;
  /** Always a negative number (e.g. -12) */
  discount: number;
}

export interface CalculationResponse {
  totalBeforeDiscount: number;
  discountedItems: DiscountDetail[];
  memberCardDiscount: number;
  finalTotal: number;
}

// ── Client-side order history ─────────────────────────────────────────────────

export interface OrderLineItem {
  product: Product;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  tableNumber: string;
  items: OrderLineItem[];
  memberCard?: string;
  result: CalculationResponse;
  createdAt: string; // ISO string
}
