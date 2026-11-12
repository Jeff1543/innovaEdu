import { NextResponse } from "next/server";
import { supabaseServer } from "../../lib/supabase/server";

export async function GET(req: Request) {
  await (await supabaseServer()).auth.signOut();
  return NextResponse.redirect(new URL("/login", req.url));
}
