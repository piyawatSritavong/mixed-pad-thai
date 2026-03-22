// ── Customer domain models ────────────────────────────────────────────────────

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
  tableNumber?: string;
}

export interface DiscountDetail {
  name: string;
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
  createdAt: string;
}

// ── Admin types ───────────────────────────────────────────────────────────────

export interface RestaurantTable {
  id: number;
  table_number: string;
  capacity: number;
  status: "vacant" | "occupied" | "bill_requested" | "staff_called";
  is_active: boolean;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  role: "admin" | "manager" | "staff";
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: number;
  table_number: string | null;
  member_card_number: string | null;
  total_before_discount: number;
  pair_discount_total: number;
  member_card_discount: number;
  final_total: number;
  status: string;
  created_at: string;
  items: OrderRowItem[];
}

export interface OrderRowItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface SessionUser {
  user_id: number;
  username: string;
  role: string;
  full_name: string;
}
