import { CalculationResponse } from "@/types";

interface OrderResultProps {
  result: CalculationResponse;
  memberCard: string;
}

export default function OrderResult({ result, memberCard }: OrderResultProps) {
  const hasPairDiscount = result.discountedItems.length > 0;
  const totalSaved = Math.abs(
    result.discountedItems.reduce((sum, d) => sum + d.discount, 0)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-800">สรุปออเดอร์</h3>
          <p className="text-xs text-gray-400">คำนวณเสร็จสิ้น</p>
        </div>
      </div>

      {/* Breakdown card */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
        {/* Total before discount */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ราคารวมก่อนหักส่วนลด</span>
          <span className="font-semibold text-gray-800">
            ฿{result.totalBeforeDiscount.toFixed(2)}
          </span>
        </div>

        {/* Pair discounts */}
        {hasPairDiscount && (
          <div className="border-t border-gray-200 pt-2.5 space-y-1.5">
            <p className="text-xs font-bold text-[#9E080F] uppercase tracking-wide">
              ส่วนลดโปรสมาชิก (5% ต่อคู่)
            </p>
            {result.discountedItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{item.name}</span>
                <span className="text-green-600 font-semibold">
                  {item.discount.toFixed(2)} บาท
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Member card info */}
        {memberCard && (
          <div className="flex justify-between text-xs text-gray-400 border-t border-gray-200 pt-2">
            <span>รหัสสมาชิก: {memberCard}</span>
            <span className="text-green-600 font-semibold">✓ ใช้งานแล้ว</span>
          </div>
        )}

        {/* Delivery */}
        <div className="flex justify-between text-sm border-t border-gray-200 pt-2.5">
          <span className="text-gray-500">ค่าจัดส่ง</span>
          <span className="text-green-600 font-semibold">ฟรี</span>
        </div>

        {/* Final total */}
        <div className="flex justify-between items-center border-t border-gray-300 pt-3 mt-1">
          <span className="font-bold text-gray-800 text-base">ยอดสุทธิ</span>
          <span className="text-2xl font-black text-[#9E080F]">
            ฿{result.finalTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Savings highlight */}
      {hasPairDiscount && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="text-xs font-semibold text-green-700">
              คุณประหยัดได้จากส่วนลดสมาชิก
            </p>
            <p className="text-2xl font-black text-green-600">
              ฿{totalSaved.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {!hasPairDiscount && memberCard && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-700">
          💡 เพิ่มผัดไทยไฟส้ม, ชมพู หรือเขียว 2 ชิ้นขึ้นไปเพื่อรับส่วนลด 5%
        </div>
      )}
    </div>
  );
}
