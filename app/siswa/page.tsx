"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  Search,
  Plus,
  Users,
  GraduationCap,
  UserRound,
  Pencil,
  Trash2,
  Eye,
  X,
  MoreHorizontal,
} from "lucide-react";

type Student = {
  id: number;
  name: string;
  gender: string;
  level: "SD" | "SMP";
  grade: string;
  program: "Privat" | "Kelompok";
  parent: string;
  phone: string;
  email: string;
  status: "Aktif" | "Nonaktif";
};

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Andi Pratama",
    gender: "Laki-laki",
    level: "SMP",
    grade: "Kelas 8",
    program: "Privat",
    parent: "Budi Santoso",
    phone: "081234567890",
    email: "andi@email.com",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Siti Rahma",
    gender: "Perempuan",
    level: "SD",
    grade: "Kelas 6",
    program: "Kelompok",
    parent: "Dewi Lestari",
    phone: "081298765432",
    email: "siti@email.com",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Budi Santoso",
    gender: "Laki-laki",
    level: "SMP",
    grade: "Kelas 7",
    program: "Kelompok",
    parent: "Agus Santoso",
    phone: "081345678901",
    email: "budi@email.com",
    status: "Aktif",
  },
  {
    id: 4,
    name: "Nadia Putri",
    gender: "Perempuan",
    level: "SD",
    grade: "Kelas 5",
    program: "Privat",
    parent: "Rina Amelia",
    phone: "081567890123",
    email: "nadia@email.com",
    status: "Aktif",
  },
  {
    id: 5,
    name: "Rizky Maulana",
    gender: "Laki-laki",
    level: "SMP",
    grade: "Kelas 9",
    program: "Privat",
    parent: "Hendra Maulana",
    phone: "081678901234",
    email: "rizky@email.com",
    status: "Nonaktif",
  },
  {
    id: 6,
    name: "Alya Safitri",
    gender: "Perempuan",
    level: "SD",
    grade: "Kelas 4",
    program: "Kelompok",
    parent: "Sari Wulandari",
    phone: "081789012345",
    email: "alya@email.com",
    status: "Aktif",
  },
];

const emptyForm = {
  name: "",
  gender: "Laki-laki",
  level: "SD" as "SD" | "SMP",
  grade: "Kelas 1",
  program: "Privat" as "Privat" | "Kelompok",
  parent: "",
  phone: "",
  email: "",
  status: "Aktif" as "Aktif" | "Nonaktif",
};

