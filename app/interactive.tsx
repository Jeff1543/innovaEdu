"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { daftarTrial } from "./daftar";
import {
  Calculator,
  Check,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Languages,
  Menu,
  NotebookPen,
  X,
} from "lucide-react";

const links = [
  { label: "Keunggulan", href: "#keunggulan" },
  { label: "Program", href: "#program" },
  { label: "Biaya", href: "#biaya" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="wr-nav">
      <div className="wr-w">
        <div className="wr-pill">
          <a href="#top" className="wr-logo">
            <i><GraduationCap size={20} /></i>InnovaEdu
          </a>
          <nav className="wr-links" aria-label="Navigasi utama">
            {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          </nav>
          <a href="/login" className="wr-btn sm wh">Masuk</a>
          <a href="#daftar" className="wr-btn sm">Daftar Trial</a>
          <button className="wr-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="wr-mob">
            {[...links, { label: "Daftar Trial Gratis", href: "#daftar" }, { label: "Masuk", href: "/login" }].map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

const programs = [
  { id: "mtk", tab: "Matematika", tone: "wr-c", Icon: Calculator, level: "SD Kelas 1–6 · SMP Kelas 7–9",
    title: "Matematika tanpa takut", text: "Konsep dijelaskan pelan-pelan dengan contoh sehari-hari, lalu diperkuat latihan soal bertahap.",
    stats: [["Maks. 6", "siswa per kelompok"], ["90 mnt", "per pertemuan"], ["2–5×", "per minggu"]],
    perks: ["Latihan soal bertingkat", "Pendampingan PR sekolah", "Persiapan ulangan dan ujian"] },
  { id: "ing", tab: "Bahasa Inggris", tone: "wr-s", Icon: Languages, level: "SD Kelas 1–6 · SMP Kelas 7–9",
    title: "Berani bicara English", text: "Vocabulary, grammar, dan percakapan dengan cara yang aktif, bukan sekadar menghafal.",
    stats: [["Maks. 6", "siswa per kelompok"], ["90 mnt", "per pertemuan"], ["2–5×", "per minggu"]],
    perks: ["Speaking practice tiap sesi", "Kosakata sesuai materi sekolah", "Latihan listening dan reading"] },
  { id: "ipa", tab: "IPA", tone: "wr-m", Icon: FlaskConical, level: "SD Kelas 4–6 · SMP Kelas 7–9",
    title: "IPA yang bikin penasaran", text: "Belajar sains lewat pertanyaan “kenapa” dan contoh dari sekitar, supaya konsep lebih nempel.",
    stats: [["Maks. 6", "siswa per kelompok"], ["90 mnt", "per pertemuan"], ["2–5×", "per minggu"]],
    perks: ["Penjelasan visual dan ringkas", "Latihan soal HOTS", "Rangkuman per bab"] },
  { id: "pr", tab: "PR & Ujian", tone: "wr-l", Icon: NotebookPen, level: "SD & SMP, semua mata pelajaran",
    title: "Teman belajar PR dan ujian", text: "Bimbingan fleksibel untuk mengerjakan PR, mengulang materi, dan menyiapkan ujian sekolah.",
    stats: [["1:1", "opsi privat"], ["90 mnt", "per pertemuan"], ["Fleksibel", "atur jadwal"]],
    perks: ["Fokus pada kebutuhan siswa", "Bisa privat atau kelompok", "Progres dilaporkan ke orang tua"] },
];

export function ProgramTabs() {
  const [id, setId] = useState(programs[0].id);
  const p = programs.find((x) => x.id === id)!;
  return (
    <>
      <div className="wr-tabs" role="tablist">
        {programs.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === id} className="wr-tab" onClick={() => setId(x.id)}>{x.tab}</button>
        ))}
      </div>
      <div className="wr-panel" role="tabpanel">
        {/* GANTI dengan foto kelas: <Image src="/foto/kelas.jpg" ... /> */}
        <div className={`wr-vis ${p.tone}`}><p.Icon strokeWidth={1.5} /></div>
        <div className="wr-info">
          <small>{p.level}</small>
          <h3>{p.title}</h3>
          <p>{p.text}</p>
          <div className="wr-stats">
            {p.stats.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
          </div>
          <ul className="wr-list">
            {p.perks.map((t) => <li key={t}><Check size={18} />{t}</li>)}
          </ul>
          <div><a href="#daftar" className="wr-btn">Coba kelas trial</a></div>
        </div>
      </div>
    </>
  );
}

const plans = [
  { name: "Kelompok SD", desc: "Kelas 1–6, maksimal 6 siswa", per: 50000, hot: false,
    perks: ["Pilih 1–3 mata pelajaran", "Laporan perkembangan bulanan", "Jadwal tetap tiap minggu"] },
  { name: "Privat", desc: "SD & SMP, 1 pengajar 1 siswa", per: 100000, hot: true,
    perks: ["Materi disesuaikan kebutuhan", "Jadwal fleksibel", "Laporan setelah tiap pertemuan"] },
  { name: "Kelompok SMP", desc: "Kelas 7–9, maksimal 6 siswa", per: 60000, hot: false,
    perks: ["Pilih 1–3 mata pelajaran", "Latihan soal ujian", "Laporan perkembangan bulanan"] },
];
const rp = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

export function Pricing() {
  const [monthly, setMonthly] = useState(false);
  return (
    <>
      <div className="wr-switch">
        <button aria-pressed={!monthly} onClick={() => setMonthly(false)}>Per pertemuan</button>
        <button aria-pressed={monthly} onClick={() => setMonthly(true)}>Per bulan</button>
      </div>
      <div className="wr-grid">
        {plans.map((p) => (
          <article key={p.name} className={`wr-card${p.hot ? " hot" : ""}`}>
            {p.hot && <span className="wr-badge">Paling diminati</span>}
            <h3>{p.name}</h3>
            <p>{p.desc}</p>
            <div className="wr-price">
              {rp(monthly ? p.per * 8 * 0.9 : p.per)} <small>{monthly ? "/ bulan" : "/ pertemuan"}</small>
            </div>
            <ul className="wr-list">{p.perks.map((t) => <li key={t}><Check size={18} />{t}</li>)}</ul>
            <a href="#daftar" className={`wr-btn ${p.hot ? "ink" : "wh"}`}>Daftar trial</a>
          </article>
        ))}
      </div>
      <p className="wr-note">Harga contoh. Paket bulanan = 8 pertemuan dengan diskon 10%. Sesuaikan dengan tarif InnovaEdu.</p>
    </>
  );
}

export function RegisterForm() {
  const [level, setLevel] = useState("SD");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const grades = level === "SD" ? [1, 2, 3, 4, 5, 6] : [7, 8, 9];

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setSending(true); setError("");
    const hasil = await daftarTrial(data).catch(() => "Koneksi bermasalah. Silakan coba lagi.");
    setSending(false);
    if (hasil !== "ok") return setError(hasil);
    setDone(String(data.name));
  }

  if (done)
    return (
      <div className="wr-done">
        <CheckCircle2 size={52} color="#2a9d6f" />
        <h3>Terima kasih!</h3>
        <p>Pendaftaran trial untuk {done} sudah kami terima. Tim InnovaEdu akan menghubungi lewat WhatsApp.</p>
        <button className="wr-btn" onClick={() => setDone(null)}>Daftarkan siswa lain</button>
      </div>
    );

  return (
    <form className="wr-form" onSubmit={submit}>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
      <label className="full">Nama siswa *<input name="name" required /></label>
      <label>Jenjang *
        <select name="level" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>SD</option><option>SMP</option>
        </select>
      </label>
      <label>Kelas *
        <select name="grade" key={level}>{grades.map((g) => <option key={g}>Kelas {g}</option>)}</select>
      </label>
      <label>Program *
        <select name="program"><option>Kelompok</option><option>Privat</option></select>
      </label>
      <label>Mata pelajaran *
        <select name="subject"><option>Matematika</option><option>Bahasa Inggris</option><option>IPA</option><option>PR & Ujian</option></select>
      </label>
      <label>Nama orang tua *<input name="parent" required /></label>
      <label>No. WhatsApp *<input name="phone" type="tel" required /></label>
      <label className="full">Email<input name="email" type="email" /></label>
      <label className="full">Catatan<textarea name="note" rows={3} placeholder="Kesulitan belajar atau jadwal yang diinginkan" /></label>
      {error && <p className="full" style={{ color: "#c0392b", fontWeight: 700 }}>{error}</p>}
      <button className="wr-btn full" type="submit" disabled={sending}>{sending ? "Mengirim…" : "Daftar trial gratis"}</button>
    </form>
  );
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const tones = ["wr-c", "wr-m", "wr-s", "wr-l"];
const STACK_TOP = 110;
const STACK_GAP = 18;

/* Kartu menumpuk saat discroll: tiap kartu sticky, kartu di bawahnya mengecil saat tertimpa */
export function StackCards({ items }: { items: { n: string; t: string; d: string; c: string[] }[] }) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      refs.current.forEach((el, i) => {
        const next = refs.current[i + 1];
        if (!el || !next) return;
        const d = next.getBoundingClientRect().top - (STACK_TOP + (i + 1) * STACK_GAP);
        el.style.transform = `scale(${1 - 0.06 * clamp(1 - d / el.offsetHeight)})`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="wr-stack">
      {items.map((p, i) => (
        <article key={p.n} ref={(el) => { refs.current[i] = el; }} className="wr-scard" style={{ top: STACK_TOP + i * STACK_GAP }}>
          <div>
            <span className="wr-num">{p.n}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
            <div className="wr-chips">{p.c.map((c) => <span key={c}>{c}</span>)}</div>
          </div>
          {/* GANTI dengan foto: <Image src="/foto/..." /> */}
          <div className={`wr-st-vis ${tones[i % 4]}`}>{p.n}</div>
        </article>
      ))}
    </div>
  );
}

const day = [
  ["14.30", "Sapaan hangat", "Siswa disambut, ditanya kabarnya, lalu mulai dengan suasana santai."],
  ["15.00", "Materi inti", "Konsep dijelaskan bertahap dengan contoh yang dekat dengan keseharian."],
  ["15.45", "Latihan bersama", "Mengerjakan soal bareng pengajar. Salah itu tidak apa-apa."],
  ["16.15", "Tanya jawab", "Waktu khusus untuk semua pertanyaan “kenapa” dan “bagaimana”."],
  ["16.45", "Evaluasi mini", "Kuis singkat untuk memastikan materi hari ini sudah nempel."],
];

/* Scroll vertikal menggeser track ke samping (pinned). Di mobile jadi swipe biasa. */
export function DayScroll() {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width:860px), (prefers-reduced-motion: reduce)");
    let raf = 0;
    const update = () => {
      raf = 0;
      const o = outer.current, t = track.current;
      if (!o || !t) return;
      if (mq.matches) { t.style.transform = ""; return; }
      const r = o.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - window.innerHeight));
      t.style.transform = `translateX(${-p * Math.max(0, t.offsetWidth - window.innerWidth)}px)`;
      if (bar.current) bar.current.style.width = `${p * 100}%`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section ref={outer} className="wr-day" id="sehari">
      <div className="wr-day-pin">
        <div className="wr-w">
          <div className="wr-head">
            <span className="wr-tag">Sehari di InnovaEdu</span>
            <h2>Dari sapaan hangat sampai laporan pulang.</h2>
            <p>Setiap sesi punya ritme yang jelas, jadi siswa selalu tahu apa yang akan terjadi berikutnya.</p>
            <small className="wr-hint"><span className="d">Terus scroll</span><span className="m">Geser</span> untuk mengikuti harinya</small>
            <div className="wr-bar"><span ref={bar} /></div>
          </div>
        </div>
        <div className="wr-day-track" ref={track}>
          {day.map(([t, h, d], i) => (
            <article key={t} className="wr-dcard">
              <span className={`wr-time ${tones[i % 4]}`}>{t}</span>
              <h3>{h}</h3>
              <p>{d}</p>
            </article>
          ))}
          <article className="wr-dcard wr-report">
            <span className="wr-time wr-y" style={{ background: "#fff" }}>17.00</span>
            <h3>Laporan pulang</h3>
            <dl>
              <dt>Siswa</dt><dd>Andi P. (contoh)</dd>
              <dt>Kehadiran</dt><dd>Hadir</dd>
              <dt>Materi</dt><dd>Pecahan</dd>
              <dt>Catatan</dt><dd>Aktif bertanya</dd>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
