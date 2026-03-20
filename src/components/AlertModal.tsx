"use client";

interface AlertModalProps {
  message: string;
  onClose: () => void;
}

export default function AlertModal({ message, onClose }: AlertModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl modal-fade-in">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-[#9E080F]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-black text-gray-800 mb-2">
            ไม่สามารถสั่งได้
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-[#9E080F] text-white font-bold py-3 rounded-2xl hover:bg-[#7A060B] transition-colors"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}
