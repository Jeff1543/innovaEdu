import Link from "next/link";
import { LayoutDashboard, ClipboardList, Users, GraduationCap, UserCog, BookOpen, CalendarDays, ClipboardCheck, Wallet, ChartNoAxesCombined, Settings } from "lucide-react";

// SATU-SATUNYA sumber menu sidebar admin: dipakai dashboard, Data Siswa, Data Pengajar, dan semua halaman lain.
const menu = [
  ["Dashboard", LayoutDashboard, "/admin"], ["Data Siswa", Users, "/admin/siswa"], ["Data Pengajar", GraduationCap, "/admin/pengajar"],
  ["Pendaftaran", ClipboardList, "/admin/pendaftaran"], ["Kelas & Program", BookOpen, "/admin/kelas"], ["Jadwal Belajar", CalendarDays, "/admin/jadwal"],
  ["Absensi", ClipboardCheck, "/admin/absensi"], ["Pembayaran", Wallet, "/admin/pembayaran"], ["Laporan", ChartNoAxesCombined, "/admin/laporan"],
  ["Akun & Role", UserCog, "/admin/akun"],
] as const;

export function AdminSidebar({ active }: { active: string }) {
  return (
    <aside className="sidebar">
      <Link href="/admin" className="brand">
        <div className="brand-icon"><GraduationCap size={25} /></div>
        <div><h2>InnovaEdu</h2><span>Learning Management</span></div>
      </Link>
      <div className="sidebar-section">
        <p className="sidebar-label">MENU UTAMA</p>
        <nav className="navigation">
          {menu.map(([label, Icon, href]) => (
            <Link key={href} href={href} className={`nav-item ${href === active ? "active" : ""}`}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="sidebar-bottom">
        <Link href="/admin/pengaturan" className={`nav-item ${active === "/admin/pengaturan" ? "active" : ""}`}><Settings size={19} /><span>Pengaturan</span></Link>
        <div className="sidebar-profile">
          <div className="avatar admin-avatar">A</div>
          <div className="profile-info"><strong>Administrator</strong><span>Owner</span></div>
        </div>
      </div>
    </aside>
  );
}
