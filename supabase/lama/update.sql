-- Jalankan di Supabase > SQL Editor SETELAH schema.sql.

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
