-- Jalankan di Supabase > SQL Editor SETELAH update.sql.

-- 1) Data siswa & pengajar disimpan di tabel profiles
alter table profiles
  add column gender text, add column level text, add column grade text, add column program text, add column parent text,
  add column phone text, add column education text, add column subjects text[], add column experience int, add column rate int,
  add column status text not null default 'Aktif',
  add column dibuat timestamptz not null default now();

-- 2) Pengaturan (satu baris). Boleh dibaca publik (dipakai footer landing), hanya admin yang boleh mengubah.
create table pengaturan (
  id int primary key default 1 check (id = 1),
  nama text default 'InnovaEdu',
  whatsapp text default '0812-3456-7890',
  email text default 'halo@innovaedu.id',
  alamat text default 'Jl. Contoh No. 24, Kota Anda',
  jam text default 'Senin - Sabtu, 13.00 - 20.00',
  batas_ajukan_jam int default 24,
  maks_reschedule int default 3,
  reminder_aktif boolean default true
);
insert into pengaturan (id) values (1) on conflict do nothing;
alter table pengaturan enable row level security;
create policy set_baca on pengaturan for select using (true);
create policy set_admin on pengaturan for all using (is_admin()) with check (is_admin());

-- 3) Batas reschedule per bulan sekarang mengikuti Pengaturan
create or replace function batasi_reschedule() returns trigger language plpgsql security definer set search_path = public as $$
declare maks int;
begin
  select coalesce(maks_reschedule, 3) into maks from pengaturan where id = 1;
  if (select count(*) from reschedule where diajukan_oleh = new.diajukan_oleh and date_trunc('month', created_at) = date_trunc('month', now())) >= maks then
    raise exception 'Batas % pengajuan ganti jadwal per bulan sudah tercapai', maks;
  end if;
  return new;
end $$;
