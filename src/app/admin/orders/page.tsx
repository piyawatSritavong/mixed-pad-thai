"use client";

import { useEffect, useState } from "react";

interface OrderItem { product_name: string; quantity: number; unit_price: number; }
interface Order {
  id: number; table_number: string | null; member_card_number: string | null;
  total_before_discount: number; pair_discount_total: number;
  final_total: number; status: string; created_at: string; items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [table, setTable] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  async function fetchOrders() {
    setLoading(true);
    const params = new URLSearchParams({ from, to });
    if (table) params.set("table", table);
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }
  useEffect(() => { fetchOrders(); }, []); // eslint-disable-line

  const totalRevenue = orders.reduce((s, o) => s + o.final_total, 0);
  const totalDiscount = orders.reduce((s, o) => s + o.pair_discount_total, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Orders</h1>
          <p className="text-sm text-gray-400">ประวัติออเดอร์และยอดขาย</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          {[
            { label: "วันเริ่มต้น", value: from, onChange: setFrom },
            { label: "วันสิ้นสุด", value: to, onChange: setTo },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-400 mb-1">{f.label}</label>
              <input type="date" value={f.value} onChange={(e) => f.onChange(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/20 bg-[#F5F0EB]" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">โต๊ะ</label>
            <input type="text" value={table} onChange={(e) => setTable(e.target.value)} placeholder="ทั้งหมด"
              className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/20 bg-[#F5F0EB]" />
          </div>
          <button onClick={fetchOrders}
            className="px-5 py-2 bg-[#7A060B] hover:bg-[#9E080F] text-white rounded-xl text-sm font-bold transition-colors">
            ค้นหา
          </button>

          {/* Summary chips */}
          <div className="ml-auto flex gap-2 flex-wrap">
            <div className="bg-[#F5F0EB] rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-gray-400">ออเดอร์</p>
              <p className="text-base font-black text-gray-800">{orders.length}</p>
            </div>
            <div className="bg-[#7A060B] rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-white/70">ยอดขาย</p>
              <p className="text-base font-black text-white">฿{totalRevenue.toFixed(0)}</p>
            </div>
            <div className="bg-[#F5F0EB] rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-gray-400">ส่วนลด</p>
              <p className="text-base font-black text-green-600">-฿{totalDiscount.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-400">ไม่มีออเดอร์ในช่วงเวลานี้</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const isOpen = expanded === o.id;
            const discount = o.pair_discount_total;
            return (
              <div key={o.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button className="w-full text-left px-5 py-4" onClick={() => setExpanded(isOpen ? null : o.id)}>
                  <div className="flex items-center gap-4">
                    {/* Table badge */}
                    <div className="w-10 h-10 rounded-xl bg-[#F5F0EB] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-[#7A060B]">T{o.table_number ?? "–"}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800">ออเดอร์ #{o.id}</p>
                        {o.member_card_number && (
                          <span className="text-xs bg-[#F7B90B]/20 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">สมาชิก</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString("th-TH")}</p>
                    </div>
                    {/* Amounts */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black text-gray-800">฿{o.final_total.toFixed(2)}</p>
                      {discount > 0 && <p className="text-xs text-green-500">-฿{discount.toFixed(2)}</p>}
                    </div>
                    {/* Expand icon */}
                    <svg className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-50 px-5 py-3 bg-[#F5F0EB]/50">
                    <div className="space-y-2">
                      {(o.items ?? []).map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <span className="flex-1 text-gray-700">{item.product_name}</span>
                          <span className="text-gray-400 text-xs">x{item.quantity}</span>
                          <span className="font-semibold text-gray-800">฿{(item.quantity * item.unit_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                      <span className="text-gray-400">ก่อนลด</span>
                      <span className="text-gray-600">฿{o.total_before_discount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
