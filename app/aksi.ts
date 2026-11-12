"use server";
import { revalidatePath } from "next/cache";
import { currentUser } from "./lib/auth";
import { kirimEmail } from "./lib/email";
import { jam, tgl } from "./lib/format";
import { supabaseAdmin } from "./lib/supabase/admin";
import { ambilPengaturan } from "./lib/pengaturan";

const segarkan = () => { revalidatePath("/portal"); revalidatePath("/murid"); };
const web = () => process.env.NEXT_PUBLIC_SITE_URL ?? "";

async function infoSesi(id: number) {
  const { data } = await supabaseAdmin().from("sesi")
    .select("mapel,pengajar_id,siswa_id,pengajar:profiles!sesi_pengajar_id_fkey(nama,email),siswa:profiles!sesi_siswa_id_fkey(nama,email)").eq("id", id).single();
  return data as any;
}

// Pengajar atau siswa mengajukan jadwal baru (minimal 24 jam sebelum sesi, maks. 3x per bulan).
export async function ajukanReschedule(sesiId: number, tanggal: string, mulai: string, selesai: string, alasan: string) {
  const u = await currentUser();
  if (!u) return "Belum login";
  const cfg = await ambilPengaturan();
  const { data: s } = await u.sb.from("sesi").select("tanggal,jam_mulai").eq("id", sesiId).single();
  if (!s) return "Sesi tidak ditemukan";
  if (new Date(`${s.tanggal}T${s.jam_mulai}+07:00`).getTime() - Date.now() < cfg.batas_ajukan_jam * 3600e3) return `Pengajuan minimal ${cfg.batas_ajukan_jam} jam sebelum sesi`;
  if (!tanggal || !mulai || !selesai || mulai >= selesai) return "Isi tanggal dan jam dengan benar";
  if (new Date(`${tanggal}T${mulai}:00+07:00`).getTime() <= Date.now()) return "Waktu baru harus di masa depan";
  const { error } = await u.sb.from("reschedule").insert({ sesi_id: sesiId, diajukan_oleh: u.id, tanggal_baru: tanggal, jam_mulai_baru: mulai, jam_selesai_baru: selesai, alasan });
  if (error) return error.message;

  const i = await infoSesi(sesiId); // beri tahu pihak lawan lewat email
  if (i) {
    const lawan = u.id === i.pengajar_id ? i.siswa : i.pengajar;
    await kirimEmail(lawan.email, `Permintaan ganti jadwal ${i.mapel}`,
      `<p>Halo ${lawan.nama}, ada permintaan ganti jadwal ${i.mapel} ke <b>${tgl(tanggal)} ${jam(mulai, selesai)}</b>.${alasan ? ` Alasan: ${alasan}.` : ""}</p><p><a href="${web()}/login">Masuk untuk menjawab</a></p>`);
  }
  segarkan();
  return "ok";
}

export async function tanggapi(id: number, setuju: boolean) {
  const u = await currentUser();
  if (!u) return "Belum login";
  const { data: r } = await supabaseAdmin().from("reschedule").select("sesi_id,diajukan_oleh,tanggal_baru,jam_mulai_baru,jam_selesai_baru").eq("id", id).single();
  const { data, error } = await u.sb.rpc("tanggapi_reschedule", { req: id, setuju });
  if (!error && data === "ok" && r) {
    const i = await infoSesi(r.sesi_id);
    if (i) {
      const waktu = `${tgl(r.tanggal_baru)} ${jam(r.jam_mulai_baru, r.jam_selesai_baru)}`;
      const peminta = r.diajukan_oleh === i.pengajar_id ? i.pengajar : i.siswa;
      const lawan = r.diajukan_oleh === i.pengajar_id ? i.siswa : i.pengajar;
      if (setuju) {
        for (const p of [peminta, lawan]) await kirimEmail(p.email, `Jadwal ${i.mapel} dipindah`, `<p>Halo ${p.nama}, jadwal ${i.mapel} sekarang: <b>${waktu}</b>.</p>`);
      } else {
        await kirimEmail(peminta.email, `Permintaan ganti jadwal ${i.mapel} ditolak`, `<p>Halo ${peminta.nama}, permintaan ganti jadwal ke ${waktu} belum bisa disetujui. Jadwal tetap seperti semula.</p>`);
      }
    }
  }
  segarkan();
  return error ? error.message : (data as string);
}

export async function selesaikan(id: number) {
  const u = await currentUser();
  if (!u) return "Belum login";
  const { data, error } = await u.sb.rpc("selesaikan_sesi", { sid: id });
  segarkan();
  return error ? error.message : (data as string);
}
