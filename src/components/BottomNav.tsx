"use client";

type NavTab = "home" | "favorites" | "cart" | "orders" | "profile";

interface BottomNavProps {
  activeNav: NavTab;
  cartCount: number;
  onHome: () => void;
  onFavorites: () => void;
  onCart: () => void;
  onOrders: () => void;
  onProfile: () => void;
}

export default function BottomNav({
  activeNav,
  cartCount,
  onHome,
  onFavorites,
  onCart,
  onOrders,
  onProfile,
}: BottomNavProps) {
  const tabCls = (tab: NavTab) =>
    `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors ${
      activeNav === tab ? "text-[#9E080F] bg-red-50" : "text-gray-400"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {/* Home */}
        <button onClick={onHome} className={tabCls("home")}>
          <svg
            className="w-6 h-6"
            fill={activeNav === "home" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-[10px] font-semibold">หน้าแรก</span>
        </button>

        {/* Favorites */}
        <button onClick={onFavorites} className={tabCls("favorites")}>
          <svg
            className="w-6 h-6"
            fill={activeNav === "favorites" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-[10px] font-semibold">ชื่นชอบ</span>
        </button>

        {/* Cart */}
        <button onClick={onCart} className={tabCls("cart")}>
          <div className="relative">
            <svg
              className="w-6 h-6"
              fill={activeNav === "cart" ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-0.5 bg-[#F7B90B] text-[#9E080F] text-[9px] font-black rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">ตะกร้า</span>
        </button>

        {/* Orders */}
        <button onClick={onOrders} className={tabCls("orders")}>
          <svg
            className="w-6 h-6"
            fill={activeNav === "orders" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span className="text-[10px] font-semibold">ออเดอร์</span>
        </button>

        {/* Profile */}
        <button onClick={onProfile} className={tabCls("profile")}>
          <svg
            className="w-6 h-6"
            fill={activeNav === "profile" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-[10px] font-semibold">โปรไฟล์</span>
        </button>
      </div>
    </nav>
  );
}
