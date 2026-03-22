"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError((await res.json()).error ?? "เข้าสู่ระบบล้มเหลว"); return; }
      router.push("/admin/dashboard");
    } catch { setError("เกิดข้อผิดพลาดทางเครือข่าย"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Top banner */}
          <div className="bg-[#7A060B] px-8 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F7B90B] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-black text-[#7A060B]">ผ</span>
            </div>
            <h1 className="text-xl font-black text-white">ผัดไทยไฟรวม</h1>
            <p className="text-white/60 text-sm mt-1">Admin Panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required autoFocus placeholder="admin"
                className="w-full bg-[#F5F0EB] border border-transparent rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/30 focus:border-[#7A060B]/30 placeholder-gray-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required placeholder="••••••••"
                className="w-full bg-[#F5F0EB] border border-transparent rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A060B]/30 focus:border-[#7A060B]/30 placeholder-gray-300" />
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <span className="text-red-400 text-sm">⚠️</span>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-[#7A060B] hover:bg-[#9E080F] text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 mt-2 shadow-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ระบบหลังบ้าน ผัดไทยไฟรวม · สำหรับเจ้าหน้าที่เท่านั้น
        </p>
      </div>
    </div>
  );
}
