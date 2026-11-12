-- Jalankan di Supabase > SQL Editor SETELAH update2.sql (aman dijalankan ulang).
-- Pendaftaran trial dari form di landing. Data masuk lewat server (service role), hanya admin yang boleh membaca/mengubah.

create table if not exists pendaftaran (
  id bigint generated always as identity primary key,
  nama text not null,
  jenjang text, kelas text, program text, mapel text,
  orang_tua text, hp text, email text, catatan text,
  status text not null default 'baru' check (status in ('baru','dihubungi','trial','jadi_siswa','batal')),
  dibuat timestamptz not null default now()
);
alter table pendaftaran enable row level security;
drop policy if exists daftar_admin on pendaftaran;
create policy daftar_admin on pendaftaran for all using (is_admin()) with check (is_admin());
