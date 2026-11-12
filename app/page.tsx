import type { Metadata } from "next";
import { Calculator, Check, FlaskConical, Languages, NotebookPen } from "lucide-react";

import "./beranda.css";
import { ambilPengaturan } from "./lib/pengaturan";
import { Navbar, ProgramTabs, Pricing, RegisterForm, StackCards, DayScroll } from "./interactive";

export const metadata: Metadata = {
  title: "InnovaEdu | Bimbingan belajar SD & SMP",
  description: "Bimbingan belajar untuk siswa SD dan SMP. Kelas kecil, pengajar berpengalaman, dan laporan perkembangan untuk orang tua. Daftar trial gratis.",
};

const belt = ["Kelas kecil", "Pengajar berpengalaman", "Jadwal fleksibel", "Laporan untuk orang tua", "Privat & kelompok", "SD dan SMP"];

const promises = [
  { n: "01", t: "Pengajar yang kenal anakmu", d: "Pengajar berpengalaman yang memahami cara belajar tiap siswa, bukan sekadar mengejar materi.", c: ["Berpengalaman", "Sabar & komunikatif"] },
  { n: "02", t: "Kelas kecil, perhatian nyata", d: "Maksimal enam siswa per kelompok, atau pilih privat satu lawan satu supaya tidak ada yang tertinggal.", c: ["Maks. 6 siswa", "Opsi privat"] },
  { n: "03", t: "Jadwal yang ramah keluarga", d: "Pilih hari dan jam yang cocok. Absensi dan jadwal tercatat rapi sehingga mudah dipantau.", c: ["Jadwal fleksibel", "Absensi tercatat"] },
  { n: "04", t: "Orang tua selalu tahu progres", d: "Laporan perkembangan dikirim berkala: kehadiran, materi yang dipelajari, dan catatan pengajar.", c: ["Laporan rutin", "Transparan"] },
];

const faqs = [
  ["Jenjang apa saja yang dilayani?", "InnovaEdu melayani siswa SD (kelas 1–6) dan SMP (kelas 7–9) untuk mata pelajaran utama."],
  ["Apa bedanya kelas privat dan kelompok?", "Privat berarti satu pengajar untuk satu siswa dengan jadwal fleksibel. Kelompok berisi maksimal enam siswa dengan jadwal tetap dan biaya lebih terjangkau."],
  ["Apakah ada kelas trial?", "Ada. Daftarkan anak lewat formulir di bawah, lalu tim kami akan menghubungi untuk mengatur jadwal trial."],
  ["Bagaimana cara pembayaran?", "Pembayaran dilakukan per pertemuan atau per bulan, lalu diverifikasi oleh admin kami."],
  ["Bagaimana saya tahu perkembangan anak?", "Kehadiran dan catatan belajar dicatat setiap pertemuan, dan ringkasannya dibagikan kepada orang tua secara berkala."],
];

