import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "InnovaEdu - Bimbingan Belajar SD & SMP",
  description: "Bimbingan belajar privat dan kelompok untuk siswa SD dan SMP.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
