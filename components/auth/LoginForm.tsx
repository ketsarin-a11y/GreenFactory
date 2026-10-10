"use client";

import { updateBrowserTitle } from "./updateBrowserTitle";

import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type LoginResponse = {
  success: boolean;
  message?: string;
  redirectTo?: string;
};

function getSafeReturnTo(
  returnTo: string | null,
): string | null {
  if (!returnTo) {
    return null;
  }

  const value = returnTo.trim();

  if (!value) {
    return null;
  }

  /*
   * QR login return flow is intentionally restricted
   * to GreenFactory's internal /scan/<token> route.
   *
   * This prevents values such as:
   *   https://example.com
   *   //example.com
   *   /manager
   *
   * from overriding the server-provided role redirect.
   */
  if (
    !value.startsWith("/scan/") ||
    value.startsWith("//")
  ) {
    return null;
  }

  /*
   * A valid QR route must contain a token after /scan/.
   */
  const token = value.slice("/scan/".length);

  if (!token || token.includes("/")) {
    return null;
  }

  return value;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companyCode, setCompanyCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [rememberMe, setRememberMe] =
    useState(true);

  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    document.title =
      "เข้าสู่ระบบ | GreenFactory Insight";

    setIsPreparing(false);
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isPreparing || isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    document.title =
      "กำลังตรวจสอบ | GreenFactory Insight";

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyCode:
              companyCode.trim().toUpperCase(),
            email: email.trim().toLowerCase(),
            password,
            rememberMe,
          }),
        },
      );

      const data =
        (await response.json()) as LoginResponse;

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

      const safeReturnTo = getSafeReturnTo(
        searchParams.get("returnTo"),
      );

      router.replace(
        safeReturnTo ?? data.redirectTo ?? "/",
      );

      router.refresh();
    } catch (loginError) {
      console.error(
        "Login request error:",
        loginError,
      );

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

  const formDisabled =
    isPreparing || isSubmitting;

  return (
    <main className="fixed inset-0 z-[100] overflow-y-auto bg-[#f7faf8]">
      {/* Modern background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-28 h-[360px] w-[360px] rounded-full bg-emerald-200/35 blur-[90px]" />
        <div className="absolute -right-24 top-[8%] h-[340px] w-[340px] rounded-full bg-cyan-200/35 blur-[100px]" />
        <div className="absolute bottom-[-140px] left-1/3 h-[360px] w-[360px] rounded-full bg-lime-200/25 blur-[110px]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(15,23,42,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.35)_1px,transparent_1px)] [background-size:52px_52px]" />

        <div className="absolute left-[7%] top-[15%] hidden text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700/25 lg:block">
          Sustainable Factory
        </div>

        <div className="absolute right-[7%] top-[15%] hidden text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500/25 lg:block">
          People · Process · Planet
        </div>

        <div className="absolute bottom-[12%] right-[8%] hidden text-right text-[10px] font-medium uppercase tracking-[0.28em] text-emerald-700/20 lg:block">
          Data today
          <br />
          for a greener tomorrow
        </div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-[470px]">
          {/* Brand */}
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

          {/* Login card */}
          <section className="rounded-[30px] border border-white/90 bg-white/92 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/[0.03] backdrop-blur-xl sm:p-8">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">
                Welcome back
              </p>

              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-slate-950">
                เข้าสู่ระบบ
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                กรอกข้อมูลบัญชีเพื่อเข้าใช้งาน
                GreenFactory Insight
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {/* Company code */}
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-700">
                  รหัสองค์กร
                </span>

                <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition-all duration-200 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100/70">
                  <Building2
                    className="h-[17px] w-[17px] shrink-0 text-slate-400"
                    strokeWidth={1.8}
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
                    placeholder="เช่น GF001"
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium uppercase tracking-[0.04em] text-slate-800 outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </label>

              {/* Email */}
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-700">
                  อีเมล
                </span>

                <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition-all duration-200 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100/70">
                  <Mail
                    className="h-[17px] w-[17px] shrink-0 text-slate-400"
                    strokeWidth={1.8}
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
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </label>

              {/* Password */}
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-700">
                  รหัสผ่าน
                </span>

                <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition-all duration-200 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100/70">
                  <LockKeyhole
                    className="h-[17px] w-[17px] shrink-0 text-slate-400"
                    strokeWidth={1.8}
                  />

                  <input
                    required
                    disabled={formDisabled}
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    placeholder="กรอกรหัสผ่าน"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    disabled={formDisabled}
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "ซ่อนรหัสผ่าน"
                        : "แสดงรหัสผ่าน"
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-4 w-4"
                        strokeWidth={1.7}
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4"
                        strokeWidth={1.7}
                      />
                    )}
                  </button>
                </div>
              </label>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    disabled={formDisabled}
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded accent-emerald-600 disabled:cursor-not-allowed"
                  />
                  จดจำการเข้าสู่ระบบ
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline hover:underline-offset-4"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formDisabled}
                className="group inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 px-7 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(5,150,105,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-[0_20px_38px_rgba(5,150,105,0.28)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
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

            <div className="mt-7 flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-[11px] text-emerald-800/80">
                Secure access for GreenFactory users
              </p>
            </div>
          </section>

          <p className="mt-6 text-center text-[10px] text-slate-400">
            © 2026 GreenFactory Insight
          </p>
        </div>
      </div>
    </main>
  );
}