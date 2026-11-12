import Link from "next/link";
import { muatDashboard } from "./dashboard-data";

import {
  Users,
  GraduationCap,
  CalendarDays,
  ClipboardCheck,
  Wallet,
  Search,
  Bell,
  ChevronDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CreditCard,
  Menu,
} from "lucide-react";
import { AdminSidebar } from "./_sidebar";
import { RangeMenu } from "./RangeMenu";

const RENTANG = [3, 6, 12];

const meta = [
  { icon: Users, color: "blue", href: "/admin/siswa" },
  { icon: GraduationCap, color: "purple", href: "/admin/pengajar" },
  { icon: CalendarDays, color: "orange", href: "/admin/jadwal" },
  { icon: Wallet, color: "green", href: "/admin/pembayaran" },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ bulan?: string }> }) {
  const { bulan } = await searchParams;
  const rentang = RENTANG.includes(Number(bulan)) ? Number(bulan) : 6;
  const d = await muatDashboard(rentang);
  const stats = d.stats.map((s, i) => ({ ...s, ...meta[i] }));
  const { schedules, transactions, chartData } = d;

  return (
    <main className="dashboard-layout">
      <AdminSidebar active="/admin" />

      <section className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <Menu size={23} />
            <strong>InnovaEdu</strong>
          </div>

          <div className="breadcrumb">
            <span>Halaman</span>
            <span>/</span>
            <strong>Dashboard</strong>
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <Search size={17} />
              <input placeholder="Cari sesuatu..." />
              <span>⌘ K</span>
            </div>

            <button className="icon-button" aria-label="Notifikasi">
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            <div className="topbar-user">
              <div className="avatar admin-avatar">A</div>
              <div className="profile-info">
                <strong>Administrator</strong>
                <span>Owner</span>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <div className="page-container">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">{d.tanggal}</p>
              <h1>Selamat {d.sapaan}, {d.nama}! 👋</h1>
              <p className="welcome-description">
                Berikut ringkasan aktivitas bimbingan belajar InnovaEdu hari ini.
              </p>
            </div>

            <Link href="/admin/siswa" className="primary-button">
              <Plus size={18} />
              Tambah Siswa
            </Link>
          </section>

          <section className="stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article className="stat-card" key={stat.title}>
                  <div className="stat-top">
                    <div className={`stat-icon ${stat.color}`}>
                      <Icon size={21} />
                    </div>
                    <Link href={stat.href} className="more-button" aria-label={`Lihat ${stat.title}`}>
                      <ArrowUpRight size={19} />
                    </Link>
                  </div>

                  <p className="stat-title">{stat.title}</p>
                  <h2>{stat.value}</h2>

                  <div className="stat-footer">
                    <span className={stat.positive ? "change-positive" : "change-negative"}>
                      {stat.positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                      {stat.change}
                    </span>
                    <span>{stat.note}</span>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="middle-grid">
            <article className="panel revenue-panel">
              <div className="panel-header">
                <div>
                  <h3>Ringkasan Pendapatan</h3>
                  <p>Perkembangan pendapatan bimbel</p>
                </div>
                <RangeMenu value={rentang} options={RENTANG} />
              </div>

              <div className="revenue-summary">
                <h2>{d.pendapatan}</h2>
                <span className={d.pendapatanNaik ? "change-positive" : "change-negative"}>
                  {d.pendapatanNaik ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {d.pendapatanChange}
                </span>
                <span className="muted-text">dari bulan sebelumnya</span>
              </div>

              <div className="chart">
                <div className="chart-grid">
                  {d.skala.map((t) => <span key={t}>{t}</span>)}
                </div>

                <div className="chart-bars">
                  {chartData.map((item) => (
                    <div className="bar-column" key={item.month}>
                      <div className="bar-track">
                        <div
                          className={`bar ${item.month === d.bulanIni ? "highlight" : ""}`}
                          style={{ height: `${item.value}%` }}
                        />
                      </div>
                      <span>{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="panel quick-panel">
              <div className="panel-header">
                <div>
                  <h3>Ringkasan Aktivitas</h3>
                  <p>Aktivitas operasional hari ini</p>
                </div>
                <Link href="/admin/jadwal" className="text-link">Lihat jadwal</Link>
              </div>

              <div className="quick-list">
                <Link href="/admin/jadwal" className="quick-item">
                  <div className="quick-icon blue">
                    <CalendarDays size={20} />
                  </div>
                  <div className="quick-info">
                    <strong>{d.aktivitas.terjadwal} Pertemuan</strong>
                    <span>Terjadwal hari ini</span>
                  </div>
                  <ArrowUpRight size={17} />
                </Link>

                <Link href="/admin/absensi" className="quick-item">
                  <div className="quick-icon green">
                    <ClipboardCheck size={20} />
                  </div>
                  <div className="quick-info">
                    <strong>{d.aktivitas.selesai} Pertemuan</strong>
                    <span>Sudah terlaksana</span>
                  </div>
                  <ArrowUpRight size={17} />
                </Link>

                <Link href="/admin/pembayaran" className="quick-item">
                  <div className="quick-icon orange">
                    <CreditCard size={20} />
                  </div>
                  <div className="quick-info">
                    <strong>{d.aktivitas.menunggu} Pembayaran</strong>
                    <span>Menunggu verifikasi</span>
                  </div>
                  <ArrowUpRight size={17} />
                </Link>
              </div>

              <div className="quick-note">
                <Clock size={16} />
                Data diperbarui langsung dari database.
              </div>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel schedule-panel">
              <div className="panel-header">
                <div>
                  <h3>Jadwal Pembelajaran</h3>
                  <p>Agenda pembelajaran hari ini</p>
                </div>
                <Link href="/admin/jadwal" className="text-link">
                  Lihat semua
                </Link>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>WAKTU</th>
                      <th>MATA PELAJARAN</th>
                      <th>SISWA / KELAS</th>
                      <th>PENGAJAR</th>
                      <th>TIPE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule, i) => (
                      <tr key={i}>
                        <td>
                          <div className="time-cell">
                            <Clock size={14} />
                            {schedule.time}
                          </div>
                        </td>
                        <td>
                          <strong>{schedule.subject}</strong>
                        </td>
                        <td>{schedule.student}</td>
                        <td>{schedule.teacher}</td>
                        <td>
                          <span className={`type-badge ${schedule.color}`}>
                            {schedule.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel transaction-panel">
              <div className="panel-header">
                <div>
                  <h3>Pembayaran Terbaru</h3>
                  <p>Riwayat pembayaran siswa</p>
                </div>
                <Link href="/admin/pembayaran" className="text-link">
                  Lihat semua
                </Link>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>NAMA SISWA</th>
                      <th>KETERANGAN</th>
                      <th>TANGGAL</th>
                      <th>JUMLAH</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, i) => (
                      <tr key={i}>
                        <td><strong>{transaction.name}</strong></td>
                        <td>{transaction.detail}</td>
                        <td>{transaction.date}</td>
                        <td><strong>{transaction.amount}</strong></td>
                        <td>
                          <span
                            className={`status-badge ${
                              transaction.status === "Terverifikasi"
                                ? "verified"
                                : "pending"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <footer className="footer">
            <span>© 2026 InnovaEdu. All rights reserved.</span>
            <span>Learning Management System</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
