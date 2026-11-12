import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

const HOME: Record<string, string> = { admin: "/admin", pengajar: "/portal", siswa: "/murid" };

export async function currentUser() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("nama,roles").eq("id", user.id).single();
  return { sb, id: user.id, nama: (p?.nama ?? "") as string, roles: (p?.roles ?? []) as string[] };
}

export function homeFor(roles: string[]) {
  const r = ["admin", "pengajar", "siswa"].find((x) => roles.includes(x));
  return r ? HOME[r] : "/login?error=tanpa-role";
}

// Penjaga halaman: belum login -> /login; role salah -> dikembalikan ke halaman role-nya sendiri.
export async function requireRole(role: string) {
  const u = await currentUser();
  if (!u) redirect("/login");
  if (!u.roles.includes(role)) redirect(homeFor(u.roles));
  return u;
}
