"use client";


import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Send,
} from "lucide-react";
import { FormEvent, useState } from "react";

type ForgotPasswordResponse = {
  success: boolean;
  message?: string;
  devResetUrl?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setMessage("");
    setDevResetUrl("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = (await response.json()) as ForgotPasswordResponse;

      if (!response.ok || !data.success) {
        setError(
          data.message ??
            "ไม่สามารถส่งคำขอตั้งรหัสผ่านใหม่ได้ กรุณาลองอีกครั้ง",
        );
        return;
      }

      setIsSent(true);
      setMessage(
        data.message ??
          "หากอีเมลนี้มีบัญชีอยู่ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ",
      );

      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (requestError) {
      console.error("Forgot password request error:", requestError);
      setError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="fixed inset-0 z-[100] overflow-y-auto bg-[#f7faf8]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-28 h-[360px] w-[360px] rounded-full bg-emerald-200/35 blur-[90px]" />
        <div className="absolute -right-24 top-[8%] h-[340px] w-[340px] rounded-full bg-cyan-200/35 blur-[100px]" />
        <div className="absolute bottom-[-140px] left-1/3 h-[360px] w-[360px] rounded-full bg-lime-200/25 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(15,23,42,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.35)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-[470px]">
          <div className="mb-7 flex justify-center">
            <Image
              src="/images/LOGO.png"
              alt="GreenFactory Insight"
              width={520}
              height={150}
              priority
              className="h-auto w-[230px] object-contain drop-shadow-[0_10px_24px_rgba(20,95,57,0.10)]"
            />
          </div>

          <section className="rounded-[30px] border border-white/90 bg-white/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/[0.03] backdrop-blur-xl sm:p-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>

            {!isSent ? (
              <>
                <div className="mt-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <Mail className="h-5 w-5" />
                  </div>

                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Password recovery
                  </p>

                  <h1 className="mt-2 text-[29px] font-semibold tracking-[-0.04em] text-slate-950">
                    ลืมรหัสผ่าน?
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    กรอกอีเมลที่ใช้กับ GreenFactory Insight
                    หากพบบัญชี ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-700">
                      อีเมล
                    </span>

                    <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition-all focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100/70">
                      <Mail className="h-[17px] w-[17px] shrink-0 text-slate-400" />

                      <input
                        required
                        disabled={isSubmitting}
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        placeholder="name@company.com"
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </label>

                  {error && (
                    <div
                      role="alert"
                      className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(5,150,105,0.22)] transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        กำลังส่งคำขอ
                      </>
                    ) : (
                      <>
                        ส่งลิงก์ตั้งรหัสผ่านใหม่
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-[10px] leading-5 text-slate-400">
                  เพื่อความปลอดภัย ระบบจะไม่เปิดเผยว่าอีเมลใดมีบัญชีอยู่ในระบบ
                </p>
              </>
            ) : (
              <div className="py-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <h1 className="mt-5 text-[27px] font-semibold tracking-[-0.04em] text-slate-950">
                  ตรวจสอบอีเมลของคุณ
                </h1>

                <p className="mx-auto mt-3 max-w-[350px] text-sm leading-6 text-slate-500">
                  {message}
                </p>

                {devResetUrl && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
                    <p className="text-xs font-semibold text-amber-900">
                      Development mode
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-amber-700">
                      ยังไม่ได้ตั้งค่าอีเมล สามารถใช้ลิงก์นี้ทดสอบการรีเซ็ตได้:
                    </p>
                    <Link
                      href={devResetUrl}
                      className="mt-2 block break-all text-xs font-semibold text-emerald-700 underline"
                    >
                      {devResetUrl}
                    </Link>
                  </div>
                )}

                <Link
                  href="/login"
                  className="mt-7 inline-flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-sm font-semibold text-white transition hover:from-emerald-700 hover:to-teal-700"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setMessage("");
                    setDevResetUrl("");
                  }}
                  className="mt-4 text-xs font-semibold text-slate-500 transition hover:text-emerald-700"
                >
                  ใช้อีเมลอื่น
                </button>
              </div>
            )}
          </section>

          <p className="mt-6 text-center text-[10px] text-slate-400">
            © 2026 GreenFactory Insight
          </p>
        </div>
      </div>
    </main>
  );
}
