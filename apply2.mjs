// Jalankan dari root project: node apply2.mjs  (footer landing memakai kontak dari Pengaturan)
import fs from "node:fs";

const f = "app/page.tsx";
if (!fs.existsSync(f)) { console.log("app/page.tsx tidak ditemukan"); process.exit(1); }
let s = fs.readFileSync(f, "utf8");
if (s.includes("ambilPengaturan")) { console.log("landing sudah dipatch"); process.exit(0); }

const pairs = [
  ['import "./beranda.css";', 'import "./beranda.css";\nimport { ambilPengaturan } from "./lib/pengaturan";'],
  ["export default function Beranda() {", "export default async function Beranda() {\n  const cfg = await ambilPengaturan();"],
  ["<p>Jl. Contoh No. 24, Kota Anda</p>", "<p>{cfg.alamat}</p>\n            <p>{cfg.jam}</p>"],
  ['<a href="tel:+6281234567890">0812-3456-7890</a>', '<a href={`https://wa.me/${cfg.whatsapp.replace(/\\D/g, "").replace(/^0/, "62")}`}>{cfg.whatsapp}</a>'],
  ['<a href="mailto:halo@innovaedu.id">halo@innovaedu.id</a>', "<a href={`mailto:${cfg.email}`}>{cfg.email}</a>"],
];
for (const [a, b] of pairs) {
  if (!s.includes(a)) { console.log("tidak ditemukan, lewati:", a.slice(0, 40)); continue; }
  s = s.replace(a, b);
}
fs.writeFileSync(f, s);
console.log("landing: kontak footer sekarang dari Pengaturan");
