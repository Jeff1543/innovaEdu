import { NextResponse } from "next/server";
import { currentUser, homeFor } from "../../lib/auth";

// Setelah login: arahkan ke halaman sesuai role.
export async function GET(req: Request) {
  const u = await currentUser();
  return NextResponse.redirect(new URL(u ? homeFor(u.roles) : "/login", req.url));
}
