import type { ReactNode } from "react";
import { requireRole } from "../lib/auth";
import { RoleSwitch } from "../_components/RoleSwitch";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  await requireRole("pengajar");
  return <>{children}<RoleSwitch /></>;
}
