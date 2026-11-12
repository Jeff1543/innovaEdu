// Jalankan dari root project: node fix-routes.mjs
// Landing publik jadi "/", semua halaman admin pindah ke "/admin/...".
import fs from "node:fs";
import path from "node:path";

const app = path.join(process.cwd(), "app");
const admin = path.join(app, "admin");

function mv(from, to) {
  if (!fs.existsSync(from)) return console.log("lewati (tidak ada):", path.relative(app, from));
  if (fs.existsSync(to)) return console.log("lewati (sudah ada):", path.relative(app, to));
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
  console.log("pindah:", path.relative(app, from), "->", path.relative(app, to));
}

// 1. admin pindah ke /admin (harus duluan, sebelum landing menempati app/page.tsx)
mv(path.join(app, "page.tsx"), path.join(admin, "page.tsx"));
mv(path.join(app, "siswa"), path.join(admin, "siswa"));
mv(path.join(app, "pengajar"), path.join(admin, "pengajar"));

// 2. landing dari app/beranda -> app/ (jadi "/")
for (const f of ["page.tsx", "interactive.tsx", "beranda.css"])
  mv(path.join(app, "beranda", f), path.join(app, f));
try { fs.rmdirSync(path.join(app, "beranda")); } catch {}

// 3. perbaiki link di halaman admin yang sudah ada
const pages = ["page.tsx", "siswa/page.tsx", "pengajar/page.tsx"].map((p) => path.join(admin, p));
for (const file of pages) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, "utf8");
  const out = src
    .replace(/(href=|href:\s*)"\/"/g, '$1"/admin"')
    .replace(/"\/(siswa|pengajar|kelas|jadwal|absensi|pembayaran|laporan|pengaturan)"/g, '"/admin/$1"');
  if (out !== src) { fs.writeFileSync(file, out); console.log("link diperbarui:", path.relative(app, file)); }
}

// 4. tombol "Masuk sebagai admin" di landing
const landing = path.join(app, "page.tsx");
if (fs.existsSync(landing)) {
  const s = fs.readFileSync(landing, "utf8");
  const o = s.replace('<a href="/">Masuk sebagai admin</a>', '<a href="/admin">Masuk sebagai admin</a>');
  if (o !== s) { fs.writeFileSync(landing, o); console.log("link admin di landing diperbarui"); }
}
console.log("Selesai. Restart npm run dev.");
