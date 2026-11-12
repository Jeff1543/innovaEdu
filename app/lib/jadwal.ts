// Jadwal mingguan (contoh). Ganti dengan data dari database saat backend sudah ada.
export type Jadwal = { hari: string; jam: string; mapel: string; siswa: string; emailSiswa: string; pengajar: string; emailPengajar: string; lokasi: string };

export const jadwal: Jadwal[] = [
  { hari: "Senin", jam: "08.00 - 09.30", mapel: "Matematika", siswa: "Andi Pratama", emailSiswa: "orangtua.andi@example.com", pengajar: "Bu Rina", emailPengajar: "rina@example.com", lokasi: "Rumah siswa, Jl. Melati 5" },
  { hari: "Selasa", jam: "13.00 - 14.30", mapel: "Matematika", siswa: "Siti Rahma", emailSiswa: "orangtua.siti@example.com", pengajar: "Bu Rina", emailPengajar: "rina@example.com", lokasi: "Online (Zoom)" },
  { hari: "Rabu", jam: "15.00 - 16.30", mapel: "Matematika", siswa: "Kelas 7B", emailSiswa: "kelas7b@example.com", pengajar: "Bu Rina", emailPengajar: "rina@example.com", lokasi: "Cabang InnovaEdu" },
];
