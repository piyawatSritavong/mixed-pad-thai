import Image from "next/image";
import { Product } from "@/types";

interface CartItemRowProps {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const colorBadges: Record<string, string> = {
  red:    "bg-red-100 text-red-700",
  green:  "bg-green-100 text-green-700",
  blue:   "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  pink:   "bg-pink-100 text-pink-700",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700",
};

export default function CartItemRow({
  product,
  quantity,
  onIncrement,
  onDecrement,
}: CartItemRowProps) {
  const badge = colorBadges[product.color] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        <Image
          src="/assets/food.jpg"
          alt={product.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-gray-800 truncate">
          {product.name}
        </h4>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>
          ผัดไทยไฟสูตรพิเศษ
        </span>
        <p className="font-bold text-[#9E080F] text-sm mt-0.5">
          ฿{product.price}
        </p>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onDecrement}
          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm leading-none"
          aria-label="ลด"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-bold text-gray-800">
          {quantity}
        </span>
        <button
          onClick={onIncrement}
          className="w-7 h-7 rounded-full bg-[#9E080F] flex items-center justify-center text-white hover:bg-[#7A060B] transition-colors text-sm leading-none"
          aria-label="เพิ่ม"
        >
          +
        </button>
      </div>
    </div>
  );
}
