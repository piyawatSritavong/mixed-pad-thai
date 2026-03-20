"use client";

import { OrderRecord } from "@/types";

interface OrdersPageProps {
  orders: OrderRecord[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersPage({ orders }: OrdersPageProps) {
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-gray-800">ประวัติออเดอร์</h2>
        <span className="text-xs text-gray-400 font-medium">
          {orders.length} ออเดอร์
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">ยังไม่มีประวัติออเดอร์</p>
          <p className="text-gray-400 text-sm mt-1">
            ออเดอร์ที่สั่งแล้วจะแสดงที่นี่
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-card overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-[#9E080F] to-[#7A060B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-sm">
                    ออเดอร์ #{sorted.length - index}
                  </span>
                  {order.tableNumber && (
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      โต๊ะ {order.tableNumber}
                    </span>
                  )}
                  {order.memberCard && (
                    <span className="bg-[#F7B90B] text-[#9E080F] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      สมาชิก
                    </span>
                  )}
                </div>
                <span className="text-white/70 text-[10px]">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              {/* Items */}
              <div className="px-4 py-3">
                <div className="space-y-1.5">
                  {order.items.map((line) => (
                    <div
                      key={line.product.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 text-xs w-5 text-right">
                          ×{line.quantity}
                        </span>
                        <span className="text-gray-700 font-medium">
                          {line.product.name}
                        </span>
                      </div>
                      <span className="text-gray-600 font-medium">
                        ฿{line.product.price * line.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Discounts */}
                {order.result.discountedItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                    {order.result.discountedItems.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-green-600">
                          🏷️ ส่วนลดคู่ – {d.name}
                        </span>
                        <span className="text-green-600 font-bold">
                          {d.discount}฿
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-500 text-sm">ยอดรวม</span>
                  <span className="text-[#9E080F] font-black text-lg">
                    ฿{order.result.finalTotal}
                  </span>
                </div>

                {order.result.discountedItems.length > 0 && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-gray-400 text-xs">
                      ก่อนส่วนลด ฿{order.result.totalBeforeDiscount}
                    </span>
                    <span className="text-green-600 text-xs font-bold">
                      ประหยัด ฿
                      {order.result.totalBeforeDiscount - order.result.finalTotal}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
