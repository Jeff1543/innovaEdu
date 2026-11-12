import { DataPage, Field, FormPanel, inp, Pesan } from "../_shell";
import type { Cell } from "../_shell";
import { requireRole } from "../../lib/auth";
import { hariIniWIB, rp, tgl } from "../../lib/format";
import { tambahPembayaran, verifikasi } from "../aksi";

export default async function Page({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  const u = await requireRole("admin");
  const { pesan } = await searchParams;
  const [{ data: ps }, { data }] = await Promise.all([
    u.sb.from("profiles").select("id,nama,roles").order("nama"),
    u.sb.from("pembayaran").select("id,tanggal,keterangan,jumlah,status,siswa:profiles!pembayaran_siswa_id_fkey(nama)").order("tanggal", { ascending: false }).limit(100),
  ]);
  const rows: any[] = data ?? [];
  const menunggu = rows.filter((r) => r.status === "menunggu");
  const bulan = rows.filter((r) => r.tanggal.startsWith(hariIniWIB().slice(0, 7)));
  const masuk = bulan.filter((r) => r.status === "terverifikasi").reduce((a, r) => a + r.jumlah, 0);

  return (
    <DataPage active="/admin/pembayaran" title="Pembayaran" desc="Catat dan verifikasi pembayaran siswa."
      stats={[["Pemasukan Bulan Ini", rp(masuk), "terverifikasi"], ["Menunggu Verifikasi", String(menunggu.length), "pembayaran"], ["Transaksi", String(bulan.length), "bulan ini"], ["Rata-rata", rp(bulan.length ? Math.round(bulan.reduce((a, r) => a + r.jumlah, 0) / bulan.length) : 0), "per transaksi"]]}
      columns={["Tanggal", "Siswa", "Keterangan", "Jumlah", "Status"]}
      rows={rows.map((r): Cell[] => [tgl(r.tanggal), r.siswa?.nama ?? "-", r.keterangan ?? "-", rp(r.jumlah), r.status === "terverifikasi" ? ["Terverifikasi", "verified"] : ["Menunggu", "pending"]])}
      extra={<>
        <Pesan text={pesan} />
        <FormPanel title="Catat pembayaran" action={tambahPembayaran}>
          <Field label="Siswa"><select name="siswa" required style={inp}>{(ps ?? []).filter((p: any) => p.roles.includes("siswa")).map((p: any) => <option key={p.id} value={p.id}>{p.nama}</option>)}</select></Field>
          <Field label="Keterangan"><input name="keterangan" placeholder="Matematika - 4 pertemuan" style={{ ...inp, minWidth: 240 }} /></Field>
          <Field label="Jumlah (Rp)"><input name="jumlah" type="number" min="0" required style={inp} /></Field>
        </FormPanel>
        {menunggu.length > 0 && (
          <article className="panel" style={{ padding: 20, marginBottom: 20 }}>
            <h3>Menunggu verifikasi</h3>
            {menunggu.map((r) => (
              <form key={r.id} action={verifikasi.bind(null, r.id)} style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <span>{r.siswa?.nama} · {r.keterangan} · <b>{rp(r.jumlah)}</b></span>
                <button className="primary-button">Verifikasi</button>
              </form>
            ))}
          </article>
        )}
      </>} />
  );
}
