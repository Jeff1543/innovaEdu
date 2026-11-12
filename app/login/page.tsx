"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";

import "../beranda.css";
import "../portal/portal.css";
import { supabaseBrowser } from "../lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function masuk(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true); setPesan("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setLoading(false);
    if (error) return setPesan("Email atau password salah.");
    router.push("/auth/redirect"); router.refresh();
  }

  // Siswa / orang tua: masuk lewat link yang dikirim ke email (hanya untuk email yang sudah didaftarkan admin).
  async function kirimLink(form: HTMLFormElement) {
    const email = String(new FormData(form).get("email") || "");
    if (!email) return setPesan("Isi email dulu.");
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${location.origin}/auth/callback` } });
    setPesan(error ? "Email belum terdaftar. Hubungi admin InnovaEdu." : "Link masuk sudah dikirim ke email kamu.");
  }

  return (
    <div className="wr" style={{ minHeight: "100vh" }}>
      <div className="wr-w" style={{ padding: "64px 0", display: "grid", placeItems: "center" }}>
        <form className="pt-up" onSubmit={masuk} style={{ width: "min(440px,100%)" }}>
          <Link href="/" className="wr-logo"><i><GraduationCap size={20} /></i>InnovaEdu</Link>
          <h1 style={{ fontSize: 38 }}>Masuk</h1>
          <label>Email<input name="email" type="email" required style={{ border: "2px solid var(--ink)", borderRadius: 14, padding: "11px 14px", background: "var(--bg)" }} /></label>
          <label>Password<input name="password" type="password" style={{ border: "2px solid var(--ink)", borderRadius: 14, padding: "11px 14px", background: "var(--bg)" }} /></label>
          <button className="wr-btn" disabled={loading}>{loading ? "Memproses…" : "Masuk"}</button>
          <button type="button" className="wr-btn wh" onClick={(e) => kirimLink(e.currentTarget.form!)}>Kirim link masuk ke email (siswa)</button>
          {pesan && <p style={{ fontWeight: 700 }}>{pesan}</p>}
        </form>
      </div>
    </div>
  );
}