type ModalMode = "add" | "edit" | "detail" | null;

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("Semua Jenjang");
  const [programFilter, setProgramFilter] = useState("Semua Program");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        student.name.toLowerCase().includes(keyword) ||
        student.parent.toLowerCase().includes(keyword) ||
        student.phone.includes(keyword);

      const matchesLevel =
        levelFilter === "Semua Jenjang" || student.level === levelFilter;

      const matchesProgram =
        programFilter === "Semua Program" || student.program === programFilter;

      const matchesStatus =
        statusFilter === "Semua Status" || student.status === statusFilter;

      return matchesSearch && matchesLevel && matchesProgram && matchesStatus;
    });
  }, [students, search, levelFilter, programFilter, statusFilter]);

  const activeCount = students.filter(
    (student) => student.status === "Aktif",
  ).length;

  const sdCount = students.filter((student) => student.level === "SD").length;

  const smpCount = students.filter((student) => student.level === "SMP").length;

  function openAddModal() {
    setForm(emptyForm);
    setSelectedStudent(null);
    setFormError("");
    setModal("add");
  }

  function openEditModal(student: Student) {
    setSelectedStudent(student);
    setForm({
      name: student.name,
      gender: student.gender,
      level: student.level,
      grade: student.grade,
      program: student.program,
      parent: student.parent,
      phone: student.phone,
      email: student.email,
      status: student.status,
    });
    setFormError("");
    setModal("edit");
  }

  function openDetailModal(student: Student) {
    setSelectedStudent(student);
    setModal("detail");
  }

  function closeModal() {
    setModal(null);
    setSelectedStudent(null);
    setFormError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.parent.trim() || !form.phone.trim()) {
      setFormError("Nama siswa, nama orang tua, dan nomor HP wajib diisi.");
      return;
    }

    if (!/^[0-9+\-\s]{9,16}$/.test(form.phone.trim())) {
      setFormError("Nomor HP harus berisi 9–16 karakter angka.");
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError("Format email tidak valid.");
      return;
    }

    if (modal === "add") {
      const newStudent: Student = {
        id: Date.now(),
        ...form,
      };

      setStudents((previous) => [newStudent, ...previous]);
    }

    if (modal === "edit" && selectedStudent) {
      setStudents((previous) =>
        previous.map((student) =>
          student.id === selectedStudent.id ? { ...student, ...form } : student,
        ),
      );
    }

    closeModal();
  }

  function handleDelete(student: Student) {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus data ${student.name}?`,
    );

    if (!confirmed) return;

    setStudents((previous) =>
      previous.filter((item) => item.id !== student.id),
    );
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((previous) => {
      if (field === "level") {
        return {
          ...previous,
          level: value as "SD" | "SMP",
          grade: "Kelas 1",
        };
      }

      if (field === "program") {
        return {
          ...previous,
          program: value as "Privat" | "Kelompok",
        };
      }

      if (field === "status") {
        return {
          ...previous,
          status: value as "Aktif" | "Nonaktif",
        };
      }

      return { ...previous, [field]: value };
    });
  }

  const gradeOptions =
    form.level === "SD"
      ? ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"]
      : ["Kelas 7", "Kelas 8", "Kelas 9"];

  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <a href="/" className="brand">
          <div className="brand-icon">
            <GraduationCap size={25} />
          </div>
          <div>
            <h2>InnovaEdu</h2>
            <span>Learning Management</span>
          </div>
        </a>

        <div className="sidebar-section">
          <p className="sidebar-label">MENU UTAMA</p>

          <nav className="navigation">
            <a href="/" className="nav-item">
              <Users size={19} />
              <span>Dashboard</span>
            </a>

            <a href="/siswa" className="nav-item active">
              <Users size={19} />
              <span>Data Siswa</span>
            </a>

            {[
              ["Data Pengajar", "/pengajar"],
              ["Kelas & Program", "/kelas"],
              ["Jadwal Belajar", "/jadwal"],
              ["Absensi", "/absensi"],
              ["Pembayaran", "/pembayaran"],
              ["Laporan", "/laporan"],
            ].map(([label, href]) => (
              <a href={href} className="nav-item" key={label}>
                <GraduationCap size={19} />
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <a href="#" className="nav-item">
            <UserRound size={19} />
            <span>Pengaturan</span>
          </a>

          <div className="sidebar-profile">
            <div className="avatar admin-avatar">A</div>
            <div className="profile-info">
              <strong>Administrator</strong>
              <span>Owner</span>
            </div>
            <MoreHorizontal size={20} />
          </div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <a href="/">Dashboard</a>
            <span>/</span>
            <strong>Data Siswa</strong>
          </div>

          <div className="topbar-right">
            <div className="topbar-user">
              <div className="avatar admin-avatar">A</div>
              <div className="profile-info">
                <strong>Administrator</strong>
                <span>Owner</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          <div className="student-heading">
            <div>
              <p className="eyebrow">MANAJEMEN DATA</p>
              <h1>Data Siswa</h1>
              <p className="welcome-description">
                Kelola informasi dan data seluruh siswa InnovaEdu.
              </p>
            </div>

            <button className="primary-button" onClick={openAddModal}>
              <Plus size={18} />
              Tambah Siswa
            </button>
          </div>

          <section className="student-stats">
            <article className="student-stat">
              <div className="student-stat-icon blue">
                <Users size={21} />
              </div>
              <div>
                <span>Total Siswa</span>
                <h2>{students.length}</h2>
              </div>
            </article>

            <article className="student-stat">
              <div className="student-stat-icon green">
                <UserRound size={21} />
              </div>
              <div>
                <span>Siswa Aktif</span>
                <h2>{activeCount}</h2>
              </div>
            </article>

            <article className="student-stat">
              <div className="student-stat-icon purple">
                <GraduationCap size={21} />
              </div>
              <div>
                <span>Jenjang SD</span>
                <h2>{sdCount}</h2>
              </div>
            </article>

            <article className="student-stat">
              <div className="student-stat-icon orange">
                <GraduationCap size={21} />
              </div>
              <div>
                <span>Jenjang SMP</span>
                <h2>{smpCount}</h2>
              </div>
            </article>
          </section>

          <section className="panel student-table-panel">
            <div className="student-table-heading">
              <div>
                <h3>Daftar Siswa</h3>
                <p>Terdapat {filteredStudents.length} siswa dalam daftar.</p>
              </div>
            </div>

            <div className="student-filters">
              <div className="student-search">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama, orang tua, atau nomor HP..."
                />
              </div>

              <select
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
              >
                <option>Semua Jenjang</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
              </select>

              <select
                value={programFilter}
                onChange={(event) => setProgramFilter(event.target.value)}
              >
                <option>Semua Program</option>
                <option value="Privat">Privat</option>
                <option value="Kelompok">Kelompok</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="table-wrapper">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>SISWA</th>
                    <th>JENJANG</th>
                    <th>PROGRAM</th>
                    <th>ORANG TUA</th>
                    <th>NO. HP</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-identity">
                          <div className="student-avatar">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{student.name}</strong>
                            <span>{student.gender}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>{student.level}</strong>
                        <span className="table-subtitle">{student.grade}</span>
                      </td>

                      <td>
                        <span
                          className={`type-badge ${
                            student.program === "Privat" ? "blue" : "purple"
                          }`}
                        >
                          {student.program}
                        </span>
                      </td>

                      <td>{student.parent}</td>
                      <td>{student.phone}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            student.status === "Aktif" ? "verified" : "pending"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>

                      <td>
                        <div className="student-actions">
                          <button
                            title="Detail"
                            onClick={() => openDetailModal(student)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => openEditModal(student)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            title="Hapus"
                            className="delete-action"
                            onClick={() => handleDelete(student)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="student-empty">
                          <Users size={32} />
                          <strong>Siswa tidak ditemukan</strong>
                          <span>
                            Coba ubah kata kunci atau filter pencarian.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="footer">
            <span>© 2026 InnovaEdu. All rights reserved.</span>
            <span>Learning Management System</span>
          </footer>
        </div>
      </section>

      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="student-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {modal === "add"
                    ? "Tambah Siswa"
                    : modal === "edit"
                      ? "Edit Data Siswa"
                      : "Detail Siswa"}
                </h2>
                <p>
                  {modal === "detail"
                    ? "Informasi lengkap siswa."
                    : "Lengkapi informasi siswa berikut."}
                </p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            {modal === "detail" && selectedStudent ? (
              <div className="student-detail">
                <div className="detail-profile">
                  <div className="detail-avatar">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <h3>{selectedStudent.name}</h3>
                  <span>
                    {selectedStudent.level} · {selectedStudent.grade}
                  </span>
                  <span
                    className={`status-badge ${
                      selectedStudent.status === "Aktif"
                        ? "verified"
                        : "pending"
                    }`}
                  >
                    {selectedStudent.status}
                  </span>
                </div>

                <div className="detail-grid">
                  <div>
                    <span>Jenis Kelamin</span>
                    <strong>{selectedStudent.gender}</strong>
                  </div>
                  <div>
                    <span>Program</span>
                    <strong>{selectedStudent.program}</strong>
                  </div>
                  <div>
                    <span>Nama Orang Tua</span>
                    <strong>{selectedStudent.parent}</strong>
                  </div>
                  <div>
                    <span>Nomor HP</span>
                    <strong>{selectedStudent.phone}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{selectedStudent.email || "-"}</strong>
                  </div>
                </div>

                <button className="modal-secondary" onClick={closeModal}>
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label className="form-field full">
                    Nama Lengkap Siswa *
                    <input
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="Contoh: Andi Pratama"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Jenis Kelamin *
                    <select
                      value={form.gender}
                      onChange={(event) =>
                        updateField("gender", event.target.value)
                      }
                    >
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </label>

                  <label className="form-field">
                    Jenjang *
                    <select
                      value={form.level}
                      onChange={(event) =>
                        updateField("level", event.target.value)
                      }
                    >
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                    </select>
                  </label>

                  <label className="form-field">
                    Kelas *
                    <select
                      value={form.grade}
                      onChange={(event) =>
                        updateField("grade", event.target.value)
                      }
                    >
                      {gradeOptions.map((grade) => (
                        <option key={grade}>{grade}</option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    Program *
                    <select
                      value={form.program}
                      onChange={(event) =>
                        updateField("program", event.target.value)
                      }
                    >
                      <option value="Privat">Privat</option>
                      <option value="Kelompok">Kelompok</option>
                    </select>
                  </label>

                  <label className="form-field full">
                    Nama Orang Tua / Wali *
                    <input
                      value={form.parent}
                      onChange={(event) =>
                        updateField("parent", event.target.value)
                      }
                      placeholder="Nama orang tua atau wali"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Nomor HP *
                    <input
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="email@contoh.com"
                    />
                  </label>

                  <label className="form-field full">
                    Status Siswa
                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateField("status", event.target.value)
                      }
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </label>
                </div>

                {formError && <p className="form-error">{formError}</p>}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-secondary"
                    onClick={closeModal}
                  >
                    Batal
                  </button>
                  <button type="submit" className="primary-button">
                    {modal === "add" ? "Simpan Siswa" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
