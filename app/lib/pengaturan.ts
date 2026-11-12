import { supabaseServer } from "./supabase/server";

export type Pengaturan = {
  nama: string; whatsapp: string; email: string; alamat: string; jam: string;
  batas_ajukan_jam: number; maks_reschedule: number; reminder_aktif: boolean;
};
export const DEFAULT: Pengaturan = {
  nama: "InnovaEdu", whatsapp: "0812-3456-7890", email: "halo@innovaedu.id", alamat: "Jl. Contoh No. 24, Kota Anda",
  jam: "Senin - Sabtu, 13.00 - 20.00", batas_ajukan_jam: 24, maks_reschedule: 3, reminder_aktif: true,
};

export async function ambilPengaturan(): Promise<Pengaturan> {
  try {
    const sb = await supabaseServer();
    const { data } = await sb.from("pengaturan").select("*").eq("id", 1).maybeSingle();
    return { ...DEFAULT, ...Object.fromEntries(Object.entries(data ?? {}).filter(([, v]) => v !== null)) };
  } catch { return DEFAULT; }
}
