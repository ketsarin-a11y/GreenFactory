"use client";

import { updateBrowserTitle } from "./updateBrowserTitle";

import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type LoginResponse = {
  success: boolean;
  message?: string;
  redirectTo?: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [companyCode, setCompanyCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    document.title = "เข้าสู่ระบบ | GreenFactory Insight";

    async function resetExistingSession() {
      try {
        const response = await fetch("/api/auth/reset-session", {
          method: "POST",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Reset session failed");
        }
      } catch (resetError) {
        console.error("Reset session error:", resetError);

        if (isMounted) {
          setError(
            "ไม่สามารถเตรียมหน้าเข้าสู่ระบบได้ กรุณารีเฟรชหน้าอีกครั้ง",
          );

          updateBrowserTitle(
            "⚠️ ไม่สามารถเตรียมระบบ | GreenFactory Insight",
            true,
            3500,
          );
        }
      } finally {
        if (isMounted) {
          setIsPreparing(false);
        }
      }
    }

    resetExistingSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPreparing || isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    document.title = "กำลังตรวจสอบ | GreenFactory Insight";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyCode: companyCode.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          password,
          rememberMe,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.success) {
        setError(
          data.message ??
            "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
        );

        updateBrowserTitle(
          "❌ เข้าสู่ระบบไม่สำเร็จ | GreenFactory Insight",
          true,
          3500,
        );

        return;
      }

      updateBrowserTitle(
        "✅ เข้าสู่ระบบสำเร็จ | GreenFactory Insight",
        false,
      );

      router.replace(data.redirectTo ?? "/");
      router.refresh();
    } catch (loginError) {
      console.error("Login request error:", loginError);

      setError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง",
      );

      updateBrowserTitle(
        "⚠️ ไม่สามารถเชื่อมต่อระบบ | GreenFactory Insight",
        true,
        3500,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const formDisabled = isPreparing || isSubmitting;

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

          {/* Login card */}
          <section className="rounded-[26px] border border-[#21432d]/10 bg-white p-6 shadow-[0_28px_80px_rgba(25,62,38,0.09)] sm:p-8">
            <div className="text-center">
              <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-[#1b2c22] sm:text-[30px]">
                เข้าสู่ระบบ
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              {/* Company code */}
              <label className="block">
                <span className="text-[11px] font-medium text-[#34483b]">
                  รหัสองค์กร
                </span>

                <span className="mt-2 flex h-[54px] items-center gap-3 rounded-[15px] border border-[#24422f]/12 bg-[#fbfcfa] px-4 transition duration-200 focus-within:border-[#238252]/38 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,130,82,0.07)]">
                  <Building2
                    className="h-[17px] w-[17px] shrink-0 text-[#66806f]"
                    strokeWidth={1.65}
                  />

                  <input
                    required
                    disabled={formDisabled}
                    type="text"
                    value={companyCode}
                    onChange={(event) =>
                      setCompanyCode(
                        event.target.value.toUpperCase(),
                      )
                    }
                    autoComplete="organization"
                    placeholder="กรอกรหัสองค์กร"
                    className="min-w-0 flex-1 bg-transparent text-[13px] font-medium uppercase tracking-[0.04em] text-[#203128] outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-[#a2aba5] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </span>
              </label>

              {/* Email */}
              <label className="mt-5 block">
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
                    disabled={formDisabled}
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    placeholder="name@company.com"
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-[#203128] outline-none placeholder:text-[#a2aba5] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </span>
              </label>

              {/* Password */}
              <label className="mt-5 block">
                <span className="text-[11px] font-medium text-[#34483b]">
                  รหัสผ่าน
                </span>

                <span className="mt-2 flex h-[54px] items-center gap-3 rounded-[15px] border border-[#24422f]/12 bg-[#fbfcfa] px-4 transition duration-200 focus-within:border-[#238252]/38 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,130,82,0.07)]">
                  <LockKeyhole
                    className="h-[17px] w-[17px] shrink-0 text-[#66806f]"
                    strokeWidth={1.65}
                  />

                  <input
                    required
                    disabled={formDisabled}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    placeholder="กรอกรหัสผ่าน"
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-[#203128] outline-none placeholder:text-[#a2aba5] disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    disabled={formDisabled}
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "ซ่อนรหัสผ่าน"
                        : "แสดงรหัสผ่าน"
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#738078] transition hover:bg-[#edf3ee] hover:text-[#2f6845] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-4 w-4"
                        strokeWidth={1.6}
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4"
                        strokeWidth={1.6}
                      />
                    )}
                  </button>
                </span>
              </label>

              {/* Remember + Forgot password */}
              <div className="mt-5 flex items-center justify-between gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-[11px] text-[#66756c]">
                  <input
                    type="checkbox"
                    disabled={formDisabled}
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    className="h-4 w-4 rounded accent-[#1c7c4a] disabled:cursor-not-allowed"
                  />

                  จดจำการเข้าสู่ระบบ
                </label>

                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-[#1c7c4a] transition-colors hover:text-[#145f39] hover:underline hover:underline-offset-4"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-[13px] border border-[#c94e4e]/15 bg-[#fff3f3] px-4 py-3 text-[11px] leading-5 text-[#a43e3e]"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formDisabled}
                className="group mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-[15px] bg-[#1c7c4a] px-7 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(25,119,69,0.2)] transition duration-200 hover:bg-[#166b40] hover:shadow-[0_17px_36px_rgba(25,119,69,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPreparing ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    กำลังเตรียมระบบ
                  </>
                ) : isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    กำลังตรวจสอบ
                  </>
                ) : (
                  <>
                    เข้าสู่ระบบ

                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </section>

          <p className="mt-6 text-center text-[9px] text-[#87938b]">
            © 2026 GreenFactory Insight
          </p>
        </div>
      </div>
    </main>
  );
}