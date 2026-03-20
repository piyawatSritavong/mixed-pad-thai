/**
 * Unit tests for the pure calculateOrder() function.
 * No database or HTTP layer is involved.
 */
import { calculateOrder } from "@/lib/calculator";
import { Product } from "@/types";

const PRODUCTS: Product[] = [
  { id: 1, name: "ผัดไทยไฟแดง",    price: 50,  color: "red",    discountable: false },
  { id: 2, name: "ผัดไทยไฟเขียว",  price: 40,  color: "green",  discountable: true  },
  { id: 3, name: "ผัดไทยไฟน้ำเงิน", price: 30,  color: "blue",   discountable: false },
  { id: 4, name: "ผัดไทยไฟเหลือง", price: 50,  color: "yellow", discountable: false },
  { id: 5, name: "ผัดไทยไฟชมพู",   price: 80,  color: "pink",   discountable: true  },
  { id: 6, name: "ผัดไทยไฟม่วง",   price: 90,  color: "purple", discountable: false },
  { id: 7, name: "ผัดไทยไฟส้ม",    price: 120, color: "orange", discountable: true  },
];

const calc = (
  items: { productId: number; quantity: number }[],
  card?: string
) => calculateOrder(PRODUCTS, items, card);

// ── No-discount cases ─────────────────────────────────────────────────────────

describe("No discounts", () => {
  it("calculates a single ผัดไทยไฟแดง (non-discountable)", () => {
    const r = calc([{ productId: 1, quantity: 1 }]);
    expect(r.totalBeforeDiscount).toBe(50);
    expect(r.discountedItems).toHaveLength(0);
    expect(r.memberCardDiscount).toBe(0);
    expect(r.finalTotal).toBe(50);
  });

  it("calculates two ผัดไทยไฟแดง with no pair discount (red is non-discountable)", () => {
    const r = calc([{ productId: 1, quantity: 2 }]);
    expect(r.totalBeforeDiscount).toBe(100);
    expect(r.discountedItems).toHaveLength(0);
    expect(r.finalTotal).toBe(100);
  });

  it("calculates a single ผัดไทยไฟเขียว – no discount for qty=1", () => {
    const r = calc([{ productId: 2, quantity: 1 }]);
    expect(r.totalBeforeDiscount).toBe(40);
    expect(r.discountedItems).toHaveLength(0);
    expect(r.finalTotal).toBe(40);
  });

  it("ignores items with quantity 0", () => {
    const r = calc([
      { productId: 1, quantity: 0 },
      { productId: 3, quantity: 2 },
    ]);
    expect(r.totalBeforeDiscount).toBe(60);
  });

  it("pair discount NOT applied without member card", () => {
    // ผัดไทยไฟส้ม ×2 without member card → no discount
    const r = calc([{ productId: 7, quantity: 2 }]);
    expect(r.totalBeforeDiscount).toBe(240);
    expect(r.discountedItems).toHaveLength(0);
    expect(r.finalTotal).toBe(240);
  });

  it("pair discount NOT applied with empty member card string", () => {
    const r = calc([{ productId: 7, quantity: 2 }], "");
    expect(r.discountedItems).toHaveLength(0);
    expect(r.finalTotal).toBe(240);
  });

  it("non-discountable items get no pair discount even with member card", () => {
    const r = calc([{ productId: 1, quantity: 2 }], "MEMBER");
    expect(r.discountedItems).toHaveLength(0);
    expect(r.finalTotal).toBe(100);
  });
});

// ── Pair discount (5% per pair, members only) ─────────────────────────────────

describe("Pair discount – members only", () => {
  it("ผัดไทยไฟส้ม ×2 + member → 240 − 12 = 228", () => {
    const r = calc([{ productId: 7, quantity: 2 }], "CARD123");
    expect(r.totalBeforeDiscount).toBe(240);
    expect(r.discountedItems).toHaveLength(1);
    expect(r.discountedItems[0]).toEqual({ name: "ผัดไทยไฟส้ม", discount: -12 });
    expect(r.finalTotal).toBe(228);
  });

  it("ผัดไทยไฟชมพู ×4 + member → 320 − 16 = 304 (two pairs)", () => {
    const r = calc([{ productId: 5, quantity: 4 }], "MEMBER");
    expect(r.totalBeforeDiscount).toBe(320);
    expect(r.discountedItems[0].discount).toBe(-16);
    expect(r.finalTotal).toBe(304);
  });

  it("ผัดไทยไฟเขียว ×3 + member → 120 − 4 = 116 (one pair + one single)", () => {
    const r = calc([{ productId: 2, quantity: 3 }], "MEMBER");
    expect(r.totalBeforeDiscount).toBe(120);
    expect(r.discountedItems[0].discount).toBe(-4);
    expect(r.finalTotal).toBe(116);
  });

  it("ผัดไทยไฟส้ม ×5 + member → two pairs discounted, one single", () => {
    // pairs=2, discount = 2 × 2 × 120 × 0.05 = 24
    const r = calc([{ productId: 7, quantity: 5 }], "MEMBER");
    expect(r.totalBeforeDiscount).toBe(600);
    expect(r.discountedItems[0].discount).toBe(-24);
    expect(r.finalTotal).toBe(576);
  });

  it("multiple discountable items each get their own pair discount", () => {
    // ผัดไทยไฟส้ม ×2: discount=12, ผัดไทยไฟเขียว ×2: discount=4
    const r = calc(
      [
        { productId: 7, quantity: 2 },
        { productId: 2, quantity: 2 },
      ],
      "MEMBER"
    );
    expect(r.totalBeforeDiscount).toBe(320); // 240 + 80
    expect(r.discountedItems).toHaveLength(2);
    const total = r.discountedItems.reduce((s, d) => s + Math.abs(d.discount), 0);
    expect(total).toBe(16); // 12 + 4
    expect(r.finalTotal).toBe(304);
  });

  it("mixed order – non-discountable + discountable + member card", () => {
    // ผัดไทยไฟแดง ×1=50, ผัดไทยไฟน้ำเงิน ×1=30, ผัดไทยไฟเขียว ×2=80−4=76 → total=160
    const r = calc(
      [
        { productId: 1, quantity: 1 },
        { productId: 3, quantity: 1 },
        { productId: 2, quantity: 2 },
      ],
      "MEMBER"
    );
    expect(r.totalBeforeDiscount).toBe(160);
    expect(r.discountedItems).toHaveLength(1);
    expect(r.discountedItems[0].discount).toBe(-4);
    expect(r.memberCardDiscount).toBe(0);
    expect(r.finalTotal).toBe(156);
  });
});

// ── memberCardDiscount is always 0 ────────────────────────────────────────────

describe("memberCardDiscount is always 0", () => {
  it("returns memberCardDiscount=0 for non-member order", () => {
    const r = calc([{ productId: 3, quantity: 2 }]);
    expect(r.memberCardDiscount).toBe(0);
    expect(r.finalTotal).toBe(60);
  });

  it("returns memberCardDiscount=0 even for member with discountable items", () => {
    const r = calc([{ productId: 7, quantity: 2 }], "VIP");
    expect(r.memberCardDiscount).toBe(0);
    // Only pair discount applies: 240 − 12 = 228
    expect(r.finalTotal).toBe(228);
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe("Error handling", () => {
  it("throws when an order item references an unknown product id", () => {
    expect(() => calc([{ productId: 999, quantity: 1 }])).toThrow(
      "Product id=999 not found"
    );
  });
});
