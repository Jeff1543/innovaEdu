import { DataPage } from "../_shell";
import { requireRole } from "../../lib/auth";
import { hariIniWIB, rp } from "../../lib/format";

export default async function Page() {
  const u = await requireRole("admin");
  const [{ data: s }, { data: p }] = await Promise.all([
    u.sb.from("sesi").select("tanggal,honor,siswa_id").eq("status", "selesai"),
    u.sb.from("pembayaran").select("tanggal,jumlah").eq("status", "terverifikasi"),
  ]);
  type B = { n: number; honor: number; sw: Set<string>; masuk: number };
  const bln: Record<string, B> = {};
  const get = (k: string) => (bln[k] ??= { n: 0, honor: 0, sw: new Set(), masuk: 0 });
  (s ?? []).forEach((r: any) => { const b = get(r.tanggal.slice(0, 7)); b.n++; b.honor += r.honor; b.sw.add(r.siswa_id); });
  (p ?? []).forEach((r: any) => { get(r.tanggal.slice(0, 7)).masuk += r.jumlah; });
  const label = (k: string) => new Date(`${k}-01T00:00:00Z`).toLocaleDateString("id-ID", { timeZone: "UTC", month: "long", year: "numeric" });
  const now = bln[hariIniWIB().slice(0, 7)] ?? { n: 0, honor: 0, sw: new Set<string>(), masuk: 0 };

  return (
    <DataPage active="/admin/laporan" title="Laporan" desc="Ringkasan operasional per bulan: sesi selesai, pemasukan terverifikasi, dan honor pengajar."
      stats={[["Pemasukan Bulan Ini", rp(now.masuk), "terverifikasi"], ["Sesi Selesai", String(now.n), "bulan ini"], ["Siswa Aktif", String(now.sw.size), "bulan ini"], ["Honor Pengajar", rp(now.honor), "bulan ini"]]}
      columns={["Bulan", "Sesi selesai", "Siswa aktif", "Pemasukan", "Honor pengajar"]}
      rows={Object.keys(bln).sort().reverse().map((k) => [label(k), String(bln[k].n), String(bln[k].sw.size), rp(bln[k].masuk), rp(bln[k].honor)])} />
  );
}
