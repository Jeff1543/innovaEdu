import Link from "next/link";
import { GraduationCap } from "lucide-react";

import "../beranda.css";
import "../portal/portal.css";
import { requireRole } from "../lib/auth";
import { jam, permintaanMasuk, tgl } from "../lib/format";
import { GantiJadwal, Permintaan } from "../_components/Reschedule";

export default async function Murid() {
  const u = await requireRole("siswa");
  const { data } = await u.sb.from("sesi")
    .select("id,tanggal,jam_mulai,jam_selesai,mapel,lokasi,status,pengajar:profiles!sesi_pengajar_id_fkey(nama)")
    .eq("siswa_id", u.id).neq("status", "dibatalkan").order("tanggal").order("jam_mulai");
  const rows: any[] = data ?? [];
  const permintaan = await permintaanMasuk(u.sb, u.id);

  return (
    <div className="wr">
      <header className="wr-nav"><div className="wr-w"><div className="wr-pill">
        <Link href="/" className="wr-logo"><i><GraduationCap size={20} /></i>InnovaEdu</Link>
      </div></div></header>
      <main className="wr-w" style={{ padding: "48px 0 80px" }}>
        <span className="wr-tag">Portal Siswa</span>
        <h1 style={{ fontSize: "clamp(36px,5vw,60px)", margin: "12px 0 28px" }}>Halo, {u.nama}.</h1>
        {permintaan.length > 0 && <Permintaan items={permintaan} />}
        <div className="pt-table-wrap"><table className="pt-table">
          <thead><tr>{["Tanggal", "Jam", "Mapel", "Pengajar", "Lokasi", "Status", "Aksi"].map((h) => <th key={h}>{h.toUpperCase()}</th>)}</tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}><td>{tgl(r.tanggal)}</td><td>{jam(r.jam_mulai, r.jam_selesai)}</td><td><b>{r.mapel}</b></td><td>{r.pengajar?.nama ?? "-"}</td><td>{r.lokasi ?? "-"}</td>
              <td><span className={`pt-pill ${r.status === "selesai" ? "pt-ok" : "pt-soon"}`}>{r.status === "selesai" ? "Selesai" : "Akan datang"}</span></td>
              <td>{r.status === "terjadwal" && <GantiJadwal sesiId={r.id} />}</td></tr>
          ))}</tbody>
        </table></div>
      </main>
    </div>
  );
}
