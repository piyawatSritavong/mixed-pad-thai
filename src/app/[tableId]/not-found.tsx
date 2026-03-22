"use client";

import { useState } from "react";

export default function TableNotFound() {
  const [calling, setCalling] = useState(false);
  const [called, setCalled] = useState(false);

  function handleCall() {
    setCalling(true);
    setTimeout(() => { setCalling(false); setCalled(true); }, 800);
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-[#9E080F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🍽️</span>
        </div>

        <h1 className="text-2xl font-black text-gray-800 mb-2">ไม่พบโต๊ะนี้</h1>
        <p className="text-gray-500 text-sm mb-2">
          URL ของโต๊ะไม่ถูกต้อง หรือโต๊ะนี้ไม่ได้เปิดให้บริการ
        </p>
        <p className="text-gray-400 text-xs mb-8">
          กรุณาสแกน QR Code ที่โต๊ะอีกครั้ง หรือติดต่อพนักงาน
        </p>

        {/* Call staff button */}
        {called ? (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl py-4 px-6">
            <p className="text-green-600 font-bold text-sm">✅ แจ้งพนักงานแล้ว กรุณารอสักครู่</p>
          </div>
        ) : (
          <button
            onClick={handleCall}
            disabled={calling}
            className="w-full bg-[#9E080F] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#7A060B] active:scale-95 transition-all shadow-lg disabled:opacity-60"
          >
            {calling ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                กำลังเรียก...
              </span>
            ) : (
              "🔔 เรียกพนักงาน"
            )}
          </button>
        )}

        <p className="mt-6 text-xs text-gray-400">ผัดไทยไฟรวม</p>
      </div>
    </div>
  );
}
