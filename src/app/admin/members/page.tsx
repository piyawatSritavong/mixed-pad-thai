"use client";

import { useEffect, useState } from "react";

interface Member { id: number; username: string; full_name: string; role: string; permissions: Record<string, boolean>; is_active: boolean; }
const PERMS = ["dashboard", "summary", "inventory", "orders", "members", "tables", "settings"];
const EMPTY: Omit<Member, "id"> & { password?: string } = { username: "", full_name: "", role: "staff", permissions: Object.fromEntries(PERMS.map(p=>[p,false])), is_active: true };

const ROLE_COLOR: Record<string, string> = { admin: "bg-[#7A060B] text-white", manager: "bg-[#F7B90B] text-gray-800", staff: "bg-gray-100 text-gray-600" };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [modal, setModal] = useState<{ open: boolean; data: typeof EMPTY & { id?: number } }>({ open: false, data: EMPTY });
  const [saving, setSaving] = useState(false);

  async function fetchMembers() {
    const res = await fetch("/api/admin/members");
    if (res.ok) setMembers(await res.json());
  }
  useEffect(() => { fetchMembers(); }, []);

  async function save() {
    setSaving(true);
    const { id, ...body } = modal.data;
    const res = await fetch(id ? `/api/admin/members/${id}` : "/api/admin/members", {
      method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) { setModal({ open: false, data: EMPTY }); fetchMembers(); }
  }

  async function del(id: number) {
    if (!confirm("ลบผู้ใช้นี้?")) return;
    await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    fetchMembers();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Members</h1>
          <p className="text-sm text-gray-400">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง</p>
        </div>
        <button onClick={() => setModal({ open: true, data: EMPTY })}
          className="flex items-center gap-2 bg-[#7A060B] hover:bg-[#9E080F] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มผู้ใช้
        </button>
      </div>

      <div className="grid gap-3">
        {members.map((m) => (
          <div key={m.id} className={`bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 ${!m.is_active ? "opacity-50" : ""}`}>
            {/* Avatar */}
            <div className="w-11 h-11 rounded-2xl bg-[#7A060B] flex items-center justify-center text-white font-black text-base flex-shrink-0">
              {(m.full_name || m.username)[0]?.toUpperCase()}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-800">{m.full_name || m.username}</p>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLOR[m.role] ?? ROLE_COLOR.staff}`}>{m.role}</span>
                {!m.is_active && <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">@{m.username}</p>
            </div>
            {/* Permissions */}
            <div className="hidden sm:flex items-center gap-1 flex-wrap justify-end max-w-xs">
              {PERMS.map((p) => {
                const allowed = m.role === "admin" || !!m.permissions?.[p];
                return (
                  <span key={p} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md capitalize ${allowed ? "bg-[#F7B90B]/20 text-amber-700" : "bg-gray-100 text-gray-300"}`}>
                    {p}
                  </span>
                );
              })}
            </div>
            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setModal({ open: true, data: { ...m, password: "" } })}
                className="w-9 h-9 rounded-xl bg-[#F5F0EB] flex items-center justify-center text-gray-500 hover:bg-[#F7B90B]/20 hover:text-[#7A060B] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => del(m.id)}
                className="w-9 h-9 rounded-xl bg-[#F5F0EB] flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-black text-gray-800 text-lg mb-5">{modal.data.id ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}</h2>
            <div className="space-y-4">
              {([
                { field: "username", label: "Username", type: "text", disabled: !!modal.data.id },
                { field: "full_name", label: "ชื่อ-นามสกุล", type: "text" },
                { field: "password", label: modal.data.id ? "รหัสผ่านใหม่ (เว้นว่างไม่เปลี่ยน)" : "รหัสผ่าน *", type: "password" },
              ] as const).map(({ field, label, type, ...rest }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                  <input type={type} disabled={"disabled" in rest ? rest.disabled : false}
                    value={(modal.data as unknown as Record<string, string>)[field] ?? ""}
                    onChange={(e) => setModal((p) => ({ ...p, data: { ...p.data, [field]: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/20 bg-[#F5F0EB] disabled:opacity-60" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
                <div className="flex gap-2">
                  {["admin", "manager", "staff"].map((r) => (
                    <button key={r} onClick={() => setModal((p) => ({ ...p, data: { ...p.data, role: r } }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors capitalize ${modal.data.role === r ? "bg-[#7A060B] border-[#7A060B] text-white" : "border-gray-200 text-gray-500 hover:border-[#7A060B]"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMS.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-xl hover:bg-[#F5F0EB] transition-colors">
                      <input type="checkbox" checked={!!modal.data.permissions?.[p]}
                        onChange={(e) => setModal((prev) => ({ ...prev, data: { ...prev.data, permissions: { ...prev.data.permissions, [p]: e.target.checked } } }))}
                        className="accent-[#7A060B]" />
                      <span className="text-gray-600 capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={modal.data.is_active}
                  onChange={(e) => setModal((p) => ({ ...p, data: { ...p.data, is_active: e.target.checked } }))}
                  className="accent-[#7A060B]" />
                <span className="text-gray-600">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal({ open: false, data: EMPTY })}
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
