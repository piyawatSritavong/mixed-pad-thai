"use client";

import { useEffect, useRef, useState } from "react";
import { Product, CalculationResponse } from "@/types";
import CartItemRow from "./CartItemRow";
import OrderResult from "./OrderResult";

interface CartPanelProps {
  isOpen: boolean;
  products: Product[];
  quantities: Record<number, number>;
  memberCard: string;
  result: CalculationResponse | null;
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onMemberCardChange: (value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
  onComplete: () => void;
}

export default function CartPanel({
  isOpen,
  products,
  quantities,
  memberCard,
  result,
  error,
  loading,
  onClose,
  onIncrement,
  onDecrement,
  onMemberCardChange,
  onCalculate,
  onReset,
  onComplete,
}: CartPanelProps) {
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown when result appears
  useEffect(() => {
    if (!result) {
      setCountdown(3);
      return;
    }
    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const cartItems = products.filter((p) => (quantities[p.id] ?? 0) > 0);
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const rawTotal = cartItems.reduce(
    (sum, p) => sum + p.price * (quantities[p.id] ?? 0),
    0
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
        />
      )}

      {/* Sliding panel */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] w-full md:w-[420px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
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
            <h2 className="text-xl font-black text-gray-800">ตะกร้าสินค้า</h2>
          </div>
          {totalItems > 0 && (
            <span className="text-sm text-gray-400 font-medium">
              {totalItems} รายการ
            </span>
          )}
        </div>

        {/* Body – scrollable */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Empty state */}
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <div className="text-7xl mb-4 opacity-60">🛒</div>
              <p className="text-lg font-bold text-gray-500">ตะกร้าว่างเปล่า</p>
              <p className="text-sm mt-1 text-gray-400">
                เพิ่มเมนูที่ต้องการจากหน้าแรก
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-[#9E080F] text-white rounded-full text-sm font-bold hover:bg-[#7A060B] transition-colors"
              >
                เลือกเมนู
              </button>
            </div>
          ) : result ? (
            /* Result view */
            <div className="p-5">
              <OrderResult result={result} memberCard={memberCard} />
              <button
                onClick={() => {
                  clearInterval(timerRef.current!);
                  onComplete();
                }}
                className="mt-5 w-full bg-[#9E080F] text-white py-3.5 rounded-2xl font-black hover:bg-[#7A060B] transition-colors text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                เสร็จสิ้น
                <span className="ml-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black tabular-nums">
                  {countdown}
                </span>
              </button>
            </div>
          ) : (
            /* Cart view */
            <div className="p-5 space-y-5">
              {/* Items */}
              <div className="space-y-3">
                {cartItems.map((product) => (
                  <CartItemRow
                    key={product.id}
                    product={product}
                    quantity={quantities[product.id] ?? 0}
                    onIncrement={() => onIncrement(product.id)}
                    onDecrement={() => onDecrement(product.id)}
                  />
                ))}
              </div>

              {/* Member card input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  รหัสสมาชิก
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={memberCard}
                    onChange={(e) => onMemberCardChange(e.target.value)}
                    placeholder="กรอกรหัสสมาชิกเพื่อรับส่วนลด 5%"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9E080F]/30 focus:border-[#9E080F] transition-colors"
                  />
                  {memberCard && (
                    <button className="px-4 py-2.5 bg-[#F7B90B] text-[#9E080F] text-sm font-black rounded-xl hover:bg-accent-light transition-colors">
                      ใช้
                    </button>
                  )}
                </div>
                {memberCard && (
                  <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                    <span>✓</span> รหัสสมาชิก: {memberCard} – รับส่วนลด 5% ต่อคู่
                  </p>
                )}
              </div>

              {/* Order summary preview */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ยอดรวม</span>
                  <span className="font-semibold text-gray-800">
                    ฿{rawTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ค่าจัดส่ง</span>
                  <span className="text-green-600 font-semibold">ฟรี</span>
                </div>
                {memberCard && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9E080F] font-medium">
                      ส่วนลดสมาชิก
                    </span>
                    <span className="text-[#9E080F] font-bold">5% ต่อคู่</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-2">
                  <span>ยอดก่อนคำนวณ</span>
                  <span>฿{rawTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer – confirm button */}
        {cartItems.length > 0 && !result && (
          <div className="flex-shrink-0 p-5 border-t border-gray-100">
            <button
              onClick={onCalculate}
              disabled={loading}
              className="w-full bg-[#9E080F] text-white font-black py-4 rounded-2xl hover:bg-[#7A060B] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  กำลังคำนวณ...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ยืนยันออเดอร์ · ฿{rawTotal.toFixed(2)}
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
