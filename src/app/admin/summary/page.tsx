"use client";

import { useEffect, useState } from "react";

interface SummaryData {
  todayStats: { orders: string; revenue: number; discount: number } | null;
  topItems: { name: string; qty: string; revenue: number }[];
  last7Days: { day: string; revenue: number; orders: string }[];
  lowStock: { name: string; quantity: number; min_quantity: number; unit: string }[];
}

function StatCard({ label, value, sub, icon, accent }: { label: string; value: string; sub?: string; icon: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${accent ? "bg-[#7A060B] text-white" : "bg-white"} shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accent ? "bg-white/20 text-white" : "bg-[#F5F0EB] text-gray-500"}`}>{sub}</span>}
      </div>
      <p className={`text-3xl font-black ${accent ? "text-white" : "text-gray-800"}`}>{value}</p>
      <p className={`text-xs font-medium mt-1 ${accent ? "text-white/70" : "text-gray-400"}`}>{label}</p>
    </div>
  );
}

export default function SummaryPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/summary").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-32 bg-white rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-56 bg-white rounded-2xl animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-48 bg-white rounded-2xl animate-pulse" />
          <div className="h-48 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const maxRev = Math.max(...(data?.last7Days.map((d) => d.revenue) ?? [1]), 1);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Report</h1>
          <p className="text-sm text-gray-400">สรุปยอดขายและสถิติวันนี้</p>
        </div>
        <button onClick={() => { setLoading(true); fetch("/api/admin/summary").then(r=>r.json()).then(d=>{setData(d);setLoading(false);}); }}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="💰" label="ยอดขายวันนี้" value={`฿${(data?.todayStats?.revenue ?? 0).toFixed(0)}`} sub="วันนี้" accent />
        <StatCard icon="🧾" label="ออเดอร์วันนี้" value={`${data?.todayStats?.orders ?? 0}`} sub="ออเดอร์" />
        <StatCard icon="🏷️" label="ส่วนลดรวม" value={`฿${(data?.todayStats?.discount ?? 0).toFixed(0)}`} sub="ประหยัด" />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-bold text-gray-700 mb-1">ยอดขาย 7 วันล่าสุด</h2>
        <p className="text-xs text-gray-400 mb-5">บาท</p>
        {maxRev <= 1 ? (
          <div className="flex flex-col items-center justify-center h-36 gap-2">
            <p className="text-3xl">📊</p>
            <p className="text-sm text-gray-400">ยังไม่มีข้อมูลยอดขาย 7 วันที่ผ่านมา</p>
          </div>
        ) : (
        <div className="flex items-end gap-2" style={{ height: "140px" }}>
          {data?.last7Days.map((d) => {
            const pct = d.revenue > 0 ? (d.revenue / maxRev) * 100 : 0;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{d.revenue > 0 ? `฿${d.revenue.toFixed(0)}` : ""}</span>
                <div className="w-full relative" style={{ height: "100px" }}>
                  <div className={`absolute bottom-0 w-full rounded-t-xl transition-all ${pct > 0 ? "bg-[#7A060B]" : "bg-gray-100"}`}
                    style={{ height: `${Math.max(pct, 2)}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 truncate w-full text-center">{d.day.slice(5)}</span>
                <span className="text-[10px] text-gray-300">{d.orders}x</span>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top selling */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">🔥 ขายดีวันนี้</h2>
          {!data?.topItems.length ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm text-gray-400">ยังไม่มีออเดอร์วันนี้</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topItems.map((item, i) => {
                const pct = Math.round((parseInt(item.qty) / parseInt(data.topItems[0].qty)) * 100);
                return (
                  <div key={item.name}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-5 h-5 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${i === 0 ? "bg-[#F7B90B] text-gray-800" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                      <span className="flex-1 text-sm text-gray-700 truncate">{item.name}</span>
                      <span className="text-sm font-bold text-gray-800">{item.qty} จาน</span>
                    </div>
                    <div className="ml-7 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7A060B] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">📦 สต็อกใกล้หมด</h2>
          {!data?.lowStock.length ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm text-green-600 font-medium">สต็อกทุกรายการปกติ</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-bold text-gray-400 uppercase tracking-wide">รายการ</th>
                  <th className="text-right pb-2 text-xs font-bold text-gray-400 uppercase tracking-wide">คงเหลือ</th>
                  <th className="text-right pb-2 text-xs font-bold text-gray-400 uppercase tracking-wide">ขั้นต่ำ</th>
                  <th className="text-right pb-2 text-xs font-bold text-gray-400 uppercase tracking-wide">ขาด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.lowStock.map((item) => {
                  const deficit = item.min_quantity - item.quantity;
                  return (
                    <tr key={item.name} className="hover:bg-red-50/40 transition-colors">
                      <td className="py-2.5 font-medium text-gray-700">{item.name}</td>
                      <td className="py-2.5 text-right font-black text-red-600 tabular-nums">
                        {Number(item.quantity).toFixed(2)}
                        <span className="text-[10px] font-normal text-gray-400 ml-1">{item.unit}</span>
                      </td>
                      <td className="py-2.5 text-right text-gray-400 tabular-nums">
                        {Number(item.min_quantity).toFixed(2)}
                        <span className="text-[10px] ml-1">{item.unit}</span>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        <span className="inline-block bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-lg text-xs">
                          -{deficit > 0 ? Number(deficit).toFixed(2) : 0} {item.unit}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
