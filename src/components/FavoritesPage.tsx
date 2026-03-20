"use client";

import Image from "next/image";
import { Product } from "@/types";

const colorMap: Record<string, { badge: string; label: string }> = {
  red:    { badge: "bg-red-500",    label: "แดง"    },
  green:  { badge: "bg-green-500",  label: "เขียว"  },
  blue:   { badge: "bg-blue-500",   label: "น้ำเงิน" },
  yellow: { badge: "bg-yellow-400", label: "เหลือง" },
  pink:   { badge: "bg-pink-500",   label: "ชมพู"   },
  purple: { badge: "bg-purple-500", label: "ม่วง"   },
  orange: { badge: "bg-orange-500", label: "ส้ม"    },
};

interface FavoritesPageProps {
  products: Product[];
  favorites: Set<number>;
  quantities: Record<number, number>;
  onToggleFavorite: (id: number) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onClick: (product: Product) => void;
}

export default function FavoritesPage({
  products,
  favorites,
  quantities,
  onToggleFavorite,
  onIncrement,
  onDecrement,
  onClick,
}: FavoritesPageProps) {
  const favoriteProducts = products.filter((p) => favorites.has(p.id));

  return (
    <div className="px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-gray-800">รายการชื่นชอบ</h2>
        <span className="text-xs text-gray-400 font-medium">
          {favoriteProducts.length} รายการ
        </span>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-red-200"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">ยังไม่มีรายการชื่นชอบ</p>
          <p className="text-gray-400 text-sm mt-1">
            กดปุ่มหัวใจบนเมนูเพื่อเพิ่มในรายการชื่นชอบ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {favoriteProducts.map((product) => {
            const colors = colorMap[product.color] ?? {
              badge: "bg-gray-500",
              label: product.color,
            };
            const quantity = quantities[product.id] ?? 0;

            return (
              <div
                key={product.id}
                onClick={() => onClick(product)}
                className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
              >
                <div className="relative h-36 sm:h-40 overflow-hidden bg-gray-50">
                  <Image
                    src="/assets/food.jpg"
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div
                    className={`absolute top-2 left-2 ${colors.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}
                  >
                    🔥 {colors.label}
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {product.discountable && (
                      <div className="bg-[#F7B90B] text-[#9E080F] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        5% OFF
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(product.id);
                      }}
                      aria-label="ลบออกจากรายการโปรด"
                      className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-[#9E080F] transition-colors"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">ผัดไทยไฟสูตรพิเศษ</p>

                  <div className="flex items-center justify-between mt-2.5">
                    <span className="font-black text-[#9E080F] text-base">
                      ฿{product.price}
                    </span>

                    {quantity > 0 ? (
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onDecrement(product.id)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm leading-none"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-gray-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onIncrement(product.id)}
                          className="w-6 h-6 rounded-full bg-[#9E080F] flex items-center justify-center text-white hover:bg-[#7A060B] transition-colors text-sm leading-none"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onIncrement(product.id);
                        }}
                        className="w-7 h-7 rounded-full bg-[#9E080F] flex items-center justify-center text-white hover:bg-[#7A060B] transition-colors shadow-sm"
                        aria-label={`เพิ่ม ${product.name}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
