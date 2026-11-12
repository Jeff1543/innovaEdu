import { requireRole } from "../../lib/auth";
import StudentPage from "./client";
import type { Student } from "./client";

export default async function Page() {
  const u = await requireRole("admin");
  const { data } = await u.sb.from("profiles")
    .select("id,nama,email,gender,level,grade,program,parent,phone,status").contains("roles", ["siswa"]).order("nama");
  const students: Student[] = (data ?? []).map((p: any) => ({
    id: p.id, name: p.nama ?? "", gender: p.gender ?? "Laki-laki", level: p.level ?? "SD", grade: p.grade ?? "Kelas 1",
    program: p.program ?? "Privat", parent: p.parent ?? "", phone: p.phone ?? "", email: p.email ?? "", status: p.status ?? "Aktif",
  }));
  return <StudentPage students={students} />;
}
