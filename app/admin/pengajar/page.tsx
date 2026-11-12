import { requireRole } from "../../lib/auth";
import TeacherPage from "./client";
import type { Teacher } from "./client";

export default async function Page() {
  const u = await requireRole("admin");
  const { data } = await u.sb.from("profiles")
    .select("id,nama,email,gender,phone,education,subjects,experience,rate,status").contains("roles", ["pengajar"]).order("nama");
  const teachers: Teacher[] = (data ?? []).map((p: any) => ({
    id: p.id, name: p.nama ?? "", gender: p.gender ?? "Laki-laki", phone: p.phone ?? "", email: p.email ?? "", education: p.education ?? "",
    subjects: p.subjects ?? [], experience: p.experience ?? 0, rate: p.rate ?? 0, status: p.status ?? "Aktif",
  }));
  return <TeacherPage teachers={teachers} />;
}
