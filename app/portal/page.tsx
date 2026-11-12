import "../beranda.css";
import "./portal.css";
import { requireRole } from "../lib/auth";
import { hariIniWIB, jam, permintaanMasuk, tgl } from "../lib/format";
import Portal from "./client";

export default async function Page() {
  const u = await requireRole("pengajar");
  const { data } = await u.sb.from("sesi")
    .select("id,tanggal,jam_mulai,jam_selesai,mapel,lokasi,honor,status,siswa:profiles!sesi_siswa_id_fkey(nama)")
    .eq("pengajar_id", u.id).neq("status", "dibatalkan").order("tanggal").order("jam_mulai");
  const rows: any[] = data ?? [];
  const hari = hariIniWIB();
  const bln = hari.slice(0, 7);
  const label = (ym: string) => new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("id-ID", { timeZone: "UTC", month: "long", year: "numeric" });

  const dokMap: Record<number, string[]> = {};
  const { data: dk } = rows.length ? await u.sb.from("dokumentasi").select("sesi_id,path").in("sesi_id", rows.map((r) => r.id)) : { data: [] as any[] };
  if (dk?.length) {
    const { data: urls } = await u.sb.storage.from("dokumentasi").createSignedUrls(dk.map((d: any) => d.path), 3600);
    dk.forEach((d: any, i: number) => { if (urls?.[i]?.signedUrl) (dokMap[d.sesi_id] ??= []).push(urls[i].signedUrl!); });
  }

  const sesi = rows.filter((r) => r.tanggal.startsWith(bln)).map((r) => ({
    id: r.id as number, tgl: tgl(r.tanggal), jam: jam(r.jam_mulai, r.jam_selesai), siswa: (r.siswa?.nama ?? "-") as string,
    mapel: r.mapel as string, lokasi: (r.lokasi ?? "-") as string, fee: r.honor as number,
    selesai: r.status === "selesai", bisaSelesai: r.status === "terjadwal" && r.tanggal <= hari, docs: dokMap[r.id] ?? [],
  }));
  const per: Record<string, [number, number]> = {};
  rows.filter((r) => r.status === "selesai" && !r.tanggal.startsWith(bln)).forEach((r) => {
    const k = r.tanggal.slice(0, 7); per[k] = [(per[k]?.[0] ?? 0) + 1, (per[k]?.[1] ?? 0) + r.honor];
  });
  const riwayat = Object.entries(per).sort().reverse().map(([k, [n, t]]) => [label(k), String(n), "Rp " + new Intl.NumberFormat("id-ID").format(t), "Tercatat"]);

  return <Portal sesi={sesi} riwayat={riwayat} permintaan={await permintaanMasuk(u.sb, u.id)} nama={u.nama} bulan={label(bln)} />;
}
