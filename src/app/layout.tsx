import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kreasi AI",
  description: "Chat AI dan generator gambar, video, audio, musik dengan session per akun."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
