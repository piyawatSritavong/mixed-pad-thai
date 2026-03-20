"use client";

import { useState } from "react";

interface ProfilePageProps {
  tableNumber: string;
  onTableNumberChange: (value: string) => void;
}

export default function ProfilePage({
  tableNumber,
  onTableNumberChange,
}: ProfilePageProps) {
  const [staffCalled, setStaffCalled] = useState(false);
  const [billRequested, setBillRequested] = useState(false);

  function handleCallStaff() {
    setStaffCalled(true);
    setTimeout(() => setStaffCalled(false), 3000);
  }

  function handleCheckBill() {
    setBillRequested(true);
    setTimeout(() => setBillRequested(false), 3000);
  }

  return (
    <div className="px-4 lg:px-8 max-w-lg mx-auto">
      <h2 className="text-xl font-black text-gray-800 mb-4">โปรไฟล์โต๊ะ</h2>

      {/* Table card */}
      <div className="bg-gradient-to-br from-[#9E080F] via-[#B50910] to-[#7A060B] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-8 -bottom-8 w-24 h-24 rounded-full bg-white/10" />

        <div className="relative z-10">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
            โต๊ะของคุณ
          </p>
          <div className="flex items-end gap-3 mt-2">
            <p className="text-6xl font-black leading-none">
              {tableNumber || "–"}
            </p>
            <p className="text-white/60 text-sm mb-1">โต๊ะ</p>
          </div>
        </div>
      </div>

      {/* Edit table number */}
      <div className="mt-4 bg-white rounded-2xl shadow-card p-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          หมายเลขโต๊ะ
        </label>
        <input
          type="text"
          value={tableNumber}
          onChange={(e) => onTableNumberChange(e.target.value)}
          placeholder="เช่น 1, 2, A3..."
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#9E080F]/30 focus:border-[#9E080F] transition"
        />
      </div>

      {/* Action buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Call staff */}
        <button
          onClick={handleCallStaff}
          className={`flex flex-col items-center gap-2 py-5 rounded-2xl font-bold text-sm transition-all shadow-card ${
            staffCalled
              ? "bg-green-50 text-green-600 border-2 border-green-300"
              : "bg-white text-gray-700 hover:shadow-card-hover active:scale-95"
          }`}
        >
          <span className="text-3xl">{staffCalled ? "✅" : "🔔"}</span>
          {staffCalled ? "เรียกแล้ว!" : "เรียกพนักงาน"}
        </button>

        {/* Check bill */}
        <button
          onClick={handleCheckBill}
          className={`flex flex-col items-center gap-2 py-5 rounded-2xl font-bold text-sm transition-all shadow-card ${
            billRequested
              ? "bg-[#FFF8E1] text-[#9E080F] border-2 border-[#F7B90B]"
              : "bg-[#9E080F] text-white hover:bg-[#7A060B] active:scale-95"
          }`}
        >
          <span className="text-3xl">{billRequested ? "📋" : "💳"}</span>
          {billRequested ? "กำลังเรียกบิล..." : "เช็คบิล"}
        </button>
      </div>

      {/* Info box */}
      <div className="mt-4 bg-white rounded-2xl shadow-card p-4">
        <h3 className="font-bold text-gray-700 text-sm mb-3">ข้อมูลร้าน</h3>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>🕐</span>
            <span>เปิดบริการ 10:00 – 22:00 น.</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📞</span>
            <span>โทร 0xx-xxx-xxxx</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔥</span>
            <span>ผัดไทยไฟแดง จำกัด 1 ที่/ลูกค้า/ชั่วโมง</span>
          </div>
        </div>
      </div>
    </div>
  );
}
