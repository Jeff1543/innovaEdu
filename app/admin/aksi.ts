"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../lib/auth";
import { supabaseAdmin } from "../lib/supabase/admin";

// Server action = endpoint publik, jadi SETIAP aksi memeriksa role admin sendiri.
const kembali = (path: string, pesan: string): never => {
  revalidatePath(path);
  redirect(`${path}?pesan=${encodeURIComponent(pesan)}`);
};

export async function tambahSesi(f: FormData) {
  const u = await requireRole("admin");
  const { error } = await u.sb.from("sesi").insert({
    pengajar_id: f.get("pengajar"), siswa_id: f.get("siswa"), mapel: f.get("mapel"), lokasi: f.get("lokasi"),
    tanggal: f.get("tanggal"), jam_mulai: f.get("mulai"), jam_selesai: f.get("selesai"), honor: Number(f.get("honor") || 0),
  });
  kembali("/admin/jadwal", error ? error.message : "Sesi ditambahkan");
}

export async function tambahPembayaran(f: FormData) {
  const u = await requireRole("admin");
  const { error } = await u.sb.from("pembayaran").insert({ siswa_id: f.get("siswa"), keterangan: f.get("keterangan"), jumlah: Number(f.get("jumlah")) });
  kembali("/admin/pembayaran", error ? error.message : "Pembayaran dicatat");
}

export async function verifikasi(id: number, _f: FormData) {
  const u = await requireRole("admin");
  const { error } = await u.sb.from("pembayaran").update({ status: "terverifikasi" }).eq("id", id);
  kembali("/admin/pembayaran", error ? error.message : "Pembayaran diverifikasi");
}

export async function buatAkun(f: FormData) {
  await requireRole("admin");
  const a = supabaseAdmin();
  const nama = String(f.get("nama") ?? "").trim(), role = String(f.get("role"));
  // Akun admin TIDAK boleh dibuat dari website (dicek di server, bukan cuma disembunyikan di form). Admin dibuat lewat Supabase.
  if (!["siswa", "pengajar"].includes(role)) return kembali("/admin/akun", "Akun admin tidak bisa dibuat dari sini. Pilih Siswa atau Pengajar.");
  if (!nama) return kembali("/admin/akun", "Nama wajib diisi");
  if (String(f.get("password") ?? "").length < 8) return kembali("/admin/akun", "Password minimal 8 karakter");
  const { data, error } = await a.auth.admin.createUser({ email: String(f.get("email")), password: String(f.get("password")), email_confirm: true, user_metadata: { nama } });
  if (error || !data.user) return kembali("/admin/akun", error?.message ?? "Gagal membuat akun");
  await a.from("profiles").update({ nama, roles: [role] }).eq("id", data.user.id);
  kembali("/admin/akun", "Akun dibuat");
}

type DataSiswa = { name: string; gender: string; level: string; grade: string; program: string; parent: string; phone: string; email: string; status: string };
type DataPengajar = { name: string; gender: string; phone: string; email: string; education: string; subjects: string[]; experience: number; rate: number; status: string };

// Simpan (tambah/ubah) profil + akun login. Akun baru memakai password acak; siswa/pengajar masuk lewat link email.
async function simpanProfil(role: string, detail: Record<string, any>, email: string, id: string | undefined, path: string) {
  await requireRole("admin");
  const a = supabaseAdmin();
  if (id) {
    const { data: cur } = await a.from("profiles").select("email").eq("id", id).single();
    if (email && email !== cur?.email) {
      const { error } = await a.auth.admin.updateUserById(id, { email });
      if (error) return error.message;
      detail.email = email;
    }
    const { error } = await a.from("profiles").update(detail).eq("id", id);
    if (error) return error.message;
  } else {
    if (!email) return "Email wajib diisi supaya bisa login dan menerima pengingat.";
    const { data, error } = await a.auth.admin.createUser({ email, password: crypto.randomUUID(), email_confirm: true, user_metadata: { nama: detail.nama } });
    if (error || !data.user) return error?.message ?? "Gagal membuat akun";
    const { error: e2 } = await a.from("profiles").update({ ...detail, roles: [role] }).eq("id", data.user.id);
    if (e2) return e2.message;
  }
  revalidatePath(path);
  return "ok";
}

