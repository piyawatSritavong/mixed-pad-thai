"use client";

import { useEffect, useState, useCallback } from "react";

interface TableData {
  id: number;
  table_number: string;
  capacity: number;
  status: string;
  note: string;
  active_orders: number;
  pending_total: number;
  updated_at: string;
}

const S: Record<
  string,
  { label: string; border: string; bg: string; text: string; dot: string }
> = {
  vacant: {
    label: "ว่าง",
    border: "border-green-400",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-400",
  },
  occupied: {
    label: "มีลูกค้า",
    border: "border-[#F7B90B]",
    bg: "bg-[#FFF8E1]",
    text: "text-amber-700",
    dot: "bg-[#F7B90B]",
  },
  bill_requested: {
    label: "เช็คบิล",
    border: "border-[#7A060B]",
    bg: "bg-red-50",
    text: "text-[#7A060B]",
    dot: "bg-[#7A060B]",
  },
  staff_called: {
    label: "เรียกพนักงาน",
    border: "border-orange-400",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-400",
  },
};

// Color chairs by capacity group
function chairColor(capacity: number) {
  if (capacity <= 2) return "bg-sky-300";
  if (capacity <= 4) return "bg-amber-300";
  if (capacity <= 6) return "bg-orange-400";
  return "bg-rose-400";
}
function capacityLabel(capacity: number) {
  if (capacity <= 2)
    return { text: "text-sky-600", bg: "bg-sky-50", label: `${capacity} คน` };
  if (capacity <= 4)
    return {
      text: "text-amber-600",
      bg: "bg-amber-50",
      label: `${capacity} คน`,
    };
  if (capacity <= 6)
    return {
      text: "text-orange-600",
      bg: "bg-orange-50",
      label: `${capacity} คน`,
    };
  return { text: "text-rose-600", bg: "bg-rose-50", label: `${capacity} คน` };
}

function Chairs({ count }: { count: number }) {
  const n = Math.min(Math.ceil(count / 2), 5);
  const col = chairColor(count);
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`w-7 h-2.5 ${col} rounded-full opacity-70`} />
      ))}
    </div>
  );
}

