export default function PromoBanner() {
  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#9E080F] via-[#B50910] to-[#7A060B] p-5 text-white relative shadow-lg">
      {/* Text content */}
      <div className="relative z-10 max-w-[240px]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
          โปรโมชั่นพิเศษ · สำหรับสมาชิก
        </p>
        <h3 className="text-3xl font-black mt-1 leading-tight">
          5%{" "}
          <span className="text-[#F7B90B]">OFF</span>
        </h3>
        <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
          ซื้อผัดไทยไฟส้ม, ชมพู หรือ เขียว ครบทุก 2 ชิ้น รับส่วนลด 5% ทุกคู่!
        </p>
        <div className="mt-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2 flex items-start gap-2">
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-[10px] text-white/90 leading-relaxed">
            ผัดไทยไฟแดง จำกัดสั่งได้ 1 ที่ต่อลูกค้า 1 ท่าน ภายใน 1 ชั่วโมง
          </p>
        </div>
      </div>

      {/* Decorative circles */}
      <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute right-10 -bottom-6 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-6xl opacity-30 select-none pointer-events-none">
        🔥
      </div>
    </div>
  );
}
