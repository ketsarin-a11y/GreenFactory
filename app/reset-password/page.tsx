"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Leaf,
  LockKeyhole,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("ไม่พบ Token สำหรับตั้งรหัสผ่านใหม่");
      return;
    }

    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
        return;
      }

      setIsSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Reset password request error:", error);

      setError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
    }
  }

  return (
    <main className="fixed inset-0 z-[100] overflow-y-auto bg-[#f2f6f1]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-44 h-[420px] w-[420px] rounded-full bg-[#cce8d3]/55 blur-[110px]" />
        <div className="absolute -bottom-52 -right-36 h-[430px] w-[430px] rounded-full bg-[#b9dfc4]/45 blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(27,77,45,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(27,77,45,0.22)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[450px]">
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
              className="mb-7 inline-flex items-center gap-2 text-[11px] font-medium text-[#66756c] transition hover:text-[#1c7c4a]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>

            {!isSuccess ? (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#edf7f0] text-[#1c7c4a]">
                  <KeyRound
                    className="h-[19px] w-[19px]"
                    strokeWidth={1.7}
                  />
                </div>

                <div className="mt-5">
                  <h1 className="text-[25px] font-semibold tracking-[-0.04em] text-[#1b2c22] sm:text-[29px]">
                    ตั้งรหัสผ่านใหม่
                  </h1>

                  <p className="mt-2 text-[12px] leading-6 text-[#718078]">
                    สร้างรหัสผ่านใหม่สำหรับบัญชี GreenFactory Insight
                  </p>
                </div>

                {!token && (
                  <div className="mt-5 rounded-[13px] border border-[#c94e4e]/15 bg-[#fff3f3] px-4 py-3 text-[11px] leading-5 text-[#a43e3e]">
                    ลิงก์นี้ไม่ถูกต้อง เนื่องจากไม่พบ Reset Token
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-7">
                  <label className="block">
                    <span className="text-[11px] font-medium text-[#34483b]">
                      รหัสผ่านใหม่
                    </span>

                    <span className="mt-2 flex h-[54px] items-center gap-3 rounded-[15px] border border-[#24422f]/12 bg-[#fbfcfa] px-4 transition focus-within:border-[#238252]/38 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,130,82,0.07)]">
                      <LockKeyhole
                        className="h-[17px] w-[17px] shrink-0 text-[#66806f]"
                        strokeWidth={1.65}
                      />

                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        autoComplete="new-password"
                        placeholder="อย่างน้อย 8 ตัวอักษร"
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-[#203128] outline-none placeholder:text-[#a2aba5]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((current) => !current)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#738078] transition hover:bg-[#edf3ee] hover:text-[#2f6845]"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </span>
                  </label>

                  <label className="mt-5 block">
                    <span className="text-[11px] font-medium text-[#34483b]">
                      ยืนยันรหัสผ่านใหม่
                    </span>

                    <span className="mt-2 flex h-[54px] items-center gap-3 rounded-[15px] border border-[#24422f]/12 bg-[#fbfcfa] px-4 transition focus-within:border-[#238252]/38 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,130,82,0.07)]">
                      <LockKeyhole
                        className="h-[17px] w-[17px] shrink-0 text-[#66806f]"
                        strokeWidth={1.65}
                      />

                      <input
                        required
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value,
                          )
                        }
                        autoComplete="new-password"
                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-[#203128] outline-none placeholder:text-[#a2aba5]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (current) => !current,
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#738078] transition hover:bg-[#edf3ee] hover:text-[#2f6845]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
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
                    disabled={!token}
                    className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center rounded-[15px] bg-[#1c7c4a] px-7 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(25,119,69,0.2)] transition hover:bg-[#166b40] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ตั้งรหัสผ่านใหม่
                  </button>
                </form>
              </>
            ) : (
              <div className="py-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf7f0] text-[#1c7c4a]">
                  <CheckCircle2
                    className="h-7 w-7"
                    strokeWidth={1.7}
                  />
                </div>

                <h1 className="mt-5 text-[25px] font-semibold tracking-[-0.04em] text-[#1b2c22]">
                  เปลี่ยนรหัสผ่านสำเร็จ
                </h1>

                <p className="mt-3 text-[12px] leading-6 text-[#718078]">
                  รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว
                  สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
                </p>

                <Link
                  href="/login"
                  className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-[15px] bg-[#1c7c4a] px-6 text-[13px] font-semibold text-white transition hover:bg-[#166b40]"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}