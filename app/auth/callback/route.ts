import { NextResponse } from "next/server";
import { supabaseServer } from "../../lib/supabase/server";

// Tujuan link magic link dari email.
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  if (code) await (await supabaseServer()).auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL("/auth/redirect", req.url));
}
