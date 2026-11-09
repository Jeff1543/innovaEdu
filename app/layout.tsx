import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InnovaEdu",
  description: "Sistem Manajemen Bimbingan Belajar InnovaEdu",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}