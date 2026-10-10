"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

type ResetPasswordResponse = {
  success: boolean;
  message?: string;
};

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");

    if (!token) {
      setError("ไม่พบ token สำหรับตั้งรหัสผ่านใหม่ กรุณาขอลิงก์ใหม่");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = (await response.json()) as ResetPasswordResponse;

      if (!response.ok || !data.success) {
        setError(data.message ?? "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
        return;
      }

      setSuccess(true);
    } catch (requestError) {
      console.error("Reset password request error:", requestError);
      setError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง");
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
              className="h-auto w-[230px] object-contain"
            />
          </div>

          <section className="rounded-[30px] border border-white/90 bg-white/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/[0.03] backdrop-blur-xl sm:p-8">
            {!success ? (
              <>
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    New password
                  </p>
                  <h1 className="mt-2 text-[29px] font-semibold tracking-[-0.04em] text-slate-950">
                    ตั้งรหัสผ่านใหม่
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    ใช้อย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรกับตัวเลข
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-700">
                      รหัสผ่านใหม่
                    </span>
                    <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100/70">
                      <LockKeyhole className="h-4 w-4 text-slate-400" />
                      <input
                        required
                        minLength={8}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="รหัสผ่านใหม่"
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-700">
                      ยืนยันรหัสผ่านใหม่
                    </span>
                    <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100/70">
                      <LockKeyhole className="h-4 w-4 text-slate-400" />
                      <input
                        required
                        minLength={8}
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>

                  {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(5,150,105,0.22)] transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        กำลังบันทึก
                      </>
                    ) : (
                      "ตั้งรหัสผ่านใหม่"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h1 className="mt-5 text-[27px] font-semibold tracking-[-0.04em] text-slate-950">
                  ตั้งรหัสผ่านใหม่สำเร็จ
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  ตอนนี้สามารถใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบได้แล้ว
                </p>
                <Link
                  href="/login"
                  className="mt-7 inline-flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-sm font-semibold text-white"
                >
                  ไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
