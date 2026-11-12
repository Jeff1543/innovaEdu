"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { GraduationCap, UploadCloud } from "lucide-react";

import { GantiJadwal, Permintaan } from "../_components/Reschedule";
import type { Req } from "../_components/Reschedule";
import { useRouter } from "next/navigation";
import { selesaikan } from "../aksi";
import { supabaseBrowser } from "../lib/supabase/client";

type Sesi = { id: number; tgl: string; jam: string; siswa: string; mapel: string; lokasi: string; fee: number; selesai: boolean; bisaSelesai: boolean; docs: string[] };

const rp = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

export default function Portal({ sesi, riwayat, permintaan, nama, bulan }: { sesi: Sesi[]; riwayat: string[][]; permintaan: Req[]; nama: string; bulan: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const rows = sesi;
  const [tab, setTab] = useState("jadwal");
  const [sel, setSel] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const selesai = rows.filter((r) => r.selesai);
  const belum = selesai.filter((r) => !r.docs.length);
  const pendapatan = selesai.reduce((a, r) => a + r.fee, 0);

  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const note = String(new FormData(form).get("note") ?? "");
    if (!sel || !files.length) return;
    if (files.some((f) => f.size > 5 * 1024 * 1024)) return setMsg("Ukuran tiap foto maksimal 5 MB.");
    setMsg("Mengunggah…");
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    for (const [i, f] of files.entries()) {
      const path = `${user!.id}/${sel}/${Date.now()}-${i}-${f.name.replace(/[^\w.-]/g, "_")}`;
      const up = await sb.storage.from("dokumentasi").upload(path, f);
      if (up.error) return setMsg(up.error.message);
      const ins = await sb.from("dokumentasi").insert({ sesi_id: Number(sel), diunggah_oleh: user!.id, path, catatan: note });
      if (ins.error) return setMsg(ins.error.message);
    }
    form.reset(); setFiles([]); setSel(""); setMsg("Dokumentasi terunggah."); router.refresh();
  }

  return (
    <div className="wr">
      <header className="wr-nav"><div className="wr-w"><div className="wr-pill">
        <Link href="/" className="wr-logo"><i><GraduationCap size={20} /></i>InnovaEdu <small style={{ fontSize: 14, color: "var(--mut)" }}>Portal Pengajar</small></Link>
        <Link href="/" className="wr-btn sm wh">Ke beranda</Link>
      </div></div></header>

      <main className="wr-w" style={{ padding: "48px 0 80px" }}>
        <span className="wr-tag">Portal Pengajar</span>
        <h1 style={{ fontSize: "clamp(36px,5vw,60px)" }}>Halo, {nama}.</h1>
        <p className="wr-lead" style={{ margin: "12px 0 0" }}>Ringkasan mengajar bulan {bulan}.</p>

        <div className="pt-stats">
          {[[rp(pendapatan), "Pendapatan bulan ini", "wr-y"], [String(selesai.length), "Pertemuan selesai", "wr-m"], [String(new Set(rows.map((r) => r.siswa)).size), "Siswa / kelas diajar", "wr-s"], [String(belum.length), "Dokumentasi belum diupload", "wr-c"]].map(([v, l, c]) => (
            <div key={l} className={`wr-card ${c}`}><b>{v}</b><span style={{ color: "var(--ink)" }}>{l}</span></div>
          ))}
        </div>

        {permintaan.length > 0 && <Permintaan items={permintaan} />}

        <div className="wr-tabs" role="tablist">
          {[["jadwal", "Jadwal mengajar"], ["pendapatan", "Pendapatan"], ["dok", "Dokumentasi"]].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className="wr-tab" onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "jadwal" && (
          <div className="pt-table-wrap"><table className="pt-table">
            <thead><tr>{["Tanggal", "Jam", "Siswa / kelas", "Mapel", "Lokasi", "Honor", "Status", "Aksi"].map((h) => <th key={h}>{h.toUpperCase()}</th>)}</tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id}><td>{r.tgl}</td><td>{r.jam}</td><td><b>{r.siswa}</b></td><td>{r.mapel}</td><td>{r.lokasi}</td><td>{rp(r.fee)}</td>
                <td><span className={`pt-pill ${r.selesai ? "pt-ok" : "pt-soon"}`}>{r.selesai ? "Selesai" : "Akan datang"}</span></td><td>{!r.selesai && <GantiJadwal sesiId={r.id} />}{r.bisaSelesai && <button className="wr-btn sm wh" onClick={() => selesaikan(r.id)}>Tandai selesai</button>}</td></tr>
            ))}</tbody>
          </table></div>
        )}

        {tab === "pendapatan" && (
          <div className="pt-table-wrap"><table className="pt-table">
            <thead><tr>{["Bulan", "Pertemuan", "Total honor", "Status"].map((h) => <th key={h}>{h.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              <tr><td><b>{bulan}</b></td><td>{selesai.length} (berjalan)</td><td><b>{rp(pendapatan)}</b></td><td><span className="pt-pill pt-wait">Berjalan</span></td></tr>
              {riwayat.map(([b, p, t, s]) => <tr key={b}><td>{b}</td><td>{p}</td><td>{t}</td><td><span className="pt-pill pt-ok">{s}</span></td></tr>)}
            </tbody>
          </table></div>
        )}

        {tab === "dok" && (
          <>
            <form className="pt-up" onSubmit={upload}>
              <label>Sesi yang didokumentasikan
                <select value={sel} onChange={(e) => setSel(e.target.value)} required>
                  <option value="">Pilih sesi…</option>
                  {selesai.map((r) => <option key={r.id} value={r.id}>{r.tgl} · {r.siswa} · {r.mapel}</option>)}
                </select>
              </label>
              <label className="pt-drop">
                <UploadCloud size={30} />
                <span>{files.length ? `${files.length} foto dipilih` : "Klik untuk pilih foto kegiatan"}</span>
                <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
              </label>
              <label>Catatan<textarea name="note" rows={3} placeholder="Materi yang dibahas, perkembangan siswa" /></label>
              <button className="wr-btn" type="submit">Upload dokumentasi</button>
              {msg && <small style={{ fontWeight: 700 }}>{msg}</small>}
            </form>
            <div className="pt-docs">
              {rows.filter((r) => r.docs.length).map((r) => (
                <div key={r.id} className="pt-doc"><b>{r.tgl} · {r.siswa}</b>
                  <div>{r.docs.map((u) => <img key={u} src={u} alt={`Dokumentasi ${r.siswa}`} />)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
