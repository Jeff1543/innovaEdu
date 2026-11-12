export const tgl = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("id-ID", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
export const jam = (a: string, b?: string) => a.slice(0, 5).replace(":", ".") + (b ? " - " + b.slice(0, 5).replace(":", ".") : "");
export const rp = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);
export const hariIniWIB = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);

// Permintaan ganti jadwal yang MASUK (diajukan pihak lain) dan masih menunggu jawaban.
export async function permintaanMasuk(sb: any, myId: string) {
  const { data } = await sb.from("reschedule")
    .select("id,tanggal_baru,jam_mulai_baru,jam_selesai_baru,alasan,sesi:sesi_id(mapel,tanggal,jam_mulai)")
    .eq("status", "menunggu").neq("diajukan_oleh", myId);
  return (data ?? []).map((r: any) => ({
    id: r.id as number, mapel: r.sesi.mapel as string, alasan: (r.alasan ?? "") as string,
    dari: `${tgl(r.sesi.tanggal)} ${jam(r.sesi.jam_mulai)}`,
    ke: `${tgl(r.tanggal_baru)} ${jam(r.jam_mulai_baru, r.jam_selesai_baru)}`,
  }));
}
