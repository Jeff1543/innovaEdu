// Kirim email lewat Resend. Kalau RESEND_API_KEY / MAIL_FROM belum diisi, diam-diam dilewati.
export async function kirimEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM || !to) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, html }),
    });
    return r.ok;
  } catch { return false; }
}
