-- LANGKAH: (1) Supabase > Authentication > Users > Add user (centang "Auto Confirm User") untuk 2 akun:
--   admin/pengajar (email + password) dan siswa. (2) Ganti dua email di bawah, lalu jalankan di SQL Editor.

update profiles set roles = '{admin,pengajar}', nama = 'Bu Rina' where email = 'GANTI-admin@email.com';
update profiles set nama = 'Andi Pratama' where email = 'GANTI-siswa@email.com';

insert into sesi (pengajar_id, siswa_id, mapel, lokasi, tanggal, jam_mulai, jam_selesai, honor)
select p.id, s.id, v.mapel, v.lokasi, current_date + v.d, v.mulai::time, v.selesai::time, v.honor
from profiles p, profiles s,
  (values ('Matematika','Online (Zoom)',-1,'13:00','14:30',70000),
          ('Matematika','Online (Zoom)', 1,'13:00','14:30',70000),
          ('Matematika','Rumah siswa',   3,'15:00','16:30',70000),
          ('Matematika','Rumah siswa',   8,'15:00','16:30',70000)) as v(mapel, lokasi, d, mulai, selesai, honor)
where p.email = 'GANTI-admin@email.com' and s.email = 'GANTI-siswa@email.com';
