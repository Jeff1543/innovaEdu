import { DataPage } from "../_shell";
import type { Cell } from "../_shell";
import { requireRole } from "../../lib/auth";
import { tgl } from "../../lib/format";

export default async function Page() {
  const u = await requireRole("admin");
  const { data } = await u.sb.from("sesi")
    .select("id,tanggal,mapel,pengajar:profiles!sesi_pengajar_id_fkey(nama),siswa:profiles!sesi_siswa_id_fkey(nama),dok:dokumentasi(id)")
    .eq("status", "selesai").order("tanggal", { ascending: false }).limit(100);
  const rows: any[] = data ?? [];
  const sudah = rows.filter((r) => r.dok.length).length;

  const { data: fotoData } = await u.sb.from("dokumentasi").select("path,catatan,sesi:sesi_id(mapel,tanggal)").order("created_at", { ascending: false }).limit(12);
  const foto: any[] = fotoData ?? [];
  const { data: urls } = foto.length ? await u.sb.storage.from("dokumentasi").createSignedUrls(foto.map((f) => f.path), 3600) : { data: [] as any[] };

  return (
    <DataPage active="/admin/absensi" title="Absensi Pengajar" desc="Dokumentasi mengajar yang diunggah pengajar lewat Portal Pengajar."
      stats={[["Sesi Selesai", String(rows.length), "tercatat"], ["Sudah Upload", String(sudah), "sesi"], ["Belum Upload", String(rows.length - sudah), "perlu diingatkan"], ["Total Foto", String(rows.reduce((a, r) => a + r.dok.length, 0)), "dokumentasi"]]}
      columns={["Tanggal", "Pengajar", "Siswa / Kelas", "Mata Pelajaran", "Dokumentasi"]}
      rows={rows.map((r): Cell[] => [tgl(r.tanggal), r.pengajar?.nama ?? "-", r.siswa?.nama ?? "-", r.mapel, r.dok.length ? [`${r.dok.length} foto`, "verified"] : ["Belum upload", "pending"]])}
      extra={foto.length > 0 && (
        <article className="panel" style={{ padding: 20, marginBottom: 20 }}>
          <h3>Dokumentasi terbaru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginTop: 12 }}>
            {foto.map((f, i) => (
              <figure key={f.path} style={{ margin: 0, fontSize: 12 }}>
                {urls?.[i]?.signedUrl && <img src={urls[i].signedUrl!} alt={f.sesi?.mapel} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 14, border: "2px solid #1d2b4f" }} />}
                <figcaption><b>{f.sesi?.mapel}</b> · {f.sesi && tgl(f.sesi.tanggal)}{f.catatan && <><br />{f.catatan}</>}</figcaption>
              </figure>
            ))}
          </div>
        </article>
      )} />
  );
}
