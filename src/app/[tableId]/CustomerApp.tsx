"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import MenuCard from "@/components/MenuCard";
import ProductModal from "@/components/ProductModal";
import CartPanel from "@/components/CartPanel";
import AlertModal from "@/components/AlertModal";
import BottomNav from "@/components/BottomNav";
import FavoritesPage from "@/components/FavoritesPage";
import OrdersPage from "@/components/OrdersPage";
import ProfilePage from "@/components/ProfilePage";
import { Product, CalculationResponse, OrderRecord, OrderLineItem } from "@/types";

type NavTab = "home" | "favorites" | "cart" | "orders" | "profile";
type QuantityMap = Record<number, number>;

export default function CustomerApp({ tableId }: { tableId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<QuantityMap>({});
  const [memberCard, setMemberCard] = useState("");
  const [result, setResult] = useState<CalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<NavTab>("home");

  const [favorites, setFavorites] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(`favorites_${tableId}`);
      return raw ? new Set<number>(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`orderHistory_${tableId}`);
      return raw ? (JSON.parse(raw) as OrderRecord[]) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(`favorites_${tableId}`, JSON.stringify([...favorites]));
  }, [favorites, tableId]);

  useEffect(() => {
    localStorage.setItem(`orderHistory_${tableId}`, JSON.stringify(orderHistory));
  }, [orderHistory, tableId]);

  // Clear localStorage if table is currently vacant (session reset after checkout)
  useEffect(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((tables: { table_number: string; status: string }[]) => {
        const found = tables.find((t) => t.table_number === tableId);
        if (found?.status === "vacant") {
          localStorage.removeItem(`orderHistory_${tableId}`);
          localStorage.removeItem(`favorites_${tableId}`);
          setOrderHistory([]);
          setFavorites(new Set());
        }
      })
      .catch(() => {});
  }, [tableId]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Product[]) => {
        setProducts(data);
        setQuantities(data.reduce<QuantityMap>((a, p) => ({ ...a, [p.id]: 0 }), {}));
      })
      .catch(() => setFetchError("ไม่สามารถโหลดเมนูได้ กรุณาลองใหม่อีกครั้ง"));
  }, []);

  const cartCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  function increment(id: number) {
    setQuantities((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
  }
  function decrement(id: number) {
    setQuantities((p) => ({ ...p, [id]: Math.max(0, (p[id] ?? 0) - 1) }));
  }
  function toggleFavorite(id: number) {
    setFavorites((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function handleCalculate() {
    const items = Object.entries(quantities)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => ({ productId: Number(id), quantity: q }));
    if (items.length === 0) { setError("กรุณาเพิ่มรายการอาหารก่อนยืนยันออเดอร์"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, memberCardNumber: memberCard.trim() || undefined, tableNumber: tableId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setAlertMessage(data.error ?? "ผัดไทยไฟแดง สามารถสั่งได้เพียง 1 ที่ต่อลูกค้า 1 ท่าน ภายใน 1 ชั่วโมง");
        else setError(data.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
        return;
      }
      const calcResult = data as CalculationResponse;
      setResult(calcResult);

      const orderItems: OrderLineItem[] = items
        .map(({ productId, quantity }) => {
          const product = products.find((p) => p.id === productId);
          return product ? { product, quantity } : null;
        })
        .filter((x): x is OrderLineItem => x !== null);

      setOrderHistory((prev) => [{
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        tableNumber: tableId, items: orderItems,
        memberCard: memberCard.trim() || undefined,
        result: calcResult, createdAt: new Date().toISOString(),
      }, ...prev]);
    } catch {
      setError("เกิดข้อผิดพลาดทางเครือข่าย กรุณาลองใหม่");
    } finally { setLoading(false); }
  }

  function handleReset() { setResult(null); setError(null); }
  function openCart() { setCartOpen(true); setActiveNav("cart"); }
  function closeCart() { setCartOpen(false); setActiveNav("home"); }
  function navigateTo(tab: NavTab) {
    if (tab === "cart") openCart();
    else { setCartOpen(false); setActiveNav(tab); }
  }

  const showAltPage = activeNav !== "home" && activeNav !== "cart";

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <Header
        cartCount={cartCount} activeNav={activeNav}
        onHome={() => navigateTo("home")} onFavorites={() => navigateTo("favorites")}
        onCart={() => navigateTo("cart")} onOrders={() => navigateTo("orders")}
        onProfile={() => navigateTo("profile")}
      />

      <main className="pt-20 pb-24 md:pb-8">
        {fetchError ? (
          <div className="mx-auto max-w-lg px-4 py-8">
            <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
              <p className="text-red-600 font-medium">{fetchError}</p>
              <button onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-[#9E080F] text-white rounded-full text-sm font-bold hover:bg-[#7A060B] transition-colors">
                ลองใหม่
              </button>
            </div>
          </div>
        ) : showAltPage ? (
          <div className="pt-2">
            {activeNav === "favorites" && (
              <FavoritesPage products={products} favorites={favorites} quantities={quantities}
                onToggleFavorite={toggleFavorite} onIncrement={increment} onDecrement={decrement}
                onClick={setSelectedProduct} />
            )}
            {activeNav === "orders" && <OrdersPage orders={orderHistory} />}
            {activeNav === "profile" && (
              <ProfilePage tableId={tableId} />
            )}
          </div>
        ) : (
          <div className="px-4 lg:px-8 max-w-7xl mx-auto">
            <PromoBanner />
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-800">เมนูทั้งหมด</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">{products.length} รายการ</span>
                  {cartCount > 0 && (
                    <button onClick={openCart} className="text-xs text-[#9E080F] font-bold hover:underline">
                      ดูตะกร้า ({cartCount})
                    </button>
                  )}
                </div>
              </div>
              {products.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
                      <div className="h-36 bg-gray-200" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-5 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <MenuCard key={product.id} product={product}
                      quantity={quantities[product.id] ?? 0}
                      isFavorite={favorites.has(product.id)}
                      onIncrement={() => increment(product.id)}
                      onDecrement={() => decrement(product.id)}
                      onToggleFavorite={() => toggleFavorite(product.id)}
                      onClick={() => setSelectedProduct(product)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductModal product={selectedProduct}
          quantity={quantities[selectedProduct.id] ?? 0}
          isFavorite={favorites.has(selectedProduct.id)}
          onIncrement={() => increment(selectedProduct.id)}
          onDecrement={() => decrement(selectedProduct.id)}
          onToggleFavorite={() => toggleFavorite(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)} />
      )}

      <CartPanel isOpen={cartOpen} products={products} quantities={quantities}
        memberCard={memberCard} result={result} error={error} loading={loading}
        onClose={closeCart} onIncrement={increment} onDecrement={decrement}
        onMemberCardChange={setMemberCard} onCalculate={handleCalculate} onReset={handleReset}
        onComplete={() => {
          setQuantities(products.reduce<QuantityMap>((a, p) => ({ ...a, [p.id]: 0 }), {}));
          setMemberCard(""); handleReset(); closeCart();
        }} />

      {alertMessage && <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />}

      <BottomNav activeNav={activeNav} cartCount={cartCount}
        onHome={() => navigateTo("home")} onFavorites={() => navigateTo("favorites")}
        onCart={() => navigateTo("cart")} onOrders={() => navigateTo("orders")}
        onProfile={() => navigateTo("profile")} />
    </div>
  );
}
