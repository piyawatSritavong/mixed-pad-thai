"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SECTIONS = [
  {
    title: "ข้อมูลร้าน", icon: "🏪",
    fields: [
      { key: "shop_name",    label: "ชื่อร้าน",             type: "text" },
      { key: "shop_address", label: "ที่อยู่ร้าน",          type: "textarea" },
    ],
  },
  {
    title: "ใบเสร็จ", icon: "🧾",
    fields: [
      { key: "receipt_footer", label: "ข้อความท้ายใบเสร็จ", type: "text" },
    ],
  },
  {
    title: "ธีมสีของระบบ", icon: "🎨",
    fields: [
      { key: "theme_primary", label: "สีหลัก (Primary)",  type: "color" },
      { key: "theme_accent",  label: "สีเน้น (Accent)",   type: "color" },
      { key: "logo_url",      label: "URL โลโก้",         type: "text" },
    ],
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bannerTs, setBannerTs] = useState<Record<string, number>>({ "1": 0, "2": 0 });
  const [bannerError, setBannerError] = useState<Record<string, boolean>>({ "1": false, "2": false });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // init timestamps client-side to avoid hydration mismatch
  useEffect(() => {
    setBannerTs({ "1": Date.now(), "2": Date.now() });
    fetch("/api/admin/settings").then((r) => r.json()).then(setSettings);
  }, []);

  async function uploadBanner(slot: "1" | "2", file: File) {
    setUploading((p) => ({ ...p, [slot]: true }));
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/admin/banners/${slot}`, { method: "POST", body: fd });
    setUploading((p) => ({ ...p, [slot]: false }));
    if (res.ok) {
      setBannerError((p) => ({ ...p, [slot]: false }));
      setBannerTs((p) => ({ ...p, [slot]: Date.now() }));
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Settings</h1>
        <p className="text-sm text-gray-400">ตั้งค่าระบบร้านอาหาร</p>
      </div>

      <form onSubmit={save} className="space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
              <span className="text-xl">{section.icon}</span>
              <h2 className="font-bold text-gray-700">{section.title}</h2>
            </div>
            {/* Fields */}
            <div className="px-5 py-4 space-y-4">
              {section.fields.map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
                  {type === "textarea" ? (
                    <textarea rows={2} value={settings[key] ?? ""}
                      onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/20 bg-[#F5F0EB] resize-none" />
                  ) : type === "color" ? (
                    <div className="flex items-center gap-3">
                      <label className="relative cursor-pointer">
                        <div className="w-12 h-10 rounded-xl border-2 border-gray-200 overflow-hidden cursor-pointer"
                          style={{ backgroundColor: settings[key] ?? "#000000" }} />
                        <input type="color" value={settings[key] ?? "#000000"}
                          onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      </label>
                      <input type="text" value={settings[key] ?? ""}
                        onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                        className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7A060B]/20 bg-[#F5F0EB]" />
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: settings[key] ?? "#000000" }}>A</div>
                    </div>
                  ) : (
                    <input type="text" value={settings[key] ?? ""}
                      onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/20 bg-[#F5F0EB]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Banner section – outside the submit form flow, uses its own upload */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
            <span className="text-xl">🖼️</span>
            <h2 className="font-bold text-gray-700">แบนเนอร์โฆษณา (หน้าเลือกโต๊ะ)</h2>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 gap-5">
            {(["1", "2"] as const).map((slot) => (
              <div key={slot} className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-600">แบนเนอร์ {slot === "1" ? "ซ้าย" : "ขวา"}</p>
                {/* Preview */}
                <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center relative">
                  {bannerTs[slot] > 0 && !bannerError[slot] ? (
                    <Image
                      key={bannerTs[slot]}
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/banners/ads-banner-${slot}.jpg?v=${bannerTs[slot]}`}
                      alt={`banner ${slot}`}
                      fill
                      className="object-contain"
                      unoptimized
                      onError={() => setBannerError((p) => ({ ...p, [slot]: true }))}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <span className="text-3xl">🖼️</span>
                      <p className="text-xs">ยังไม่มีรูป</p>
                    </div>
                  )}
                </div>
                {/* Upload */}
                <label className={`cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm font-semibold transition-colors ${uploading[slot] ? "opacity-60 pointer-events-none" : "hover:border-[#7A060B] hover:text-[#7A060B] text-gray-500"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {uploading[slot] ? "กำลังอัพโหลด..." : "อัพโหลดรูปใหม่"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBanner(slot, f); e.target.value = ""; }} />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Preview card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-700 mb-3">👁️ Preview</h2>
          <div className="rounded-xl p-4" style={{ backgroundColor: settings.theme_primary ?? "#7A060B" }}>
            <p className="font-black text-white text-lg">{settings.shop_name ?? "ผัดไทยไฟรวม"}</p>
            <p className="text-white/70 text-xs mt-0.5">{settings.shop_address || "ที่อยู่ร้าน"}</p>
            <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: settings.theme_accent ?? "#F7B90B", color: "#1a1a1a" }}>
              สั่งอาหาร
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${
            saved ? "bg-green-600 text-white" : "bg-[#7A060B] hover:bg-[#9E080F] text-white"
          } disabled:opacity-60`}>
          {saved ? "✅ บันทึกการตั้งค่าเรียบร้อย!" : saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </form>
    </div>
  );
}
