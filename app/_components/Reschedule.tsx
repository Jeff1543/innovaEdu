"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ajukanReschedule, tanggapi } from "../aksi";

export type Req = { id: number; mapel: string; dari: string; ke: string; alasan: string };

export function GantiJadwal({ sesiId }: { sesiId: number }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await ajukanReschedule(sesiId, String(f.get("tgl")), String(f.get("mulai")), String(f.get("selesai")), String(f.get("alasan")));
    setMsg(r === "ok" ? "Permintaan terkirim, menunggu jawaban." : r);
    if (r === "ok") setOpen(false);
  }
  const box = { border: "2px solid var(--ink)", borderRadius: 12, padding: "8px 10px", background: "var(--bg)" } as const;
  return (
    <>
      <button className="wr-btn sm wh" onClick={() => setOpen(!open)}>Ganti jadwal</button>
      {msg && <small style={{ display: "block", marginTop: 6 }}>{msg}</small>}
      {open && (
        <form onSubmit={kirim} className="pt-up" style={{ marginTop: 8, padding: 14, minWidth: 250 }}>
          <input name="tgl" type="date" required style={box} />
          <div style={{ display: "flex", gap: 6 }}><input name="mulai" type="time" required style={box} /><input name="selesai" type="time" required style={box} /></div>
          <input name="alasan" placeholder="Alasan" style={box} />
          <button className="wr-btn sm">Kirim permintaan</button>
        </form>
      )}
    </>
  );
}

export function Permintaan({ items }: { items: Req[] }) {
  const [msg, setMsg] = useState("");
  const jawab = async (id: number, ya: boolean) => { const r = await tanggapi(id, ya); setMsg(r === "ok" ? "" : r); };
  return (
    <div className="pt-up" style={{ maxWidth: "none", marginBottom: 24 }}>
      <h3>Permintaan ganti jadwal</h3>
      {items.map((r) => (
        <div key={r.id} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <span><b>{r.mapel}</b>: {r.dari} → <b>{r.ke}</b>{r.alasan && ` · ${r.alasan}`}</span>
          <span style={{ display: "flex", gap: 8 }}>
            <button className="wr-btn sm" onClick={() => jawab(r.id, true)}>Setuju</button>
            <button className="wr-btn sm wh" onClick={() => jawab(r.id, false)}>Tolak</button>
          </span>
        </div>
      ))}
      {msg && <small>{msg}</small>}
    </div>
  );
}
