import { DataPage, Field, FormPanel, inp, Pesan } from "../_shell";
import type { Cell } from "../_shell";
import { requireRole } from "../../lib/auth";
import { hariIniWIB, jam, rp, tgl } from "../../lib/format";
import { tambahSesi } from "../aksi";

const tone: Record<string, [string, string]> = { terjadwal: ["Terjadwal", "blue"], selesai: ["Selesai", "verified"], dibatalkan: ["Dibatalkan", "orange"] };

export default async function Page({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  const u = await requireRole("admin");
  const { pesan } = await searchParams;
  const [{ data: ps }, { data }] = await Promise.all([
    u.sb.from("profiles").select("id,nama,roles").order("nama"),
    u.sb.from("sesi").select("id,tanggal,jam_mulai,jam_selesai,mapel,honor,status,pengajar:profiles!sesi_pengajar_id_fkey(nama),siswa:profiles!sesi_siswa_id_fkey(nama)")
      .order("tanggal", { ascending: false }).order("jam_mulai").limit(100),
  ]);
  const sesi: any[] = data ?? [], akun: any[] = ps ?? [];
  const hari = hariIniWIB();
  const opsi = (role: string) => akun.filter((p) => p.roles.includes(role)).map((p) => <option key={p.id} value={p.id}>{p.nama}</option>);

  return (
    <DataPage active="/admin/jadwal" title="Jadwal Belajar" desc="Semua sesi bimbel. Perubahan jadwal dari pengajar/siswa langsung terlihat di sini."
      stats={[["Hari Ini", String(sesi.filter((s) => s.tanggal === hari && s.status === "terjadwal").length), "sesi terjadwal"], ["Terjadwal", String(sesi.filter((s) => s.status === "terjadwal").length), "sesi"], ["Selesai", String(sesi.filter((s) => s.status === "selesai").length), "sesi"], ["Total", String(sesi.length), "sesi tercatat"]]}
      columns={["Tanggal", "Jam", "Mapel", "Siswa", "Pengajar", "Honor", "Status"]}
      rows={sesi.map((r): Cell[] => [tgl(r.tanggal), jam(r.jam_mulai, r.jam_selesai), r.mapel, r.siswa?.nama ?? "-", r.pengajar?.nama ?? "-", rp(r.honor), tone[r.status]])}
      extra={<>
        <Pesan text={pesan} />
        <FormPanel title="Tambah sesi" action={tambahSesi}>
          <Field label="Pengajar"><select name="pengajar" required style={inp}>{opsi("pengajar")}</select></Field>
          <Field label="Siswa"><select name="siswa" required style={inp}>{opsi("siswa")}</select></Field>
          <Field label="Mapel"><input name="mapel" required style={inp} /></Field>
          <Field label="Lokasi"><input name="lokasi" style={inp} /></Field>
          <Field label="Tanggal"><input name="tanggal" type="date" required style={inp} /></Field>
          <Field label="Mulai"><input name="mulai" type="time" required style={inp} /></Field>
          <Field label="Selesai"><input name="selesai" type="time" required style={inp} /></Field>
          <Field label="Honor pengajar (Rp)"><input name="honor" type="number" min="0" style={inp} /></Field>
        </FormPanel>
      </>} />
  );
}
