import { AdminShell, Pesan, inp } from "../_shell";
import { requireRole } from "../../lib/auth";
import { tgl } from "../../lib/format";
import { jadikanSiswa, ubahStatusDaftar } from "../aksi";

const label: Record<string, string> = { baru: "Baru", dihubungi: "Sudah dihubungi", trial: "Ikut trial", jadi_siswa: "Jadi siswa", batal: "Batal" };
const wa = (hp: string) => `https://wa.me/${hp.replace(/\D/g, "").replace(/^0/, "62")}`;

export default async function Page({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  const u = await requireRole("admin");
  const { pesan } = await searchParams;
  const { data } = await u.sb.from("pendaftaran").select("*").order("dibuat", { ascending: false }).limit(100);
  const rows: any[] = data ?? [];
  const n = (s: string) => String(rows.filter((r) => r.status === s).length);

  return (
    <AdminShell active="/admin/pendaftaran" title="Pendaftaran">
      <section className="welcome-section">
        <div>
          <p className="eyebrow">INNOVAEDU ADMIN</p><h1>Pendaftaran Trial</h1>
          <p className="welcome-description">Calon siswa yang mengisi formulir di halaman depan. Hubungi lewat WhatsApp, lalu jadikan siswa setelah resmi bergabung.</p>
        </div>
      </section>
      <section className="stats-grid">
        {[["Baru", n("baru"), "belum dihubungi"], ["Sudah dihubungi", n("dihubungi"), "menunggu trial"], ["Ikut trial", n("trial"), "belum memutuskan"], ["Jadi siswa", n("jadi_siswa"), "total"]].map(([t, v, c]) => (
          <article className="stat-card" key={t}><p className="stat-title">{t}</p><h2>{v}</h2><div className="stat-footer">{c}</div></article>
        ))}
      </section>
      <Pesan text={pesan} />
      <article className="panel">
        <div className="panel-header"><div><h3>Daftar pendaftar</h3><p>Terbaru di atas. Menampilkan 100 data terakhir.</p></div></div>
        <div className="table-wrapper">
          <table style={{ minWidth: 900 }}>
            <thead><tr>{["Tanggal", "Siswa", "Kelas", "Orang tua", "Catatan", "Status", "Tindak lanjut"].map((c) => <th key={c}>{c.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{tgl(String(r.dibuat).slice(0, 10))}</td>
                  <td><strong>{r.nama}</strong><span className="table-subtitle">{r.program} · {r.mapel}</span></td>
                  <td>{r.jenjang} · {r.kelas}</td>
                  <td>{r.orang_tua}<br /><a className="text-link" href={wa(r.hp)} target="_blank" rel="noreferrer">{r.hp}</a>{r.email && <span className="table-subtitle">{r.email}</span>}</td>
                  <td style={{ maxWidth: 200 }}>{r.catatan ?? "-"}</td>
                  <td><span className={r.status === "batal" ? "type-badge orange" : `status-badge ${r.status === "jadi_siswa" ? "verified" : "pending"}`}>{label[r.status]}</span></td>
                  <td>
                    {r.status !== "jadi_siswa" && (
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {r.status === "baru" && <form action={ubahStatusDaftar.bind(null, r.id, "dihubungi")}><button className="modal-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>Sudah dihubungi</button></form>}
                          {r.status !== "trial" && r.status !== "batal" && <form action={ubahStatusDaftar.bind(null, r.id, "trial")}><button className="modal-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>Ikut trial</button></form>}
                          {r.status !== "batal" && <form action={ubahStatusDaftar.bind(null, r.id, "batal")}><button className="modal-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>Batal</button></form>}
                          {r.status === "batal" && <form action={ubahStatusDaftar.bind(null, r.id, "baru")}><button className="modal-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>Buka lagi</button></form>}
                        </div>
                        {r.status !== "batal" && (
                          <form action={jadikanSiswa.bind(null, r.id)} style={{ display: "flex", gap: 6 }}>
                            <input name="email" type="email" required defaultValue={r.email ?? ""} placeholder="Email untuk login" style={{ ...inp, minWidth: 0, width: 170, padding: "5px 10px", fontSize: 12 }} />
                            <button className="primary-button" style={{ padding: "5px 12px", fontSize: 12 }}>Jadikan siswa</button>
                          </form>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7}><div className="student-empty"><strong>Belum ada pendaftar</strong><span>Pendaftaran dari formulir di halaman depan akan muncul di sini.</span></div></td></tr>}
            </tbody>
          </table>
        </div>
      </article>
    </AdminShell>
  );
}