function TableCard({
  t,
  onAction,
}: {
  t: TableData;
  onAction: (id: number, status: string) => void;
}) {
  const cfg = S[t.status] ?? S.vacant;
  const cap = capacityLabel(t.capacity);
  const isBillReq = t.status === "bill_requested";
  const isStaffCall = t.status === "staff_called";
  const isAlert = isBillReq || isStaffCall;
  return (
    <div className="flex flex-col items-center gap-2">
      <Chairs count={t.capacity} />
      {/* Blinking border overlay for alert states */}
      <div className="relative w-full">
        {isAlert && (
          <div
            className={`absolute inset-0 rounded-2xl border-[3px] ${cfg.border} animate-pulse pointer-events-none`}
          />
        )}
        <div
          className={`w-full border-[3px] ${cfg.border} ${cfg.bg} rounded-2xl px-3 py-3 transition-shadow hover:shadow-md`}
        >
          <div className="flex items-start justify-between mb-1">
            <p className="text-lg font-black text-gray-800 leading-none">
              T{t.table_number}
            </p>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <p className={`text-[11px] font-bold ${cfg.text}`}>{cfg.label}</p>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cap.text} ${cap.bg}`}
            >
              {cap.label}
            </span>
          </div>
          {t.active_orders > 0 && t.status === "occupied" && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              ฿{t.pending_total.toFixed(0)}
            </p>
          )}
          {t.note && (
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{t.note}</p>
          )}
          {/* Quick actions */}
          <div className="mt-2 flex gap-1.5">
            {t.status === "occupied" && t.active_orders > 0 && (
              <button
                onClick={() => onAction(t.id, "bill_requested")}
                className="flex-1 text-[10px] bg-[#F7B90B] hover:bg-amber-400 text-gray-800 py-1 rounded-lg font-bold transition-colors"
              >
                เช็คบิล
              </button>
            )}
            {isBillReq && (
              <button
                onClick={() => onAction(t.id, "vacant")}
                className="flex-1 text-[10px] bg-[#7A060B] hover:bg-[#9E080F] text-white py-1 rounded-lg font-bold transition-colors"
              >
                ปริ้นใบเสร็จ
              </button>
            )}
            {isStaffCall && (
              <button
                onClick={() => onAction(t.id, "occupied")}
                className="flex-1 text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 rounded-lg font-bold transition-colors"
              >
                รับทราบ
              </button>
            )}
          </div>
        </div>
      </div>
      <Chairs count={t.capacity} />
    </div>
  );
}

export default function DashboardPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "occupied" | "alert">("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTables = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard");
    if (res.ok) {
      setTables(await res.json());
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 5000);
    const handleVisibility = () => {
      if (!document.hidden) fetchTables();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchTables]);

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/admin/tables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTables();
  }

  const counts = {
    total: tables.length,
    vacant: tables.filter((t) => t.status === "vacant").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    alert: tables.filter(
      (t) => t.status === "bill_requested" || t.status === "staff_called",
    ).length,
  };

  const filtered =
    filter === "all"
      ? tables
      : filter === "occupied"
        ? tables.filter(
            (t) =>
              t.status === "occupied" ||
              t.status === "bill_requested" ||
              t.status === "staff_called",
          )
        : tables.filter(
            (t) => t.status === "bill_requested" || t.status === "staff_called",
          );

  const activeTables = tables.filter((t) => t.status !== "vacant");

  return (
    <div className="flex h-full">
      {/* ── Main floor plan ── */}
      <div className="flex-1 flex flex-col min-w-0 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Choose Tables</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString("th-TH", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {lastUpdated ? `อัปเดต ${lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "กำลังโหลด..."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter tabs */}
            {[
              { key: "all", label: "ทั้งหมด" },
              {
                key: "occupied",
                label: `มีลูกค้า (${counts.occupied + counts.alert})`,
              },
              {
                key: "alert",
                label: `แจ้งเตือน (${counts.alert})`,
                urgent: counts.alert > 0,
              },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  filter === f.key
                    ? f.urgent
                      ? "bg-[#7A060B] text-white border-[#7A060B]"
                      : "bg-[#F7B90B] text-gray-800 border-[#F7B90B]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={fetchTables}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Floor plan grid */}
        {loading ? (
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-36 bg-white rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12 overflow-y-auto">
            {filtered.map((t) => (
              <TableCard key={t.id} t={t} onAction={updateStatus} />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-auto pt-5 flex items-center gap-6 border-t border-gray-200">
          <span className="text-xs font-semibold text-gray-400">โต๊ะ</span>
          {[
            { dot: "bg-green-400", label: `ว่าง : ${counts.vacant}` },
            { dot: "bg-[#F7B90B]", label: `มีลูกค้า : ${counts.occupied}` },
            {
              dot: "bg-[#7A060B]",
              label: `เช็คบิล : ${tables.filter((t) => t.status === "bill_requested").length}`,
            },
            {
              dot: "bg-orange-400",
              label: `เรียกพนักงาน : ${tables.filter((t) => t.status === "staff_called").length}`,
            },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${l.dot}`} />
              <span className="text-xs text-gray-500 font-medium">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-l border-gray-100 shadow-sm">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setFilter("occupied")}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === "occupied" ? "bg-[#F7B90B] border-[#F7B90B] text-gray-800" : "border-gray-200 text-gray-500 hover:border-[#F7B90B]"}`}
            >
              มีลูกค้า ({counts.occupied + counts.alert})
            </button>
            <button
              onClick={() => setFilter("alert")}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === "alert" ? "bg-[#7A060B] border-[#7A060B] text-white" : "border-gray-200 text-gray-500 hover:border-[#7A060B]"}`}
            >
              แจ้งเตือน ({counts.alert})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {activeTables.length === 0 ? (
            <div className="text-center pt-12">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-sm text-gray-400">ยังไม่มีโต๊ะที่ใช้งาน</p>
            </div>
          ) : (
            activeTables.map((t) => {
              const cfg = S[t.status] ?? S.vacant;
              const isAlert =
                t.status === "bill_requested" || t.status === "staff_called";
              return (
                <div
                  key={t.id}
                  className={`rounded-2xl p-3.5 border ${isAlert ? `${cfg.border} ${cfg.bg}` : "border-gray-100 bg-gray-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${isAlert ? "bg-[#7A060B] text-white" : "bg-[#F7B90B] text-gray-800"}`}
                    >
                      T{t.table_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${cfg.text}`}>
                        {cfg.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t.capacity} ที่นั่ง
                      </p>
                      {t.active_orders > 0 && t.status === "occupied" && (
                        <p className="text-xs font-semibold text-gray-600 mt-0.5">
                          ฿{t.pending_total.toFixed(2)}
                        </p>
                      )}
                    </div>
                    {isAlert && (
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0 animate-ping" />
                    )}
                  </div>
                  {((t.status === "occupied" && t.active_orders > 0) || isAlert) && (
                    <div className="flex gap-2 mt-3">
                      {t.status === "occupied" && t.active_orders > 0 && (
                        <button
                          onClick={() => updateStatus(t.id, "bill_requested")}
                          className="flex-1 text-[11px] bg-[#F7B90B] hover:bg-amber-400 text-gray-800 py-1.5 rounded-xl font-bold transition-colors"
                        >
                          เช็คบิล
                        </button>
                      )}
                      {t.status === "staff_called" && (
                        <button
                          onClick={() => updateStatus(t.id, "occupied")}
                          className="flex-1 text-[11px] bg-white border border-gray-200 text-gray-600 py-1.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                          รับทราบ
                        </button>
                      )}
                      {t.status === "bill_requested" && (
                        <button
                          onClick={() => updateStatus(t.id, "vacant")}
                          className="flex-1 text-[11px] bg-[#7A060B] text-white py-1.5 rounded-xl font-bold hover:bg-[#9E080F] transition-colors"
                        >
                          ปริ้นใบเสร็จ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom action */}
        <div className="p-4 border-t border-gray-100 grid grid-cols-2 gap-2">
          <button
            onClick={() => setFilter("all")}
            className="py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ดูทั้งหมด
          </button>
          <button
            onClick={fetchTables}
            className="py-2.5 rounded-xl text-sm font-bold bg-[#7A060B] text-white hover:bg-[#9E080F] transition-colors"
          >
            Refresh
          </button>
        </div>
      </aside>
    </div>
  );
}
