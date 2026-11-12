
"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { simpanPengajar, hapusPengajar } from "../aksi";
import { AdminSidebar } from "../_sidebar";
import Link from "next/link";
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
  BookOpen,
  BriefcaseBusiness,
} from "lucide-react";

export type Teacher = {
  id: string;
  name: string;
  gender: string;
  phone: string;
  email: string;
  education: string;
  subjects: string[];
  experience: number;
  rate: number;
  status: "Aktif" | "Nonaktif";
};

const subjectOptions = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPA",
  "IPS",
  "Fisika",
  "Biologi",
  "Kimia",
];

const emptyForm = {
  name: "",
  gender: "Laki-laki",
  phone: "",
  email: "",
  education: "",
  subjects: [] as string[],
  experience: "0",
  rate: "",
  status: "Aktif" as "Aktif" | "Nonaktif",
};

type ModalMode = "add" | "edit" | "detail" | null;

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function TeacherPage({ teachers }: { teachers: Teacher[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [subjectFilter, setSubjectFilter] = useState("Semua Mapel");

  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const activeCount = teachers.filter(
    (teacher) => teacher.status === "Aktif"
  ).length;

  const subjectsCount = new Set(
    teachers.flatMap((teacher) => teacher.subjects)
  ).size;

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        teacher.name.toLowerCase().includes(keyword) ||
        teacher.phone.includes(keyword) ||
        teacher.email.toLowerCase().includes(keyword) ||
        teacher.subjects.some((subject) =>
          subject.toLowerCase().includes(keyword)
        );

      const matchesStatus =
        statusFilter === "Semua Status" ||
        teacher.status === statusFilter;

      const matchesSubject =
        subjectFilter === "Semua Mapel" ||
        teacher.subjects.includes(subjectFilter);

      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [teachers, search, statusFilter, subjectFilter]);

  function closeModal() {
    setModal(null);
    setSelectedTeacher(null);
    setFormError("");
  }

  function openAddModal() {
    setForm(emptyForm);
    setSelectedTeacher(null);
    setFormError("");
    setModal("add");
  }

  function openEditModal(teacher: Teacher) {
    setSelectedTeacher(teacher);
    setForm({
      name: teacher.name,
      gender: teacher.gender,
      phone: teacher.phone,
      email: teacher.email,
      education: teacher.education,
      subjects: [...teacher.subjects],
      experience: String(teacher.experience),
      rate: String(teacher.rate),
      status: teacher.status,
    });
    setFormError("");
    setModal("edit");
  }

  function openDetailModal(teacher: Teacher) {
    setSelectedTeacher(teacher);
    setModal("detail");
  }

  function updateField(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function toggleSubject(subject: string) {
    setForm((previous) => ({
      ...previous,
      subjects: previous.subjects.includes(subject)
        ? previous.subjects.filter((item) => item !== subject)
        : [...previous.subjects, subject],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.education.trim() ||
      !form.rate
    ) {
      setFormError("Lengkapi seluruh data wajib terlebih dahulu.");
      return;
    }

    if (!/^[0-9+\-\s]{9,16}$/.test(form.phone.trim())) {
      setFormError("Format nomor HP tidak valid.");
      return;
    }

    if (form.subjects.length === 0) {
      setFormError("Pilih minimal satu mata pelajaran.");
      return;
    }

    const rate = Number(form.rate);
    const experience = Number(form.experience);

    if (!Number.isFinite(rate) || rate <= 0) {
      setFormError("Tarif per pertemuan harus lebih dari nol.");
      return;
    }

    if (
      !Number.isInteger(experience) ||
      experience < 0
    ) {
      setFormError("Pengalaman harus berupa angka bulat positif.");
      return;
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      setFormError("Format email tidak valid.");
      return;
    }

    const hasil = await simpanPengajar(
      { name: form.name, gender: form.gender, phone: form.phone, email: form.email, education: form.education, subjects: form.subjects, experience, rate, status: form.status },
      modal === "edit" ? selectedTeacher?.id : undefined,
    );
    if (hasil !== "ok") {
      setFormError(hasil);
      return;
    }

    closeModal();
    router.refresh();
  }

  async function handleDelete(teacher: Teacher) {
    const confirmed = window.confirm(
      `Hapus data pengajar ${teacher.name}?`
    );

    if (!confirmed) return;

    const hasil = await hapusPengajar(teacher.id);
    if (hasil !== "ok") window.alert(hasil);
    router.refresh();
  }

  return (
    <main className="dashboard-layout">
      <AdminSidebar active="/admin/pengajar" />

      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <Link href="/admin">Dashboard</Link>
            <span>/</span>
            <strong>Data Pengajar</strong>
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
              <p className="eyebrow">MANAJEMEN PENGAJAR</p>
              <h1>Data Pengajar</h1>
              <p className="welcome-description">
                Kelola informasi pengajar dan mata pelajaran InnovaEdu.
              </p>
            </div>

            <button className="primary-button" onClick={openAddModal}>
              <Plus size={18} />
              Tambah Pengajar
            </button>
          </div>

          <section className="student-stats">
            <article className="student-stat">
              <div className="student-stat-icon blue">
                <GraduationCap size={21} />
              </div>
              <div>
                <span>Total Pengajar</span>
                <h2>{teachers.length}</h2>
              </div>
            </article>

            <article className="student-stat">
              <div className="student-stat-icon green">
                <UserRound size={21} />
              </div>
              <div>
                <span>Pengajar Aktif</span>
                <h2>{activeCount}</h2>
              </div>
            </article>

            <article className="student-stat">
              <div className="student-stat-icon purple">
                <BookOpen size={21} />
              </div>
              <div>
                <span>Mata Pelajaran</span>
                <h2>{subjectsCount}</h2>
              </div>
            </article>

            <article className="student-stat">
              <div className="student-stat-icon orange">
                <BriefcaseBusiness size={21} />
              </div>
              <div>
                <span>Total Pengalaman</span>
                <h2>
                  {teachers.reduce(
                    (total, teacher) => total + teacher.experience,
                    0
                  )}{" "}
                  <small style={{ fontSize: 12 }}>tahun</small>
                </h2>
              </div>
            </article>
          </section>

          <section className="panel student-table-panel">
            <div className="student-table-heading">
              <div>
                <h3>Daftar Pengajar</h3>
                <p>
                  Terdapat {filteredTeachers.length} pengajar dalam daftar.
                </p>
              </div>
            </div>

            <div className="student-filters">
              <div className="student-search">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama, mata pelajaran, atau nomor HP..."
                />
              </div>

              <select
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
              >
                <option>Semua Mapel</option>
                {subjectOptions.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
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
              <table className="student-table teacher-table">
                <thead>
                  <tr>
                    <th>PENGAJAR</th>
                    <th>MATA PELAJARAN</th>
                    <th>PENDIDIKAN</th>
                    <th>PENGALAMAN</th>
                    <th>TARIF / PERTEMUAN</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td>
                        <div className="student-identity">
                          <div className="student-avatar">
                            {teacher.name.charAt(0)}
                          </div>
                          <div>
                            <strong>{teacher.name}</strong>
                            <span>{teacher.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="teacher-subjects">
                          {teacher.subjects.map((subject) => (
                            <span
                              className="type-badge blue"
                              key={subject}
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td>{teacher.education}</td>

                      <td>{teacher.experience} tahun</td>

                      <td>
                        <strong>{rupiah(teacher.rate)}</strong>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            teacher.status === "Aktif"
                              ? "verified"
                              : "pending"
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </td>

                      <td>
                        <div className="student-actions">
                          <button
                            title="Detail"
                            onClick={() => openDetailModal(teacher)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => openEditModal(teacher)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            title="Hapus"
                            className="delete-action"
                            onClick={() => handleDelete(teacher)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="student-empty">
                          <GraduationCap size={32} />
                          <strong>Pengajar tidak ditemukan</strong>
                          <span>Coba ubah kata kunci atau filter pencarian.</span>
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
                    ? "Tambah Pengajar"
                    : modal === "edit"
                    ? "Edit Data Pengajar"
                    : "Detail Pengajar"}
                </h2>
                <p>
                  {modal === "detail"
                    ? "Informasi lengkap pengajar."
                    : "Lengkapi informasi pengajar berikut."}
                </p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            {modal === "detail" && selectedTeacher ? (
              <div className="student-detail">
                <div className="detail-profile">
                  <div className="detail-avatar">
                    {selectedTeacher.name.charAt(0)}
                  </div>
                  <h3>{selectedTeacher.name}</h3>
                  <span>{selectedTeacher.education}</span>
                  <span
                    className={`status-badge ${
                      selectedTeacher.status === "Aktif"
                        ? "verified"
                        : "pending"
                    }`}
                  >
                    {selectedTeacher.status}
                  </span>
                </div>

                <div className="detail-grid">
                  <div>
                    <span>Jenis Kelamin</span>
                    <strong>{selectedTeacher.gender}</strong>
                  </div>
                  <div>
                    <span>Pengalaman</span>
                    <strong>{selectedTeacher.experience} tahun</strong>
                  </div>
                  <div>
                    <span>Mata Pelajaran</span>
                    <strong>{selectedTeacher.subjects.join(", ")}</strong>
                  </div>
                  <div>
                    <span>Tarif per Pertemuan</span>
                    <strong>{rupiah(selectedTeacher.rate)}</strong>
                  </div>
                  <div>
                    <span>Nomor HP</span>
                    <strong>{selectedTeacher.phone}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{selectedTeacher.email || "-"}</strong>
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
                    Nama Lengkap Pengajar *
                    <input
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="Nama lengkap pengajar"
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

                  <label className="form-field full">
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
                    Pendidikan Terakhir *
                    <input
                      value={form.education}
                      onChange={(event) =>
                        updateField("education", event.target.value)
                      }
                      placeholder="Contoh: S1 Pendidikan Matematika"
                      required
                    />
                  </label>

                  <div className="form-field full">
                    Mata Pelajaran yang Dikuasai *
                    <div className="subject-checkbox-grid">
                      {subjectOptions.map((subject) => (
                        <label
                          key={subject}
                          className="subject-option"
                        >
                          <input
                            type="checkbox"
                            checked={form.subjects.includes(subject)}
                            onChange={() => toggleSubject(subject)}
                          />
                          <span>{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="form-field">
                    Pengalaman (Tahun) *
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.experience}
                      onChange={(event) =>
                        updateField("experience", event.target.value)
                      }
                      required
                    />
                  </label>

                  <label className="form-field">
                    Tarif per Pertemuan (Rp) *
                    <input
                      type="number"
                      min="1"
                      value={form.rate}
                      onChange={(event) =>
                        updateField("rate", event.target.value)
                      }
                      placeholder="Contoh: 100000"
                      required
                    />
                  </label>

                  <label className="form-field full">
                    Status Pengajar
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

                {formError && (
                  <p className="form-error">{formError}</p>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-secondary"
                    onClick={closeModal}
                  >
                    Batal
                  </button>
                  <button type="submit" className="primary-button">
                    {modal === "add"
                      ? "Simpan Pengajar"
                      : "Simpan Perubahan"}
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
