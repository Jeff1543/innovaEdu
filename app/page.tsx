import Link from "next/link";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Clock,
  MapPin,
  CreditCard,
  Menu,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", active: true },
  { label: "Data Siswa", icon: Users, href: "/siswa" },
  { label: "Data Pengajar", icon: GraduationCap, href: "/pengajar" },
  { label: "Kelas & Program", icon: BookOpen, href: "/kelas" },
  { label: "Jadwal Belajar", icon: CalendarDays, href: "/jadwal" },
  { label: "Absensi", icon: ClipboardCheck, href: "/absensi" },
  { label: "Pembayaran", icon: Wallet, href: "/pembayaran" },
  { label: "Laporan", icon: ChartNoAxesCombined, href: "/laporan" },
];

const stats = [
  {
    title: "Total Siswa Aktif",
    value: "128",
    change: "+12%",
    note: "dibanding bulan lalu",
    icon: Users,
    color: "blue",
    positive: true,
  },
  {
    title: "Total Pengajar",
    value: "12",
    change: "+2",
    note: "pengajar baru",
    icon: GraduationCap,
    color: "purple",
    positive: true,
  },
  {
    title: "Pertemuan Bulan Ini",
    value: "186",
    change: "+8.5%",
    note: "dibanding bulan lalu",
    icon: CalendarDays,
    color: "orange",
    positive: true,
  },
  {
    title: "Pendapatan Bulan Ini",
    value: "Rp 18,5 jt",
    change: "+15.2%",
    note: "dibanding bulan lalu",
    icon: Wallet,
    color: "green",
    positive: true,
  },
];

const schedules = [
  {
    time: "08.00 - 09.30",
    subject: "Matematika",
    student: "Andi Pratama",
    teacher: "Bu Rina",
    type: "Privat",
    color: "blue",
  },
  {
    time: "10.00 - 11.30",
    subject: "Bahasa Inggris",
    student: "Kelas 8A",
    teacher: "Pak Budi",
    type: "Kelompok",
    color: "purple",
  },
  {
    time: "13.00 - 14.30",
    subject: "IPA",
    student: "Siti Rahma",
    teacher: "Bu Dina",
    type: "Privat",
    color: "green",
  },
  {
    time: "15.00 - 16.30",
    subject: "Matematika",
    student: "Kelas 7B",
    teacher: "Pak Arif",
    type: "Kelompok",
    color: "orange",
  },
];

const transactions = [
  {
    name: "Andi Pratama",
    detail: "Matematika - 2 pertemuan",
    date: "03 Nov 2026",
    amount: "Rp 200.000",
    status: "Terverifikasi",
  },
  {
    name: "Siti Rahma",
    detail: "IPA - 1 pertemuan",
    date: "03 Nov 2026",
    amount: "Rp 100.000",
    status: "Menunggu",
  },
  {
    name: "Budi Santoso",
    detail: "Bahasa Inggris - 4 pertemuan",
    date: "02 Nov 2026",
    amount: "Rp 400.000",
    status: "Terverifikasi",
  },
];

const chartData = [
  { month: "Mei", value: 42 },
  { month: "Jun", value: 60 },
  { month: "Jul", value: 48 },
  { month: "Agu", value: 75 },
  { month: "Sep", value: 58 },
  { month: "Okt", value: 85 },
  { month: "Nov", value: 70 },
];

export default function Home() {
  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={25} />
          </div>
          <div>
            <h2>InnovaEdu</h2>
            <span>Learning Management</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">MENU UTAMA</p>

          <nav className="navigation">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-item ${item.active ? "active" : ""}`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <Link href="/pengaturan" className="nav-item">
            <Settings size={19} />
            <span>Pengaturan</span>
          </Link>

          <div className="sidebar-profile">
            <div className="avatar admin-avatar">A</div>
            <div className="profile-info">
              <strong>Administrator</strong>
              <span>Owner</span>
            </div>
            <MoreHorizontal size={20} />
          </div>
        </div>
      </aside>

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
              <p className="eyebrow">SELASA, 03 NOVEMBER 2026</p>
              <h1>Selamat pagi, Administrator! 👋</h1>
              <p className="welcome-description">
                Berikut ringkasan aktivitas bimbingan belajar InnovaEdu hari ini.
              </p>
            </div>

            <button className="primary-button">
              <Plus size={18} />
              Tambah Siswa
            </button>
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
                    <button className="more-button" aria-label="Menu">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <p className="stat-title">{stat.title}</p>
                  <h2>{stat.value}</h2>

                  <div className="stat-footer">
                    <span className="change-positive">
                      <ArrowUpRight size={15} />
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
                <button className="select-button">
                  7 Bulan Terakhir <ChevronDown size={15} />
                </button>
              </div>

              <div className="revenue-summary">
                <h2>Rp 18.500.000</h2>
                <span className="change-positive">
                  <ArrowUpRight size={16} /> 15,2%
                </span>
                <span className="muted-text">dari bulan sebelumnya</span>
              </div>

              <div className="chart">
                <div className="chart-grid">
                  <span>20 jt</span>
                  <span>15 jt</span>
                  <span>10 jt</span>
                  <span>5 jt</span>
                  <span>0</span>
                </div>

                <div className="chart-bars">
                  {chartData.map((item) => (
                    <div className="bar-column" key={item.month}>
                      <div className="bar-track">
                        <div
                          className={`bar ${item.month === "Nov" ? "highlight" : ""}`}
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
                <MoreHorizontal size={21} />
              </div>

              <div className="quick-list">
                <div className="quick-item">
                  <div className="quick-icon blue">
                    <CalendarDays size={20} />
                  </div>
                  <div className="quick-info">
                    <strong>8 Pertemuan</strong>
                    <span>Terjadwal hari ini</span>
                  </div>
                  <ArrowUpRight size={17} />
                </div>

                <div className="quick-item">
                  <div className="quick-icon green">
                    <ClipboardCheck size={20} />
                  </div>
                  <div className="quick-info">
                    <strong>5 Pertemuan</strong>
                    <span>Sudah terlaksana</span>
                  </div>
                  <ArrowUpRight size={17} />
                </div>

                <div className="quick-item">
                  <div className="quick-icon orange">
                    <CreditCard size={20} />
                  </div>
                  <div className="quick-info">
                    <strong>3 Pembayaran</strong>
                    <span>Menunggu verifikasi</span>
                  </div>
                  <ArrowUpRight size={17} />
                </div>
              </div>

              <div className="quick-note">
                <Clock size={16} />
                Data aktivitas ditampilkan sebagai contoh.
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
                <a href="#" className="text-link">
                  Lihat semua
                </a>
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
                    {schedules.map((schedule) => (
                      <tr key={schedule.time}>
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
                <a href="#" className="text-link">
                  Lihat semua
                </a>
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
                    {transactions.map((transaction) => (
                      <tr key={transaction.name}>
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
