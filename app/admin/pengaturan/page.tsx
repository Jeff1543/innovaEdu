import { AdminShell, Field, Pesan, inp } from "../_shell";
import { requireRole } from "../../lib/auth";
import { ambilPengaturan } from "../../lib/pengaturan";
import { simpanPengaturan } from "../aksi";

export default async function Page({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  await requireRole("admin");
  const { pesan } = await searchParams;
  const c = await ambilPengaturan();
  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginTop: 12 } as const;
  const wide = { ...inp, width: "100%" };

  return (
    <AdminShell active="/admin/pengaturan" title="Pengaturan">
      <section className="welcome-section">
        <div><p className="eyebrow">INNOVAEDU ADMIN</p><h1>Pengaturan</h1><p className="welcome-description">Profil bimbel, aturan jadwal, dan pengingat. Kontak otomatis tampil di footer halaman publik.</p></div>
      </section>
      <Pesan text={pesan} />
      <form action={simpanPengaturan}>
        <article className="panel" style={{ padding: 24, marginBottom: 20 }}>
          <h3>Profil &amp; kontak bimbel</h3>
          <div style={grid}>
            <Field label="Nama bimbel"><input name="nama" defaultValue={c.nama} required style={wide} /></Field>
            <Field label="No. WhatsApp"><input name="whatsapp" defaultValue={c.whatsapp} required style={wide} /></Field>
            <Field label="Email"><input name="email" type="email" defaultValue={c.email} required style={wide} /></Field>
            <Field label="Jam operasional"><input name="jam" defaultValue={c.jam} style={wide} /></Field>
            <Field label="Alamat"><input name="alamat" defaultValue={c.alamat} style={wide} /></Field>
          </div>
        </article>
        <article className="panel" style={{ padding: 24, marginBottom: 20 }}>
          <h3>Aturan ganti jadwal</h3>
          <div style={grid}>
            <Field label="Batas pengajuan (jam sebelum sesi)"><input name="batas_ajukan_jam" type="number" min="0" max="168" defaultValue={c.batas_ajukan_jam} style={wide} /></Field>
            <Field label="Maks. pengajuan per orang per bulan"><input name="maks_reschedule" type="number" min="0" max="30" defaultValue={c.maks_reschedule} style={wide} /></Field>
          </div>
        </article>
        <article className="panel" style={{ padding: 24, marginBottom: 20 }}>
          <h3>Pengingat email</h3>
          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12, fontWeight: 700 }}>
            <input name="reminder_aktif" type="checkbox" defaultChecked={c.reminder_aktif} /> Kirim pengingat H-1 ke siswa dan pengajar
          </label>
        </article>
        <button className="primary-button">Simpan Pengaturan</button>
      </form>
    </AdminShell>
  );
}
