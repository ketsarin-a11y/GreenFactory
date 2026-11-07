import "server-only";

/** Sends through Resend when RESEND_API_KEY is set; in development prints to the server log instead. */
export async function sendEmail(msg: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") console.info(`[email:dev] to=${msg.to} subject=${msg.subject}\n${msg.text}`);
    else console.error("[email] RESEND_API_KEY is not set; email not sent to", msg.to);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "GreenFactory Insight <onboarding@resend.dev>",
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
    }),
  });
  if (!res.ok) console.error("[email] Resend failed", res.status, await res.text());
}
