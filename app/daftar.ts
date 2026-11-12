"use server";
import { kirimEmail } from "./lib/email";
import { ambilPengaturan } from "./lib/pengaturan";
import { supabaseAdmin } from "./lib/supabase/admin";

type Data = Record<string, FormDataEntryValue>;
const t = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

// Dipanggil dari form landing (publik, tanpa login). Validasi di server, simpan pakai service role.
export async function daftarTrial(d: Data) {
  if (t(d.website, 100)) return "ok"; // honeypot: bot mengisi kolom tersembunyi ini, diam-diam diabaikan
  const nama = t(d.name, 100), orangTua = t(d.parent, 100), hp = t(d.phone, 20), email = t(d.email, 120);
  const jenjang = t(d.level, 4), program = t(d.program, 20);
  if (!nama || !orangTua || !hp) return "Nama siswa, nama orang tua, dan nomor WhatsApp wajib diisi.";
  if (!/^[0-9+\-\s]{9,16}$/.test(hp)) return "Nomor WhatsApp harus berisi 9–16 karakter angka.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Format email tidak valid.";
  if (!["SD", "SMP"].includes(jenjang) || !["Kelompok", "Privat"].includes(program)) return "Data jenjang atau program tidak valid.";

  const { error } = await supabaseAdmin().from("pendaftaran").insert({
    nama, jenjang, kelas: t(d.grade, 20), program, mapel: t(d.subject, 40),
    orang_tua: orangTua, hp, email: email || null, catatan: t(d.note, 500) || null,
  });
  if (error) return "Maaf, pendaftaran belum bisa disimpan. Silakan coba lagi atau hubungi kami lewat WhatsApp.";

  // Beri tahu admin lewat email (dilewati otomatis kalau Resend belum diisi)
  const cfg = await ambilPengaturan();
  await kirimEmail(cfg.email, `Pendaftaran trial baru: ${nama}`,
    `<p><b>${nama}</b> (${jenjang} ${t(d.grade, 20)}, ${program}, ${t(d.subject, 40)})</p><p>Orang tua: ${orangTua}<br>WhatsApp: ${hp}</p><p>Buka <b>Admin &gt; Pendaftaran</b> untuk menindaklanjuti.</p>`);
  return "ok";
}
