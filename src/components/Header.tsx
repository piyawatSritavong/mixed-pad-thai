"use client";

type NavTab = "home" | "favorites" | "cart" | "orders" | "profile";

interface HeaderProps {
  cartCount: number;
  activeNav: NavTab;
  onHome: () => void;
  onFavorites: () => void;
  onCart: () => void;
  onOrders: () => void;
  onProfile: () => void;
}

export default function Header({
  cartCount,
  activeNav,
  onHome,
  onFavorites,
  onCart,
  onOrders,
  onProfile,
}: HeaderProps) {
  const navCls = (tab: NavTab) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
      activeNav === tab
        ? "bg-red-50 text-[#9E080F]"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <button
          onClick={onHome}
          className="flex-shrink-0 text-lg font-black text-[#9E080F] tracking-tight hover:opacity-80 transition-opacity"
        >
          ผัดไทยไฟรวม
        </button>

        {/* Desktop / Tablet nav – hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          <button onClick={onHome} className={navCls("home")}>
            <svg className="w-4 h-4" fill={activeNav === "home" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            หน้าแรก
          </button>

          <button onClick={onFavorites} className={navCls("favorites")}>
            <svg className="w-4 h-4" fill={activeNav === "favorites" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            ชื่นชอบ
          </button>

          <button onClick={onOrders} className={navCls("orders")}>
            <svg className="w-4 h-4" fill={activeNav === "orders" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            ออเดอร์
          </button>

          <button onClick={onProfile} className={navCls("profile")}>
            <svg className="w-4 h-4" fill={activeNav === "profile" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            โปรไฟล์
          </button>
        </nav>

        {/* Cart button */}
        <button
          onClick={onCart}
          aria-label="ตะกร้าสินค้า"
          className="hidden md:flex flex-shrink-0 items-center gap-2 bg-[#9E080F] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#7A060B] transition-colors relative"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          ตะกร้า
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#F7B90B] text-[#9E080F] text-xs font-black rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}
