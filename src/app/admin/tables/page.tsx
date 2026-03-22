"use client";

import { useEffect, useState } from "react";

interface Table { id: number; table_number: string; capacity: number; status: string; is_active: boolean; note: string; }
const EMPTY: Omit<Table, "id"> = { table_number: "", capacity: 4, status: "vacant", is_active: true, note: "" };

const STATUS_DOT: Record<string, string> = {
  vacant: "bg-green-400", occupied: "bg-[#F7B90B]", bill_requested: "bg-[#7A060B]", staff_called: "bg-orange-400",
};
const STATUS_LABEL: Record<string, string> = {
  vacant: "ว่าง", occupied: "มีลูกค้า", bill_requested: "เช็คบิล", staff_called: "เรียกพนักงาน",
};

function chairColor(c: number) {
  if (c <= 2) return "bg-sky-300";
  if (c <= 4) return "bg-amber-300";
  if (c <= 6) return "bg-orange-400";
  return "bg-rose-400";
}
function Chairs({ count }: { count: number }) {
  const n = Math.min(Math.ceil(count / 2), 4);
  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`w-5 h-2 ${chairColor(count)} rounded-full opacity-70`} />
      ))}
    </div>
  );
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Table> & { id?: number } }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);

  async function fetchTables() {
    const res = await fetch("/api/admin/tables");
    if (res.ok) setTables(await res.json());
  }
  useEffect(() => { fetchTables(); }, []);

  async function save() {
    setSaving(true);
    const { id, ...body } = modal.data;
    const res = await fetch(id ? `/api/admin/tables/${id}` : "/api/admin/tables", {
      method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) { setModal({ open: false, data: EMPTY }); fetchTables(); }
  }

  async function del(id: number) {
    if (!confirm("ลบโต๊ะนี้?")) return;
    await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
    fetchTables();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Tables</h1>
          <p className="text-sm text-gray-400">ตั้งค่าโต๊ะในร้าน · URL ลูกค้า: /[หมายเลขโต๊ะ]</p>
        </div>
        <button onClick={() => setModal({ open: true, data: EMPTY })}
          className="flex items-center gap-2 bg-[#7A060B] hover:bg-[#9E080F] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มโต๊ะ
        </button>
      </div>

      {/* Visual grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-6">
        {tables.filter((t) => t.is_active).map((t) => (
          <div key={t.id} className="flex flex-col items-center gap-1.5 group">
            <Chairs count={t.capacity} />
            <div className="w-full bg-white border-2 border-gray-200 rounded-2xl px-3 py-3 shadow-sm group-hover:border-[#F7B90B] transition-colors">
              <div className="flex items-center justify-between mb-1">
                <p className="font-black text-gray-800 text-lg leading-none">T{t.table_number}</p>
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[t.status] ?? "bg-gray-300"}`} />
              </div>
              <p className="text-[11px] text-gray-400">{t.capacity} ที่นั่ง</p>
              <p className="text-[10px] text-gray-300 font-mono mt-0.5">/{t.table_number}</p>
              <div className="flex gap-1.5 mt-2">
                <button onClick={() => setModal({ open: true, data: t })}
                  className="flex-1 text-[10px] bg-[#F5F0EB] hover:bg-[#F7B90B]/20 text-gray-600 py-1 rounded-lg font-semibold transition-colors">
                  แก้ไข
                </button>
                <button onClick={() => del(t.id)}
                  className="flex-1 text-[10px] bg-[#F5F0EB] hover:bg-red-50 text-gray-500 hover:text-red-500 py-1 rounded-lg font-semibold transition-colors">
                  ลบ
                </button>
              </div>
            </div>
            <Chairs count={t.capacity} />
          </div>
        ))}
      </div>

      {/* Inactive tables */}
      {tables.filter((t) => !t.is_active).length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-500 text-sm mb-3">โต๊ะที่ปิดใช้งาน</h2>
          <div className="flex flex-wrap gap-2">
            {tables.filter((t) => !t.is_active).map((t) => (
              <div key={t.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 opacity-60">
                <span className="text-sm font-bold text-gray-500">T{t.table_number}</span>
                <button onClick={() => setModal({ open: true, data: t })} className="text-xs text-blue-500 hover:underline">แก้ไข</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[k]}`} />
            <span className="text-xs text-gray-400">{v}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-black text-gray-800 text-lg mb-5">{modal.data.id ? "แก้ไขโต๊ะ" : "เพิ่มโต๊ะใหม่"}</h2>
            <div className="space-y-4">
              {([
                { field: "table_number", label: "หมายเลขโต๊ะ (จะเป็น URL: /หมายเลข)", type: "text" },
                { field: "capacity", label: "จำนวนที่นั่ง", type: "number" },
                { field: "note", label: "หมายเหตุ (ไม่บังคับ)", type: "text" },
              ] as const).map(({ field, label, type }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                  <input type={type}
                    value={(modal.data as Record<string, string | number>)[field] ?? ""}
                    onChange={(e) => setModal((p) => ({ ...p, data: { ...p.data, [field]: type === "number" ? Number(e.target.value) : e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/20 bg-[#F5F0EB]" />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-xl hover:bg-[#F5F0EB] transition-colors">
                <input type="checkbox" checked={!!modal.data.is_active}
                  onChange={(e) => setModal((p) => ({ ...p, data: { ...p.data, is_active: e.target.checked } }))}
                  className="accent-[#7A060B]" />
                <span className="text-gray-600">เปิดใช้งาน</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal({ open: false, data: EMPTY })}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">
                ยกเลิก
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 bg-[#7A060B] hover:bg-[#9E080F] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-60">
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
