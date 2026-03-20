"use client";

import Image from "next/image";
import { Product } from "@/types";

interface MenuCardProps {
  product: Product;
  quantity: number;
  isFavorite: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleFavorite: () => void;
  onClick: () => void;
}

const colorMap: Record<
  string,
  { badge: string; light: string; label: string }
> = {
  red:    { badge: "bg-red-500",    light: "bg-red-50",    label: "แดง"    },
  green:  { badge: "bg-green-500",  light: "bg-green-50",  label: "เขียว"  },
  blue:   { badge: "bg-blue-500",   light: "bg-blue-50",   label: "น้ำเงิน" },
  yellow: { badge: "bg-yellow-400", light: "bg-yellow-50", label: "เหลือง" },
  pink:   { badge: "bg-pink-500",   light: "bg-pink-50",   label: "ชมพู"   },
  purple: { badge: "bg-purple-500", light: "bg-purple-50", label: "ม่วง"   },
  orange: { badge: "bg-orange-500", light: "bg-orange-50", label: "ส้ม"    },
};

export default function MenuCard({
  product,
  quantity,
  isFavorite,
  onIncrement,
  onDecrement,
  onToggleFavorite,
  onClick,
}: MenuCardProps) {
  const colors = colorMap[product.color] ?? {
    badge: "bg-gray-500",
    light: "bg-gray-50",
    label: product.color,
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
    >
      {/* Image area */}
      <div className={`relative h-36 sm:h-40 ${colors.light} overflow-hidden`}>
        <Image
          src="/assets/food.jpg"
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Color badge */}
        <div
          className={`absolute top-2 left-2 ${colors.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}
        >
          🔥 {colors.label}
        </div>

        {/* Heart + Discount row top-right */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {product.discountable && (
            <div className="bg-[#F7B90B] text-[#9E080F] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              5% OFF
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
            className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <svg
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorite ? "text-[#9E080F]" : "text-gray-400"
              }`}
              fill={isFavorite ? "currentColor" : "none"}
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

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-sm leading-tight">
          {product.name}
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">ผัดไทยไฟสูตรพิเศษ</p>

        <div className="flex items-center justify-between mt-2.5">
          <span className="font-black text-[#9E080F] text-base">
            ฿{product.price}
          </span>

          {/* Quantity control */}
          {quantity > 0 ? (
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onDecrement}
                className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm leading-none"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-bold text-gray-800">
                {quantity}
              </span>
              <button
                onClick={onIncrement}
                className="w-6 h-6 rounded-full bg-[#9E080F] flex items-center justify-center text-white hover:bg-[#7A060B] transition-colors text-sm leading-none"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onIncrement();
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
}
