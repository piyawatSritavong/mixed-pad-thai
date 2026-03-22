"use client";

import { useEffect, useState } from "react";

interface Item { id: number; name: string; unit: string; quantity: number; min_quantity: number; cost_per_unit: number; }
const EMPTY: Omit<Item, "id"> = { name: "", unit: "กก.", quantity: 0, min_quantity: 0, cost_per_unit: 0 };

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Item> & { id?: number } }>({ open: false, item: EMPTY });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function fetchItems() {
    const res = await fetch("/api/admin/inventory");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => { fetchItems(); }, []);

  async function save() {
    setSaving(true);
    const { id, ...body } = modal.item;
    const res = await fetch(id ? `/api/admin/inventory/${id}` : "/api/admin/inventory", {
      method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) { setModal({ open: false, item: EMPTY }); fetchItems(); }
  }

  async function del(id: number) {
    if (!confirm("ลบรายการนี้?")) return;
    await fetch(`/api/admin/inventory/${id}`, { method: "DELETE" });
    fetchItems();
  }

  const filtered = items.filter((i) => !search || i.name.includes(search));
  const lowCount = items.filter((i) => Number(i.quantity) <= Number(i.min_quantity)).length;
  const totalValue = items.reduce((s, i) => s + Number(i.quantity) * Number(i.cost_per_unit), 0);
  const totalQty = items.reduce((s, i) => s + Number(i.quantity), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Inventory</h1>
          <p className="text-sm text-gray-400">จัดการสต็อกวัตถุดิบ</p>
        </div>
        <button onClick={() => setModal({ open: true, item: EMPTY })}
          className="flex items-center gap-2 bg-[#7A060B] hover:bg-[#9E080F] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มรายการ
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-1">รายการทั้งหมด</p>
          <p className="text-2xl font-black text-gray-800">{items.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-1">ปริมาณรวม</p>
          <p className="text-2xl font-black text-gray-800">{totalQty.toFixed(2)}</p>
          <p className="text-[10px] text-gray-300">กก.</p>
        </div>
        <div className={`rounded-2xl p-4 shadow-sm border ${lowCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
          <p className={`text-xs font-medium mb-1 ${lowCount > 0 ? "text-red-500" : "text-gray-400"}`}>สต็อกต่ำ</p>
          <p className={`text-2xl font-black ${lowCount > 0 ? "text-red-600" : "text-gray-800"}`}>{lowCount}</p>
          <p className={`text-[10px] ${lowCount > 0 ? "text-red-300" : "text-gray-300"}`}>รายการ</p>
        </div>
        <div className="bg-[#7A060B] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-white/70 font-medium mb-1">มูลค่าสต็อกรวม</p>
          <p className="text-2xl font-black text-white">฿{totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารายการ..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/20 shadow-sm" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide w-8">#</th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">ชื่อรายการ</th>
              <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">หน่วย</th>
              <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">คงเหลือ</th>
              <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">ขั้นต่ำ</th>
              <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">ราคา/หน่วย</th>
              <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">มูลค่าคงเหลือ</th>
              <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">สถานะ</th>
              <th className="px-4 py-3.5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center">
                  <p className="text-3xl mb-2">📦</p>
                  <p className="text-gray-400 text-sm">ยังไม่มีรายการ</p>
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const low = Number(item.quantity) <= Number(item.min_quantity);
                const value = Number(item.quantity) * Number(item.cost_per_unit);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50/60 transition-colors ${low ? "bg-red-50/40" : ""}`}>
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-gray-800">{item.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-500">{item.unit}</td>
                    <td className={`px-4 py-3.5 text-right font-bold tabular-nums ${low ? "text-red-600" : "text-gray-800"}`}>
                      {Number(item.quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-400 tabular-nums">
                      {Number(item.min_quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-700 tabular-nums">
                      ฿{Number(item.cost_per_unit).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-800 tabular-nums">
                      ฿{value.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {low ? (
                        <span className="inline-block text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">ใกล้หมด</span>
                      ) : (
                        <span className="inline-block text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">ปกติ</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setModal({ open: true, item })}
                          className="w-7 h-7 rounded-lg bg-[#F5F0EB] flex items-center justify-center text-gray-500 hover:bg-[#F7B90B]/30 hover:text-[#7A060B] transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => del(item.id)}
                          className="w-7 h-7 rounded-lg bg-[#F5F0EB] flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={3} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">รวม</td>
                <td className="px-4 py-3 text-right font-black text-gray-800 tabular-nums">
                  {filtered.reduce((s, i) => s + Number(i.quantity), 0).toFixed(2)}
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right font-black text-[#7A060B] tabular-nums">
                  ฿{filtered.reduce((s, i) => s + Number(i.quantity) * Number(i.cost_per_unit), 0).toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-black text-gray-800 text-lg mb-5">{modal.item.id ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}</h2>
            <div className="space-y-4">
              {([
                { field: "name", label: "ชื่อรายการ", type: "text" },
                { field: "unit", label: "หน่วย (กก., ลิตร, ชิ้น)", type: "text" },
                { field: "quantity", label: "จำนวนคงเหลือ", type: "number" },
                { field: "min_quantity", label: "จำนวนขั้นต่ำ", type: "number" },
                { field: "cost_per_unit", label: "ราคาต้นทุน/หน่วย (฿)", type: "number" },
              ] as const).map(({ field, label, type }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                  <input type={type}
                    value={(modal.item[field] as string | number) ?? ""}
                    onChange={(e) => setModal((p) => ({ ...p, item: { ...p.item, [field]: type === "number" ? Number(e.target.value) : e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/20 bg-[#F5F0EB]" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal({ open: false, item: EMPTY })}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                ยกเลิก
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 bg-[#7A060B] hover:bg-[#9E080F] text-white py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
