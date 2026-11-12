# InnovaEdu

Next.js 16 + Supabase. Satu project utuh (gabungan innovaEdu-auth, innovaEdu-final, innovaEdu-final2).

## Cara menjalankan

1. Install: `npm install`
2. Supabase > SQL Editor: jalankan **`supabase/setup.sql`** (sekali saja).
3. Supabase > Authentication > Users > Add user (centang *Auto Confirm User*) untuk 1 akun admin dan 1 akun siswa.
4. Edit dua email di **`supabase/seed.sql`**, lalu jalankan di SQL Editor (membuat role admin + 4 sesi contoh).
5. Salin `.env.example` jadi **`.env.local`** lalu isi: URL, anon key, service role key dari Supabase > Project Settings > API.
6. Jalankan: `npm run dev` lalu buka http://localhost:3000

## Halaman

| URL | Untuk |
|---|---|
| `/` | Landing (kontak footer diambil dari Pengaturan) |
| `/login` | Masuk (password, atau link email untuk siswa) |
| `/admin/*` | Admin: dashboard, siswa, pengajar, kelas, jadwal, absensi, pembayaran, laporan, akun, pengaturan |
| `/admin/pendaftaran` | Calon siswa dari formulir di landing |
| `/portal` | Pengajar |
| `/murid` | Siswa |
| `/api/reminders` | Cron pengingat H-1 (header `Authorization: Bearer CRON_SECRET`, tes: `?dry=1`) |

## Database yang sudah terlanjur dijalankan

Kalau `schema.sql`, `update.sql`, dan `update2.sql` sudah pernah dijalankan, cukup jalankan **`supabase/update3.sql`** (tabel pendaftaran). Jangan jalankan `setup.sql` lagi.

## Catatan

- Salin `.env.example` jadi `.env.local` lalu isi. File env jangan di-commit (sudah ada di `.gitignore`); berisi service role key.
- Pengingat email (Resend) boleh dikosongkan dulu; `RESEND_API_KEY` dan `MAIL_FROM` kosong = email dilewati.
- `supabase/lama/` hanya arsip file SQL terpisah. Cukup pakai `setup.sql`.
