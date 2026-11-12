import type { ReactNode } from "react";
import "./theme.css";
import { requireRole } from "../lib/auth";
import { RoleSwitch } from "../_components/RoleSwitch";

// Hanya role "admin" yang boleh masuk /admin. Tema sama seperti halaman user.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("admin");
  return <div className="at">{children}<RoleSwitch /></div>;
}
