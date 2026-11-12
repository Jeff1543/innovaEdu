import { createClient } from "@supabase/supabase-js";

// Hanya untuk kode server (server action / route). Melewati RLS, jadi selalu cek role dulu.
export const supabaseAdmin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
