import { DataPage, Field, FormPanel, inp, Pesan } from "../_shell";
import { requireRole } from "../../lib/auth";
import { buatAkun } from "../aksi";

export default async function Page({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  const u = await requireRole("admin");
  const { pesan } = await searchParams;
  const { data } = await u.sb.from("profiles").select("nama,email,roles").order("nama");
  const akun: any[] = data ?? [];
  const n = (r: string) => String(akun.filter((a) => a.roles.includes(r)).length);

  return (
    <DataPage active="/admin/akun" title="Akun & Role" desc="Daftarkan pengajar dan siswa. Siswa hanya bisa login kalau emailnya sudah terdaftar di sini. Akun admin tidak dibuat dari sini (lewat Supabase)."
      stats={[["Total Akun", String(akun.length), "terdaftar"], ["Admin", n("admin"), "akun"], ["Pengajar", n("pengajar"), "akun"], ["Siswa", n("siswa"), "akun"]]}
      columns={["Nama", "Email", "Role"]}
      rows={akun.map((a) => [a.nama, a.email, a.roles.join(", ")])}
      extra={<>
        <Pesan text={pesan} />
        <FormPanel title="Tambah akun" action={buatAkun}>
          <Field label="Nama"><input name="nama" required style={inp} /></Field>
          <Field label="Email"><input name="email" type="email" required style={inp} /></Field>
          <Field label="Password (min. 8)"><input name="password" type="password" minLength={8} required style={inp} /></Field>
          <Field label="Role">
            <select name="role" style={inp}><option value="siswa">Siswa</option><option value="pengajar">Pengajar</option></select>
          </Field>
        </FormPanel>
      </>} />
  );
}
