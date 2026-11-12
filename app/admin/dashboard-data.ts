import { requireRole } from "../lib/auth";
import { hariIniWIB, jam, rp } from "../lib/format";

const BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const jt = (n: number) => (n >= 1e6 ? `Rp ${(n / 1e6).toFixed(1).replace(".", ",")} jt` : rp(n));
const pct = (a: number, b: number) => {
  if (!b) return a ? "+100%" : "0%";
  const p = ((a - b) / b) * 100;
  return `${p >= 0 ? "+" : ""}${p.toFixed(1).replace(".", ",")}%`;
};

// Semua angka dashboard dihitung dari database (RLS: hanya admin yang bisa membaca semuanya).
export async function muatDashboard(rentang = 6) {
  const u = await requireRole("admin");
  const hari = hariIniWIB();
  const [y, m] = hari.split("-").map(Number);
  const key = (yy: number, mm: number) => new Date(Date.UTC(yy, mm - 1, 1)).toISOString().slice(0, 7);
  const bulanIni = key(y, m), bulanLalu = key(y, m - 1);

  const [{ data: siswa }, { data: guru }, { data: sesiRaw }, { data: bayarRaw }] = await Promise.all([
    u.sb.from("profiles").select("status,dibuat").contains("roles", ["siswa"]),
    u.sb.from("profiles").select("status,dibuat").contains("roles", ["pengajar"]),
    u.sb.from("sesi").select("tanggal,jam_mulai,jam_selesai,mapel,status,pengajar:profiles!sesi_pengajar_id_fkey(nama),siswa:profiles!sesi_siswa_id_fkey(nama,program)").gte("tanggal", `${bulanLalu}-01`).order("jam_mulai"),
    u.sb.from("pembayaran").select("id,tanggal,jumlah,status,keterangan,siswa:profiles!pembayaran_siswa_id_fkey(nama)").gte("tanggal", `${key(y, m - 11)}-01`).order("tanggal", { ascending: false }).order("id", { ascending: false }),
  ]);
  const sesi: any[] = (sesiRaw ?? []).filter((s: any) => s.status !== "dibatalkan"), bayar: any[] = bayarRaw ?? [];
  const sum = (k: string) => bayar.filter((b) => b.status === "terverifikasi" && b.tanggal.startsWith(k)).reduce((a, b) => a + b.jumlah, 0);
  const aktif = (l: any[]) => l.filter((p) => p.status === "Aktif").length;
  const baru = (l: any[]) => l.filter((p) => String(p.dibuat).startsWith(bulanIni)).length;
  const pertemuan = sesi.filter((s) => s.tanggal.startsWith(bulanIni)).length, pertemuanLalu = sesi.filter((s) => s.tanggal.startsWith(bulanLalu)).length;
  const masuk = sum(bulanIni), masukLalu = sum(bulanLalu);

  const months = Array.from({ length: rentang }, (_, i) => key(y, m - (rentang - 1 - i)));
  const vals = months.map(sum);
  const nice = Math.max(5e6, Math.ceil(Math.max(...vals) / 5e6) * 5e6);
  const skala = [1, 0.75, 0.5, 0.25].map((f) => `${(nice * f / 1e6).toString().replace(".", ",")} jt`).concat("0");

  const hariIni = sesi.filter((s) => s.tanggal === hari);
  const jadwal = hariIni.map((s) => ({
    time: jam(s.jam_mulai, s.jam_selesai), subject: s.mapel, student: s.siswa?.nama ?? "-", teacher: s.pengajar?.nama ?? "-",
    type: s.siswa?.program ?? "Privat", color: s.siswa?.program === "Kelompok" ? "purple" : "blue",
  }));
  const jamWIB = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Jakarta" })) % 24;

  return {
    nama: u.nama || "Administrator",
    tanggal: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).toUpperCase(),
    sapaan: jamWIB < 11 ? "pagi" : jamWIB < 15 ? "siang" : jamWIB < 18 ? "sore" : "malam",
    stats: [
      { title: "Total Siswa Aktif", value: String(aktif(siswa ?? [])), change: `+${baru(siswa ?? [])}`, note: "siswa baru bulan ini", positive: true },
      { title: "Total Pengajar", value: String((guru ?? []).length), change: `+${baru(guru ?? [])}`, note: "pengajar baru bulan ini", positive: true },
      { title: "Pertemuan Bulan Ini", value: String(pertemuan), change: pct(pertemuan, pertemuanLalu), note: "dibanding bulan lalu", positive: pertemuan >= pertemuanLalu },
      { title: "Pendapatan Bulan Ini", value: jt(masuk), change: pct(masuk, masukLalu), note: "dibanding bulan lalu", positive: masuk >= masukLalu },
    ],
    pendapatan: rp(masuk), pendapatanChange: pct(masuk, masukLalu), pendapatanNaik: masuk >= masukLalu,
    chartData: months.map((k, i) => ({ month: BLN[Number(k.slice(5)) - 1], value: Math.round((vals[i] / nice) * 100) })),
    skala, bulanIni: BLN[m - 1],
    schedules: jadwal.length ? jadwal : [{ time: "-", subject: "Tidak ada sesi hari ini", student: "", teacher: "", type: "-", color: "blue" }],
    transactions: bayar.slice(0, 4).map((b) => ({
      name: b.siswa?.nama ?? "-", detail: b.keterangan ?? "-", amount: rp(b.jumlah),
      date: new Date(`${b.tanggal}T00:00:00Z`).toLocaleDateString("id-ID", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" }),
      status: b.status === "terverifikasi" ? "Terverifikasi" : "Menunggu",
    })),
    aktivitas: { terjadwal: hariIni.length, selesai: hariIni.filter((s) => s.status === "selesai").length, menunggu: bayar.filter((b) => b.status === "menunggu").length },
  };
}
