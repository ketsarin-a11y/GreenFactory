"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Leaf,
  LoaderCircle,
  Mail,
  Send,
} from "lucide-react";
import { FormEvent, useState } from "react";

type ForgotPasswordResponse = {
  success: boolean;
  message?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <main className="fixed inset-0 z-[100] overflow-y-auto bg-[#f2f6f1]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-44 h-[420px] w-[420px] rounded-full bg-[#cce8d3]/55 blur-[110px]" />
        <div className="absolute -bottom-52 -right-36 h-[430px] w-[430px] rounded-full bg-[#b9dfc4]/45 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(27,77,45,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(27,77,45,0.22)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[450px]">
          {/* Brand */}
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#1c7c4a] text-white shadow-[0_14px_32px_rgba(28,124,74,0.2)]">
              <Leaf className="h-5 w-5" strokeWidth={1.8} />
            </div>

            <p className="mt-4 text-[17px] font-semibold tracking-[-0.035em] text-[#1c2d23]">
              GreenFactory Insight
            </p>
          </div>

          <section className="rounded-[26px] border border-[#21432d]/10 bg-white p-6 shadow-[0_28px_80px_rgba(25,62,38,0.09)] sm:p-8">
            <Link
              href="/login"
              className="mb-7 inline-flex items-center gap-2 rounded-full text-[11px] font-medium text-[#66756c] transition hover:text-[#1c7c4a]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>

            {!isSent ? (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#edf7f0] text-[#1c7c4a]">
                  <Mail className="h-[19px] w-[19px]" strokeWidth={1.7} />
                </div>

                <div className="mt-5">
                  <h1 className="text-[25px] font-semibold tracking-[-0.04em] text-[#1b2c22] sm:text-[29px]">
                    ลืมรหัสผ่าน?
                  </h1>

                  <p className="mt-2 max-w-[360px] text-[12px] leading-6 text-[#718078]">
                    กรอกอีเมลที่ใช้กับบัญชี GreenFactory Insight
                    ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-7">
                  <label className="block">
                    <span className="text-[11px] font-medium text-[#34483b]">
                      อีเมล
                    </span>

                    <span className="mt-2 flex h-[54px] items-center gap-3 rounded-[15px] border border-[#24422f]/12 bg-[#fbfcfa] px-4 transition duration-200 focus-within:border-[#238252]/38 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,130,82,0.07)]">
                      <Mail
                        className="h-[17px] w-[17px] shrink-0 text-[#66806f]"
                        strokeWidth={1.65}
                      />

                      <input
                        required
                        disabled={isSubmitting}
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        placeholder="name@company.com"
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-[#203128] outline-none placeholder:text-[#a2aba5] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </span>
                  </label>

                  {error && (
                    <div
                      role="alert"
                      className="mt-5 rounded-[13px] border border-[#c94e4e]/15 bg-[#fff3f3] px-4 py-3 text-[11px] leading-5 text-[#a43e3e]"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-[15px] bg-[#1c7c4a] px-7 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(25,119,69,0.2)] transition duration-200 hover:bg-[#166b40] hover:shadow-[0_17px_36px_rgba(25,119,69,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        กำลังส่งคำขอ
                      </>
                    ) : (
                      <>
                        ส่งลิงก์ตั้งรหัสผ่านใหม่
                        <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-[10px] leading-5 text-[#87938b]">
                  เพื่อความปลอดภัย ระบบจะไม่เปิดเผยว่าอีเมลใดมีบัญชีอยู่ในระบบ
                </p>
              </>
            ) : (
              <div className="py-3 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf7f0] text-[#1c7c4a]">
                  <CheckCircle2 className="h-7 w-7" strokeWidth={1.7} />
                </div>

                <h1 className="mt-5 text-[25px] font-semibold tracking-[-0.04em] text-[#1b2c22]">
                  ตรวจสอบอีเมลของคุณ
                </h1>

                <p className="mx-auto mt-3 max-w-[340px] text-[12px] leading-6 text-[#718078]">
                  {message}
                </p>

                <Link
                  href="/login"
                  className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-[15px] bg-[#1c7c4a] px-6 text-[13px] font-semibold text-white transition hover:bg-[#166b40]"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setMessage("");
                  }}
                  className="mt-4 text-[11px] font-medium text-[#66756c] transition hover:text-[#1c7c4a]"
                >
                  ใช้อีเมลอื่น
                </button>
              </div>
            )}
          </section>

          <p className="mt-6 text-center text-[9px] text-[#87938b]">
            © 2026 GreenFactory Insight
          </p>
        </div>
      </div>
    </main>
  );
}