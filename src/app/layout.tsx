import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ผัดไทยไฟรวม",
  description: "สั่งผัดไทยไฟสูตรพิเศษ ส่งถึงบ้าน",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#F5F0EB]">{children}</body>
    </html>
  );
}
