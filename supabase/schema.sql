-- Jalankan di Supabase > SQL Editor (sekali saja).

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
