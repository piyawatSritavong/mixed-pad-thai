"use client";

import Image from "next/image";
import { Product } from "@/types";

interface ProductModalProps {
  product: Product;
  quantity: number;
  isFavorite: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onClose: () => void;
  onToggleFavorite: () => void;
}

const colorMap: Record<string, { badge: string; label: string }> = {
  red:    { badge: "bg-red-500",    label: "แดง"    },
  green:  { badge: "bg-green-500",  label: "เขียว"  },
  blue:   { badge: "bg-blue-500",   label: "น้ำเงิน" },
  yellow: { badge: "bg-yellow-400", label: "เหลือง" },
  pink:   { badge: "bg-pink-500",   label: "ชมพู"   },
  purple: { badge: "bg-purple-500", label: "ม่วง"   },
  orange: { badge: "bg-orange-500", label: "ส้ม"    },
};

const productInfo: Record<
  string,
  { calories: number; spice: number; time: number; description: string }
> = {
  ผัดไทยไฟแดง:    { calories: 320, spice: 5, time: 20, description: "เมนูผัดไฟสูตรดั้งเดิม รสชาติเข้มข้น เผ็ดพอดี เหมาะสำหรับทุกคน" },
  ผัดไทยไฟเขียว:  { calories: 280, spice: 3, time: 15, description: "ผัดไฟสูตรเขียว รสชาติอ่อนนุ่ม หอมกลิ่นสมุนไพร ไม่เผ็ดมาก" },
  ผัดไทยไฟน้ำเงิน: { calories: 250, spice: 2, time: 15, description: "ผัดไฟสูตรเบาๆ เหมาะสำหรับคนที่ไม่ชอบเผ็ด รสชาติกลมกล่อม" },
  ผัดไทยไฟเหลือง: { calories: 300, spice: 4, time: 20, description: "ผัดไฟสูตรพิเศษ ผสมเครื่องเทศหอม รสชาติเข้มข้น หอมยั่วน้ำลาย" },
  ผัดไทยไฟชมพู:   { calories: 380, spice: 6, time: 25, description: "ผัดไฟสูตรพรีเมียม รสชาติเผ็ดร้อน หอมกรุ่น เป็นที่ชื่นชอบของลูกค้า" },
  ผัดไทยไฟม่วง:   { calories: 420, spice: 7, time: 30, description: "ผัดไฟสูตรสุดพิเศษ เผ็ดจัดจ้าน สำหรับคนที่ชอบรสเข้มข้น" },
  ผัดไทยไฟส้ม:    { calories: 460, spice: 8, time: 35, description: "ผัดไฟสูตรสุดยอด เผ็ดสุดๆ เมนูระดับ Master สำหรับผู้กล้าเท่านั้น" },
};

export default function ProductModal({
  product,
  quantity,
  isFavorite,
  onIncrement,
  onDecrement,
  onClose,
  onToggleFavorite,
}: ProductModalProps) {
  const colors = colorMap[product.color] ?? { badge: "bg-gray-500", label: product.color };
  const info = productInfo[product.name] ?? {
    calories: 300,
    spice: 5,
    time: 20,
    description: "เมนูผัดไฟสูตรพิเศษ",
  };

  const spiceDisplay = "🌶️".repeat(Math.min(info.spice, 5));
  const itemTotal = product.price * (quantity || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative bg-white w-full md:max-w-md md:rounded-3xl rounded-t-3xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl modal-fade-in">
        {/* Hero image */}
        <div className="relative h-64 bg-gray-100 flex-shrink-0">
          <Image
            src="/assets/food.jpg"
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 448px"
          />

          {/* Back */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Wishlist */}
          <button
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
            className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-colors ${isFavorite ? "text-[#9E080F]" : "text-gray-400"}`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Content (scrollable) */}
        <div className="overflow-y-auto flex-1 px-5 pt-4 pb-2">
          {/* Name & price */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-800">
                {product.name}
              </h2>
              <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                <span
                  className={`${colors.badge} text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full`}
                >
                  🔥 ผัดไทยไฟ{colors.label}
                </span>
                {product.discountable && (
                  <span className="bg-[#F7B90B] text-[#9E080F] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    5% OFF สมาชิก
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-[#9E080F]">
                ฿{product.price}
              </p>
              <p className="text-xs text-gray-400">ต่อที่</p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            {info.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-gray-800">{info.calories}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">แคลอรี่</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-gray-800">{spiceDisplay || "🌶️"}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">ระดับเผ็ด</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-gray-800">{info.time}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">นาที</p>
            </div>
          </div>

          {/* Warning for red set */}
          {product.color === "red" && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-xs text-red-600 font-medium leading-relaxed">
                จำกัด 1 ที่ต่อลูกค้า 1 ท่าน ภายใน 1 ชั่วโมง
              </p>
            </div>
          )}
        </div>

        {/* Footer: qty + add to cart */}
        <div className="flex-shrink-0 p-5 border-t border-gray-100 flex items-center gap-3">
          {/* Quantity */}
          <div className="flex items-center gap-2.5 bg-gray-100 rounded-2xl px-3 py-2">
            <button
              onClick={onDecrement}
              disabled={quantity === 0}
              className="w-7 h-7 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-600 disabled:opacity-40 text-sm leading-none"
            >
              −
            </button>
            <span className="w-6 text-center font-bold text-gray-800">
              {quantity}
            </span>
            <button
              onClick={onIncrement}
              className="w-7 h-7 rounded-full bg-[#9E080F] flex items-center justify-center text-white text-sm leading-none"
            >
              +
            </button>
          </div>

          {/* Add to cart */}
          <button
            onClick={() => {
              if (quantity === 0) onIncrement();
              onClose();
            }}
            className="flex-1 bg-[#9E080F] text-white font-bold py-3 rounded-2xl hover:bg-[#7A060B] transition-colors text-sm"
          >
            เพิ่มลงตะกร้า · ฿{itemTotal}
          </button>
        </div>
      </div>
    </div>
  );
}