export default async function Beranda() {
  const cfg = await ambilPengaturan();
  const tiles = [
    { t: "Matematika", I: Calculator, c: "wr-c" }, { t: "English", I: Languages, c: "wr-s" },
    { t: "IPA", I: FlaskConical, c: "wr-m" }, { t: "PR & Ujian", I: NotebookPen, c: "wr-l" },
  ];
  return (
    <div className="wr" id="top">
      <Navbar />

      <main>
        <section className="wr-w wr-hero">
          <div>
            <span className="wr-tag">Pendaftaran dibuka · SD & SMP</span>
            <h1>Belajar jadi <span className="wr-mark">seru</span>, nilai ikut naik.</h1>
            <p className="wr-lead">InnovaEdu adalah bimbingan belajar untuk siswa SD dan SMP. Kelas kecil, pengajar sabar, dan laporan perkembangan yang selalu sampai ke orang tua.</p>
            <div className="wr-row">
              <a href="#daftar" className="wr-btn">Daftar trial gratis</a>
              <a href="#program" className="wr-btn wh">Lihat program</a>
            </div>
            <div className="wr-trust">
              {["Pengajar berpengalaman", "Maks. 6 siswa per kelas", "Jadwal fleksibel"].map((t) => <span key={t}><Check size={18} />{t}</span>)}
            </div>
          </div>
          {/* GANTI tile ini dengan foto siswa/kelas */}
          <div className="wr-collage">
            {tiles.map(({ t, I, c }) => (
              <div key={t} className={`wr-tile ${c}`}>{t}<I strokeWidth={1.5} /></div>
            ))}
          </div>
        </section>

        <div className="wr-belt" aria-hidden="true">
          <div>{[...belt, ...belt].map((b, i) => <span key={i}>✦ {b}</span>)}</div>
        </div>

        <section id="keunggulan" className="wr-sec wr-w">
          <div className="wr-head">
            <span className="wr-tag">Kenapa InnovaEdu</span>
            <h2>Empat janji, ditepati setiap hari.</h2>
            <p>Memilih tempat belajar itu keputusan besar. Ini hal-hal yang tidak kami kompromikan.</p>
          </div>
          <StackCards items={promises} />
        </section>

        <section id="program" className="wr-sec wr-w">
          <div className="wr-head">
            <span className="wr-tag">Program kami</span>
            <h2>Satu program untuk tiap kebutuhan.</h2>
            <p>Pilih mata pelajaran yang ingin diperkuat, lalu lihat detail kelasnya.</p>
          </div>
          <ProgramTabs />
        </section>

        <DayScroll />

        <section id="biaya" className="wr-sec wr-w">
          <div className="wr-head">
            <span className="wr-tag">Biaya</span>
            <h2>Sederhana dan jelas.</h2>
            <p>Tanpa biaya tersembunyi. Pilih paket sesuai kebutuhan belajar anak.</p>
          </div>
          <Pricing />
        </section>

        <section id="faq" className="wr-sec wr-w wr-faq">
          <div className="wr-head">
            <span className="wr-tag">FAQ</span>
            <h2>Pertanyaan yang sering ditanyakan.</h2>
            <p>Hal-hal yang biasanya ingin diketahui orang tua sebelum mendaftar.</p>
          </div>
          <div>
            {faqs.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </section>

        <section id="daftar" className="wr-sec wr-w">
          <div className="wr-reg">
            <div>
              <span className="wr-tag" style={{ color: "#1d2b4f" }}>Trial gratis</span>
              <h2>Yuk, kenalan dulu dengan kelas kami.</h2>
              <p style={{ color: "#c4cde6" }}>Isi formulir, kami hubungi untuk mengatur jadwal trial. Tanpa kewajiban mendaftar.</p>
              <ol className="wr-steps">
                <li><div><b>Isi formulir</b><span>Ceritakan kebutuhan belajar anak.</span></div></li>
                <li><div><b>Kami hubungi</b><span>Admin mengatur jadwal trial lewat WhatsApp.</span></div></li>
                <li><div><b>Ikut kelas trial</b><span>Kenalan dengan pengajar dan suasana kelas.</span></div></li>
              </ol>
            </div>
            <RegisterForm />
          </div>
        </section>
      </main>

      <footer className="wr-w">
        <div className="wr-foot">
          <div>
            <h3>InnovaEdu</h3>
            <p>Bimbingan belajar untuk siswa SD dan SMP. Kelas kecil, pengajar sabar, hasil terasa.</p>
          </div>
          <div>
            <h3>Jelajahi</h3>
            <a href="#keunggulan">Keunggulan</a><a href="#program">Program</a><a href="#biaya">Biaya</a><a href="#faq">FAQ</a>
          </div>
          <div>
            <h3>Hubungi kami</h3>
            <p>{cfg.alamat}</p>
            <p>{cfg.jam}</p>
            <a href={`https://wa.me/${cfg.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}`}>{cfg.whatsapp}</a>
            <a href={`mailto:${cfg.email}`}>{cfg.email}</a>
            <a href="/login">Masuk</a>
          </div>
        </div>
        <div className="wr-copy"><span>© 2026 InnovaEdu. Semua hak dilindungi.</span><span>Dibuat untuk pelajar yang penasaran</span></div>
      </footer>
    </div>
  );
}