export async function simpanSiswa(d: DataSiswa, id?: string) {
  return simpanProfil("siswa", { nama: d.name.trim(), gender: d.gender, level: d.level, grade: d.grade, program: d.program, parent: d.parent.trim(), phone: d.phone.trim(), status: d.status }, d.email.trim(), id, "/admin/siswa");
}
export async function simpanPengajar(d: DataPengajar, id?: string) {
  return simpanProfil("pengajar", { nama: d.name.trim(), gender: d.gender, phone: d.phone.trim(), education: d.education.trim(), subjects: d.subjects, experience: d.experience, rate: d.rate, status: d.status }, d.email.trim(), id, "/admin/pengajar");
}

async function hapusProfil(id: string, path: string) {
  const u = await requireRole("admin");
  if (u.id === id) return "Tidak bisa menghapus akun yang sedang dipakai.";
  const { error } = await supabaseAdmin().auth.admin.deleteUser(id);
  if (error) return "Tidak bisa dihapus karena masih punya riwayat sesi atau pembayaran. Ubah status menjadi Nonaktif saja.";
  revalidatePath(path);
  return "ok";
}
export const hapusSiswa = async (id: string) => hapusProfil(id, "/admin/siswa");
export const hapusPengajar = async (id: string) => hapusProfil(id, "/admin/pengajar");

export async function simpanPengaturan(f: FormData) {
  const u = await requireRole("admin");
  const batas = Number(f.get("batas_ajukan_jam")), maks = Number(f.get("maks_reschedule"));
  if (!(batas >= 0 && batas <= 168) || !(maks >= 0 && maks <= 30)) return kembali("/admin/pengaturan", "Batas jam harus 0-168 dan maks. reschedule 0-30.");
  const { error } = await u.sb.from("pengaturan").update({
    nama: f.get("nama"), whatsapp: f.get("whatsapp"), email: f.get("email"), alamat: f.get("alamat"), jam: f.get("jam"),
    batas_ajukan_jam: batas, maks_reschedule: maks, reminder_aktif: f.get("reminder_aktif") === "on",
  }).eq("id", 1);
  kembali("/admin/pengaturan", error ? error.message : "Pengaturan disimpan");
}

const STATUS_DAFTAR = ["baru", "dihubungi", "trial", "jadi_siswa", "batal"];

export async function ubahStatusDaftar(id: number, status: string, _f: FormData) {
  const u = await requireRole("admin");
  if (!STATUS_DAFTAR.includes(status)) return kembali("/admin/pendaftaran", "Status tidak valid");
  const { error } = await u.sb.from("pendaftaran").update({ status }).eq("id", id);
  kembali("/admin/pendaftaran", error ? error.message : "Status diperbarui");
}

// Pendaftar -> data siswa + akun login (password acak, siswa masuk lewat link email). Email wajib.
export async function jadikanSiswa(id: number, f: FormData) {
  const u = await requireRole("admin");
  const { data: d } = await u.sb.from("pendaftaran").select("*").eq("id", id).single();
  if (!d) return kembali("/admin/pendaftaran", "Data pendaftaran tidak ditemukan");
  if (d.status === "jadi_siswa") return kembali("/admin/pendaftaran", "Sudah dijadikan siswa");
  const email = String(f.get("email") ?? "").trim();
  const hasil = await simpanProfil("siswa", {
    nama: d.nama, level: d.jenjang, grade: d.kelas, program: d.program, parent: d.orang_tua, phone: d.hp, status: "Aktif",
  }, email, undefined, "/admin/siswa");
  if (hasil !== "ok") return kembali("/admin/pendaftaran", hasil);
  await u.sb.from("pendaftaran").update({ status: "jadi_siswa", email }).eq("id", id);
  kembali("/admin/pendaftaran", `${d.nama} sudah masuk ke Data Siswa`);
}
