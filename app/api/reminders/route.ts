import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ambilPengaturan } from "../../lib/pengaturan";

export const dynamic = "force-dynamic";

async function kirim(to: string, subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, html }),
  });
  return r.ok;
}

// Cron tiap pagi: kirim email pengingat untuk sesi BESOK (H-1) dari database. Sesi yang sudah dipindah otomatis ikut jadwal barunya.
// Tes tanpa kirim: /api/reminders?dry=1 (butuh header Authorization: Bearer CRON_SECRET)
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  if (!(await ambilPengaturan()).reminder_aktif && !dry) return NextResponse.json({ dilewati: "Pengingat dimatikan di Pengaturan" });
  if (!dry && (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM))
    return NextResponse.json({ error: "RESEND_API_KEY / MAIL_FROM belum diisi" }, { status: 500 });

  const tanggal = new Date(Date.now() + (7 + 24) * 3600e3).toISOString().slice(0, 10); // besok (WIB)
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await sb.from("sesi")
    .select("mapel,lokasi,jam_mulai,jam_selesai,pengajar:profiles!sesi_pengajar_id_fkey(nama,email),siswa:profiles!sesi_siswa_id_fkey(nama,email)")
    .eq("tanggal", tanggal).eq("status", "terjadwal");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const web = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const hasil: { to: string; subject: string; terkirim: boolean | null }[] = [];
  for (const s of (data ?? []) as any[]) {
    const waktu = `${s.jam_mulai.slice(0, 5)} - ${s.jam_selesai.slice(0, 5)}`;
    const detail = `<p><b>${s.mapel}</b><br>${tanggal} · ${waktu}<br>Lokasi: ${s.lokasi ?? "-"}</p><p>Perlu ganti jadwal? <a href="${web}/login">Masuk dan ajukan di sini</a> (minimal 24 jam sebelumnya).</p>`;
    const pesan = [
      { to: s.siswa.email, subject: `Pengingat: bimbel ${s.mapel} besok`, html: `<p>Halo ${s.siswa.nama}, besok ada bimbel bersama ${s.pengajar.nama}.</p>${detail}` },
      { to: s.pengajar.email, subject: `Pengingat mengajar besok: ${s.siswa.nama}`, html: `<p>Halo ${s.pengajar.nama}, besok Anda mengajar ${s.siswa.nama}.</p>${detail}` },
    ];
    for (const m of pesan) hasil.push({ to: m.to, subject: m.subject, terkirim: dry ? null : await kirim(m.to, m.subject, m.html) });
  }
  return NextResponse.json({ tanggal, dry, jumlah: hasil.length, hasil });
}
