import type { ReactNode } from "react";
import { requireRole } from "../lib/auth";
import { RoleSwitch } from "../_components/RoleSwitch";

export default async function MuridLayout({ children }: { children: ReactNode }) {
  await requireRole("siswa");
  return <>{children}<RoleSwitch /></>;
}
