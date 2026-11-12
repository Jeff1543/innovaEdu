-- SETUP LENGKAP InnovaEdu: jalankan SEKALI di Supabase > SQL Editor (gabungan schema + update + update2, urutan sudah benar).

-- ========== 1. SCHEMA ==========

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text, nama text,
  roles text[] not null default '{siswa}'
);

create table sesi (
  id bigint generated always as identity primary key,
  pengajar_id uuid not null references profiles(id),
  siswa_id uuid not null references profiles(id),
  mapel text not null, lokasi text,
  tanggal date not null, jam_mulai time not null, jam_selesai time not null,
  honor int not null default 0,
  status text not null default 'terjadwal' check (status in ('terjadwal','selesai','dibatalkan'))
);

create table reschedule (
  id bigint generated always as identity primary key,
  sesi_id bigint not null references sesi(id) on delete cascade,
  diajukan_oleh uuid not null references profiles(id),
  tanggal_baru date not null, jam_mulai_baru time not null, jam_selesai_baru time not null,
  alasan text,
  status text not null default 'menunggu' check (status in ('menunggu','disetujui','ditolak')),
  created_at timestamptz not null default now()
);

-- profil otomatis dibuat saat user baru ditambahkan
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id, email, nama) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nama', split_part(new.email,'@',1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function is_admin() returns boolean language sql security definer set search_path = public stable as $$
  select coalesce('admin' = any(roles), false) from profiles where id = auth.uid()
$$;

alter table profiles enable row level security;
alter table sesi enable row level security;
alter table reschedule enable row level security;

create policy profil_baca on profiles for select using (
  id = auth.uid() or is_admin() or exists (select 1 from sesi s where (s.pengajar_id = auth.uid() and s.siswa_id = profiles.id) or (s.siswa_id = auth.uid() and s.pengajar_id = profiles.id))
);
create policy profil_admin on profiles for all using (is_admin()) with check (is_admin());

create policy sesi_baca on sesi for select using (pengajar_id = auth.uid() or siswa_id = auth.uid() or is_admin());
create policy sesi_admin on sesi for all using (is_admin()) with check (is_admin());

create policy rs_baca on reschedule for select using (
  is_admin() or exists (select 1 from sesi s where s.id = sesi_id and (s.pengajar_id = auth.uid() or s.siswa_id = auth.uid()))
);
create policy rs_ajukan on reschedule for insert with check (
  diajukan_oleh = auth.uid() and status = 'menunggu'
  and exists (select 1 from sesi s where s.id = sesi_id and (s.pengajar_id = auth.uid() or s.siswa_id = auth.uid()))
);

-- Pihak lawan menyetujui / menolak. Jadwal baru dicek bentrok dengan sesi lain milik pengajar.
create function tanggapi_reschedule(req bigint, setuju boolean) returns text language plpgsql security definer set search_path = public as $$
declare r reschedule; s sesi; lawan uuid;
begin
  select * into r from reschedule where id = req and status = 'menunggu';
  if not found then return 'Permintaan tidak ditemukan'; end if;
  select * into s from sesi where id = r.sesi_id;
  lawan := case when r.diajukan_oleh = s.pengajar_id then s.siswa_id else s.pengajar_id end;
  if auth.uid() is distinct from lawan then return 'Bukan wewenang Anda'; end if;
  if setuju then
    if exists (select 1 from sesi x where x.pengajar_id = s.pengajar_id and x.id <> s.id and x.status = 'terjadwal'
               and x.tanggal = r.tanggal_baru and x.jam_mulai < r.jam_selesai_baru and x.jam_selesai > r.jam_mulai_baru) then
      return 'Bentrok dengan jadwal pengajar yang lain';
    end if;
    update sesi set tanggal = r.tanggal_baru, jam_mulai = r.jam_mulai_baru, jam_selesai = r.jam_selesai_baru where id = s.id;
    update reschedule set status = 'disetujui' where id = req;
  else
    update reschedule set status = 'ditolak' where id = req;
  end if;
  return 'ok';
end $$;

create function selesaikan_sesi(sid bigint) returns text language plpgsql security definer set search_path = public as $$
begin
  update sesi set status = 'selesai' where id = sid and pengajar_id = auth.uid() and status = 'terjadwal' and tanggal <= current_date;
  if not found then return 'Sesi belum bisa ditandai selesai'; end if;
  return 'ok';
end $$;

-- ========== 2. UPDATE (dokumentasi, pembayaran, batas reschedule) ==========

-- 1) Dokumentasi mengajar (foto disimpan di Storage, datanya di tabel ini)
create table dokumentasi (
  id bigint generated always as identity primary key,
  sesi_id bigint not null references sesi(id) on delete cascade,
  diunggah_oleh uuid not null references profiles(id),
  path text not null, catatan text,
  created_at timestamptz not null default now()
);
alter table dokumentasi enable row level security;
create policy dok_baca on dokumentasi for select using (
  is_admin() or exists (select 1 from sesi s where s.id = sesi_id and (s.pengajar_id = auth.uid() or s.siswa_id = auth.uid()))
);
create policy dok_tambah on dokumentasi for insert with check (
  diunggah_oleh = auth.uid() and exists (select 1 from sesi s where s.id = sesi_id and s.pengajar_id = auth.uid())
);

insert into storage.buckets (id, name, public) values ('dokumentasi', 'dokumentasi', false) on conflict do nothing;
create policy dok_file_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'dokumentasi' and (storage.foldername(name))[1] = auth.uid()::text);
create policy dok_file_baca on storage.objects for select to authenticated
  using (bucket_id = 'dokumentasi' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));

-- 2) Pembayaran
create table pembayaran (
  id bigint generated always as identity primary key,
  siswa_id uuid not null references profiles(id),
  tanggal date not null default current_date,
  keterangan text, jumlah int not null,
  status text not null default 'menunggu' check (status in ('menunggu','terverifikasi'))
);
alter table pembayaran enable row level security;
create policy bayar_admin on pembayaran for all using (is_admin()) with check (is_admin());
create policy bayar_siswa on pembayaran for select using (siswa_id = auth.uid());

-- 3) Batas pengajuan ganti jadwal: maksimal 3 per orang per bulan
create function batasi_reschedule() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from reschedule where diajukan_oleh = new.diajukan_oleh and date_trunc('month', created_at) = date_trunc('month', now())) >= 3 then
    raise exception 'Batas 3 pengajuan ganti jadwal per bulan sudah tercapai';
  end if;
  return new;
end $$;
create trigger batas_reschedule before insert on reschedule for each row execute function batasi_reschedule();

-- ========== 3. UPDATE 2 (data siswa/pengajar, pengaturan) ==========

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

-- ========== 4. UPDATE 3 (pendaftaran trial dari landing) ==========

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
