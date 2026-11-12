import { DataPage } from "../_shell";
import { requireRole } from "../../lib/auth";
import { rp } from "../../lib/format";

// Program dihitung otomatis dari data sesi, dikelompokkan per mata pelajaran.
export default async function Page() {
  const u = await requireRole("admin");
  const { data } = await u.sb.from("sesi").select("mapel,honor,pengajar_id,siswa_id").neq("status", "dibatalkan");
  const g: Record<string, { n: number; h: number; p: Set<string>; s: Set<string> }> = {};
  (data ?? []).forEach((r: any) => {
    const x = (g[r.mapel] ??= { n: 0, h: 0, p: new Set(), s: new Set() });
    x.n++; x.h += r.honor; x.p.add(r.pengajar_id); x.s.add(r.siswa_id);
  });
  const all = Object.entries(g);
  const uniq = (k: "p" | "s") => new Set(all.flatMap(([, v]) => [...v[k]])).size;

  return (
    <DataPage active="/admin/kelas" title="Kelas & Program" desc="Ringkasan program per mata pelajaran, dihitung dari data sesi."
      stats={[["Total Program", String(all.length), "mata pelajaran"], ["Total Sesi", String(all.reduce((a, [, v]) => a + v.n, 0)), "tercatat"], ["Pengajar Aktif", String(uniq("p")), "orang"], ["Siswa Aktif", String(uniq("s")), "orang"]]}
      columns={["Program", "Total sesi", "Pengajar", "Siswa", "Rata-rata honor"]}
      rows={all.map(([m, v]) => [m, String(v.n), String(v.p.size), String(v.s.size), rp(Math.round(v.h / v.n))])} />
  );
}
