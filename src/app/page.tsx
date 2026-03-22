"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface TableInfo { table_number: string; status: string; }

const STATUS_STYLE: Record<string, { bg: string; border: string; text: string; label: string; dot: string }> = {
  vacant:         { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  label: "ว่าง",         dot: "bg-green-400" },
  occupied:       { bg: "bg-amber-50",  border: "border-[#F7B90B]",  text: "text-amber-700",  label: "มีลูกค้า",     dot: "bg-[#F7B90B]" },
  bill_requested: { bg: "bg-red-50",    border: "border-red-400",    text: "text-red-700",    label: "เช็คบิล",      dot: "bg-red-400" },
  staff_called:   { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700", label: "เรียกพนักงาน", dot: "bg-orange-400" },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function BannerImg({ slot }: { slot: 1 | 2 }) {
  const [ts, setTs] = useState(0);
  const [hidden, setHidden] = useState(false);
  useEffect(() => { setTs(Date.now()); }, []);
  if (hidden || ts === 0) return null;
  const src = SUPABASE_URL
    ? `${SUPABASE_URL}/storage/v1/object/public/banners/ads-banner-${slot}.jpg?v=${ts}`
    : `/banners/ads-banner-${slot}.jpg?v=${ts}`;
  return (
    <Image
      key={ts}
      src={src}
      alt={`banner ${slot}`}
      width={600}
      height={900}
      className="w-full h-auto object-contain rounded-2xl shadow-md animate-bounce-periodic"
      onError={() => setHidden(true)}
      unoptimized
    />
  );
}

export default function RootPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data: TableInfo[]) => { setTables(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col">
      {/* Header */}
      <div className="bg-[#7A060B] text-white px-6 py-4 text-center shadow-md flex-shrink-0">
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <span className="text-xl">🔥</span>
          <h1 className="text-xl font-black tracking-tight">ผัดไทยไฟรวม</h1>
        </div>
        <p className="text-white/70 text-xs">เลือกโต๊ะของท่านเพื่อเริ่มสั่งอาหาร</p>
      </div>

      {/* Body: banner | grid | banner — equal 3 columns on lg+ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 overflow-hidden">
        {/* Left banner */}
        <div className="hidden lg:flex items-start justify-center">
          <BannerImg slot={1} />
        </div>

        {/* Table grid (center) */}
        <div className="flex flex-col overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[...Array(9)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center mt-16 text-gray-400 text-sm">ไม่พบข้อมูลโต๊ะ</div>
          ) : (
            <>
              <p className="text-[11px] text-gray-400 font-semibold mb-2.5 text-center uppercase tracking-wider">
                โต๊ะทั้งหมด {tables.length} โต๊ะ
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {tables.map((t) => {
                  const s = STATUS_STYLE[t.status] ?? STATUS_STYLE.vacant;
                  return (
                    <button
                      key={t.table_number}
                      onClick={() => router.push(`/${t.table_number}`)}
                      className="flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-95 hover:scale-110"
                    >
                      <Image
                        src="/assets/door.png"
                        alt={`โต๊ะ ${t.table_number}`}
                        width={120}
                        height={120}
                        className="w-full object-contain"
                      />
                      <p className="text-base font-black text-gray-800 leading-none">โต๊ะ {t.table_number}</p>
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className={`text-[10px] font-bold ${s.text}`}>{s.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {Object.entries(STATUS_STYLE).map(([, v]) => (
                  <div key={v.label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                    <span className="text-[11px] text-gray-500">{v.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right banner */}
        <div className="hidden lg:flex items-start justify-center">
          <BannerImg slot={2} />
        </div>
      </div>
    </div>
  );
}
