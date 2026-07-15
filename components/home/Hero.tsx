"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero-cinematic relative isolate min-h-[100svh] overflow-hidden bg-[#060a07]">
      {/* Cinematic background */}
      <div className="absolute inset-0 -z-40 overflow-hidden">
        <Image
          src="/images/hero-factory.jpg"
          alt="โรงงานอุตสาหกรรมอิเล็กทรอนิกส์สมัยใหม่"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="hero-cinematic-image object-cover object-[68%_center]"
        />
      </div>

      {/* Opening black curtain */}
      <div className="hero-opening-curtain pointer-events-none absolute inset-0 z-50 bg-[#050806]" />

      {/* Dark cinematic overlays */}
      <div className="absolute inset-0 -z-30 bg-black/20" />

      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(4,9,6,0.98)_0%,rgba(5,14,9,0.92)_29%,rgba(7,24,14,0.70)_49%,rgba(6,27,15,0.28)_72%,rgba(4,12,8,0.12)_100%)]" />

      <div className="absolute inset-x-0 top-0 -z-10 h-52 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-[#050906] via-[#050906]/40 to-transparent" />

      {/* Moving ambient light */}
      <div className="hero-ambient-light pointer-events-none absolute -left-[20%] top-[15%] -z-10 h-[650px] w-[650px] rounded-full bg-[#63c174]/15 blur-[150px]" />

      <div className="hero-light-streak pointer-events-none absolute -right-[10%] top-[12%] -z-10 h-[700px] w-[230px] rotate-[24deg] bg-gradient-to-b from-transparent via-white/[0.08] to-transparent blur-[55px]" />

      {/* Fine grain */}
      <div className="hero-noise pointer-events-none absolute inset-0 z-0 opacity-[0.035]" />

      {/* Top brand line */}
      <div className="hero-fade-in absolute left-5 right-5 top-7 z-20 flex items-center justify-between sm:left-8 sm:right-8 lg:left-12 lg:right-12 xl:left-16 xl:right-16">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-white/60" />

          <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/75 sm:text-[10px]">
            GreenFactory Insight
          </p>
        </div>

        <p className="hidden text-[9px] uppercase tracking-[0.24em] text-white/45 sm:block">
          Industrial Intelligence Platform
        </p>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1600px] items-center px-5 pb-28 pt-32 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[760px] lg:ml-5 xl:ml-8">
          {/* Intro label */}
          <div className="hero-reveal hero-delay-1 flex items-center gap-4">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#a9deb3] shadow-[0_0_18px_rgba(169,222,179,0.85)]" />

            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#c5dfca]/80">
              Sustainability intelligence
            </p>
          </div>

          {/* Main heading */}
          <h1 className="mt-7 max-w-[760px]">
            <span className="hero-reveal hero-delay-2 block text-[clamp(2.8rem,5.4vw,6.2rem)] font-light leading-[0.95] tracking-[-0.06em] text-white">
              ข้อมูลที่ชัดเจน
            </span>

            <span className="hero-reveal hero-delay-3 mt-2 block text-[clamp(2.8rem,5.4vw,6.2rem)] font-light leading-[0.95] tracking-[-0.06em] text-white/95">
              เปลี่ยนอุตสาหกรรม
            </span>

            <span className="hero-reveal hero-delay-4 mt-2 block text-[clamp(2.8rem,5.4vw,6.2rem)] font-light italic leading-[0.95] tracking-[-0.055em] text-[#a9d6b1]">
              ให้ยั่งยืนกว่าเดิม
            </span>
          </h1>

          {/* Description and actions */}
          <div className="hero-reveal hero-delay-5 mt-9 flex max-w-[670px] flex-col gap-8 border-l border-white/20 pl-5 sm:pl-7 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[470px] text-[13px] font-light leading-7 text-white/68 sm:text-[15px] sm:leading-8">
              เชื่อมโยงข้อมูลจากโรงงาน เครื่องจักร เซนเซอร์
              และหน่วยงานภายในองค์กรเข้าสู่ระบบเดียว
              เพื่อการวิเคราะห์และตัดสินใจที่แม่นยำ โปร่งใส
              และตรวจสอบได้
            </p>

            <p className="hidden shrink-0 text-right text-[9px] uppercase leading-5 tracking-[0.22em] text-white/38 lg:block">
              One platform
              <br />
              Every insight
            </p>
          </div>

          {/* Buttons */}
          <div className="hero-reveal hero-delay-6 mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/features"
              className="group inline-flex min-h-[54px] items-center justify-center gap-4 rounded-full bg-white px-8 py-3 text-[12px] font-medium tracking-[0.03em] text-[#101712] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#dcebdd] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              สำรวจแพลตฟอร์ม

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#17221a] text-white transition-transform duration-500 group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>
            </Link>

            <Link
              href="/contact"
              className="group inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/25 bg-black/10 px-8 py-3 text-[12px] font-medium tracking-[0.03em] text-white backdrop-blur-md transition-all duration-500 hover:border-white/50 hover:bg-white/10"
            >
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </div>

      {/* Right-side editorial caption */}
      <div className="hero-reveal hero-delay-6 absolute bottom-28 right-12 z-20 hidden max-w-[280px] xl:block xl:right-16">
        <div className="mb-5 h-px w-full bg-gradient-to-r from-white/40 to-transparent" />

        <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/48">
          Connected industrial ecosystem
        </p>

        <p className="mt-3 text-[12px] font-light leading-6 text-white/64">
          มองเห็นประสิทธิภาพ พลังงาน ทรัพยากร
          และผลลัพธ์ด้านความยั่งยืนจากทุกส่วนขององค์กร
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="hero-reveal hero-delay-7 absolute bottom-7 left-5 z-20 flex items-center gap-4 sm:left-8 lg:left-12 xl:left-16">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20">
          <ArrowDown className="hero-scroll-arrow h-3.5 w-3.5 text-white/70" />
        </div>

        <p className="text-[8px] font-medium uppercase tracking-[0.3em] text-white/45">
          Scroll to explore
        </p>
      </div>

      {/* Current section */}
      <div className="hero-reveal hero-delay-7 absolute bottom-8 right-5 z-20 flex items-center gap-4 sm:right-8 lg:right-12 xl:right-16">
        <span className="text-[9px] text-white/75">01</span>
        <span className="h-px w-12 bg-white/30" />
        <span className="text-[9px] text-white/35">04</span>
      </div>

      <style jsx global>{`
        .hero-cinematic-image {
          animation: hero-camera-movement 16s ease-out forwards;
          transform: scale(1.1);
          will-change: transform;
        }

        .hero-opening-curtain {
          animation: hero-curtain 1.8s cubic-bezier(0.76, 0, 0.24, 1) forwards;
          animation-delay: 0.15s;
        }

        .hero-fade-in {
          opacity: 0;
          animation: hero-fade 1.2s ease forwards;
          animation-delay: 1.25s;
        }

        .hero-reveal {
          opacity: 0;
          transform: translateY(32px);
          filter: blur(8px);
          animation: hero-content-reveal 1.2s
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .hero-delay-1 {
          animation-delay: 1.15s;
        }

        .hero-delay-2 {
          animation-delay: 1.3s;
        }

        .hero-delay-3 {
          animation-delay: 1.48s;
        }

        .hero-delay-4 {
          animation-delay: 1.66s;
        }

        .hero-delay-5 {
          animation-delay: 1.86s;
        }

        .hero-delay-6 {
          animation-delay: 2.06s;
        }

        .hero-delay-7 {
          animation-delay: 2.3s;
        }

        .hero-ambient-light {
          animation: hero-ambient 10s ease-in-out infinite alternate;
        }

        .hero-light-streak {
          animation: hero-light-streak 9s ease-in-out infinite alternate;
        }

        .hero-scroll-arrow {
          animation: hero-scroll 1.8s ease-in-out infinite;
        }

        .hero-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='.8'/%3E%3C/svg%3E");
        }

        @keyframes hero-curtain {
          0% {
            opacity: 1;
          }

          65% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes hero-camera-movement {
          0% {
            transform: scale(1.14) translate3d(1.5%, 0, 0);
          }

          100% {
            transform: scale(1.04) translate3d(-1.5%, 0, 0);
          }
        }

        @keyframes hero-content-reveal {
          from {
            opacity: 0;
            transform: translateY(32px);
            filter: blur(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes hero-fade {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes hero-ambient {
          from {
            transform: translate3d(-5%, -3%, 0) scale(0.95);
            opacity: 0.55;
          }

          to {
            transform: translate3d(14%, 7%, 0) scale(1.15);
            opacity: 1;
          }
        }

        @keyframes hero-light-streak {
          from {
            transform: rotate(24deg) translate3d(-30px, -20px, 0);
            opacity: 0.35;
          }

          to {
            transform: rotate(24deg) translate3d(70px, 40px, 0);
            opacity: 0.8;
          }
        }

        @keyframes hero-scroll {
          0%,
          100% {
            transform: translateY(-2px);
            opacity: 0.45;
          }

          50% {
            transform: translateY(4px);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .hero-cinematic-image {
            object-position: 64% center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-cinematic-image,
          .hero-opening-curtain,
          .hero-fade-in,
          .hero-reveal,
          .hero-ambient-light,
          .hero-light-streak,
          .hero-scroll-arrow {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }

          .hero-opening-curtain {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}