import { currentUser } from "../lib/auth";

// Tombol pindah role: hanya muncul untuk akun yang memang punya lebih dari satu role. Selalu ada tombol Keluar.
export async function RoleSwitch() {
  const u = await currentUser();
  if (!u) return null;
  const menu = [["admin", "/admin", "Admin"], ["pengajar", "/portal", "Portal pengajar"], ["siswa", "/murid", "Portal siswa"]].filter(([r]) => u.roles.includes(r));
  const style = { padding: "6px 14px", borderRadius: 999, border: "2px solid #1d2b4f", background: "#fff", fontWeight: 800, fontSize: 13, color: "#1d2b4f" } as const;
  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 100, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {menu.length > 1 && menu.map(([, href, label]) => <a key={href} href={href} style={{ ...style, background: "#ffc83d" }}>{label}</a>)}
      <a href="/auth/keluar" style={style}>Keluar</a>
    </div>
  );
}
