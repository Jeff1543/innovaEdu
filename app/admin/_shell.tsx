import Link from "next/link";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { AdminSidebar } from "./_sidebar";

export function AdminShell({ active, title, children }: { active: string; title: string; children: ReactNode }) {
  return (
    <main className="dashboard-layout">
      <AdminSidebar active={active} />
      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><Link href="/admin">Dashboard</Link><span>/</span><strong>{title}</strong></div>
          <div className="topbar-right"><div className="topbar-user">
            <div className="avatar admin-avatar">A</div>
            <div className="profile-info"><strong>Administrator</strong><span>Owner</span></div>
          </div></div>
        </header>
        <div className="page-container">{children}</div>
      </section>
    </main>
  );
}

export type Cell = string | [string, string];
type Props = {
  active: string; title: string; desc: string; action?: string;
  stats: [string, string, string][]; columns: string[]; rows: Cell[][]; extra?: ReactNode;
};

/* Halaman tabel generik: judul + 4 kartu statistik + tabel. Data masih contoh. */
export function DataPage({ active, title, desc, action, stats, columns, rows, extra }: Props) {
  return (
    <AdminShell active={active} title={title}>
      <section className="welcome-section">
        <div><p className="eyebrow">INNOVAEDU ADMIN</p><h1>{title}</h1><p className="welcome-description">{desc}</p></div>
        {action && <button className="primary-button"><Plus size={18} />{action}</button>}
      </section>
      <section className="stats-grid">
        {stats.map(([t, v, n]) => (
          <article className="stat-card" key={t}><p className="stat-title">{t}</p><h2>{v}</h2><div className="stat-footer">{n}</div></article>
        ))}
      </section>
      {extra}
      <article className="panel">
        <div className="panel-header"><div><h3>{title}</h3><p>Data ditampilkan sebagai contoh.</p></div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr>{columns.map((c) => <th key={c}>{c.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>
                      {typeof c === "string" ? c : <span className={c[1] === "verified" || c[1] === "pending" ? `status-badge ${c[1]}` : `type-badge ${c[1]}`}>{c[0]}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </AdminShell>
  );
}

export const inp = { border: "2px solid #1d2b4f", borderRadius: 12, padding: "8px 10px", background: "#fff8ec", font: "inherit", minWidth: 120 } as const;
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>{label}{children}</label>
);
export const Pesan = ({ text }: { text?: string }) =>
  text ? <p className="panel" style={{ padding: "10px 16px", marginBottom: 16, fontWeight: 700 }}>{text}</p> : null;
export function FormPanel({ title, action, children }: { title: string; action: (f: FormData) => void | Promise<void>; children: ReactNode }) {
  return (
    <article className="panel" style={{ padding: 20, marginBottom: 20 }}>
      <h3>{title}</h3>
      <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end", marginTop: 12 }}>
        {children}<button className="primary-button">Simpan</button>
      </form>
    </article>
  );
}
