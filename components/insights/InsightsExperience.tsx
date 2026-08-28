"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Expand,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Story = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  href: string;
  image: string;
  imageAlt: string;
  readTime: string;
};

type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
};

const categories = [
  "ทั้งหมด",
  "พลังงาน",
  "คาร์บอน",
  "ข้อมูล",
  "เทคโนโลยี",
];

const stories: Story[] = [
  {
    id: 1,
    category: "ข้อมูล",
    title: "โรงงานจะตัดสินใจได้เร็วขึ้น เมื่อข้อมูลไม่กระจัดกระจาย",
    excerpt:
      "การรวมข้อมูลจากเครื่องจักร เซนเซอร์ และผู้ใช้งานไว้ในระบบเดียว ช่วยให้ปัญหาที่เคยมองไม่เห็น กลายเป็นสิ่งที่จัดการได้",
    href: "/news/connected-factory-data",
    image:
      "https://images.unsplash.com/photo-1716643863806-989dd76ae093?auto=format&fit=crop&fm=jpg&q=84&w=1800",
    imageAlt: "สายการผลิตภายในโรงงานสมัยใหม่",
    readTime: "5 นาที",
  },
  {
    id: 2,
    category: "พลังงาน",
    title: "ต้นทุนพลังงานที่สูงขึ้น มักเริ่มจากสัญญาณเล็ก ๆ",
    excerpt:
      "ดูว่าข้อมูลรายเครื่องจักรและรายสายการผลิต ช่วยให้ทีมงานเห็นความผิดปกติก่อนกลายเป็นต้นทุนก้อนใหญ่ได้อย่างไร",
    href: "/news/energy-signals",
    image:
      "https://images.unsplash.com/photo-1745321633881-d2d2218911bd?auto=format&fit=crop&fm=jpg&q=84&w=1800",
    imageAlt: "แผงโซลาร์เซลล์บนหลังคาอาคารอุตสาหกรรม",
    readTime: "4 นาที",
  },
  {
    id: 3,
    category: "คาร์บอน",
    title: "การคำนวณคาร์บอนที่ดี ต้องตอบได้ว่าตัวเลขมาจากไหน",
    excerpt:
      "ผลลัพธ์ที่น่าเชื่อถือไม่ได้เกิดจากสูตรเพียงอย่างเดียว แต่เกิดจากข้อมูลต้นทางที่ตรวจสอบย้อนกลับได้",
    href: "/news/auditable-carbon",
    image:
      "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&fm=jpg&q=84&w=1800",
    imageAlt: "พลังงานแสงอาทิตย์สำหรับอาคารอุตสาหกรรม",
    readTime: "6 นาที",
  },
  {
    id: 4,
    category: "เทคโนโลยี",
    title: "แพลตฟอร์มที่ดีควรลดความซับซ้อน ไม่ใช่เพิ่มหน้าจอ",
    excerpt:
      "ระบบที่ใช้งานจริงต้องทำให้ข้อมูลสำคัญเข้าใจง่าย และไม่บังคับให้ผู้ใช้เรียนรู้โครงสร้างที่ซับซ้อนเกินความจำเป็น",
    href: "/news/platform-simplicity",
    image:
      "https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?auto=format&fit=crop&fm=jpg&q=84&w=1800",
    imageAlt: "พื้นที่ภายในโรงงานอุตสาหกรรม",
    readTime: "5 นาที",
  },
];

const galleryItems: GalleryItem[] = [
  {
    src: "https://images.unsplash.com/photo-1745321633881-d2d2218911bd?auto=format&fit=crop&fm=jpg&q=86&w=2200",
    alt: "โรงงานอุตสาหกรรมที่ใช้พลังงานแสงอาทิตย์",
    caption: "พลังงานสะอาดจะมีคุณค่ามากขึ้น เมื่อองค์กรเห็นข้อมูลการใช้งานอย่างชัดเจน",
  },
  {
    src: "https://images.unsplash.com/photo-1716643863806-989dd76ae093?auto=format&fit=crop&fm=jpg&q=86&w=2200",
    alt: "สายการผลิตในโรงงานอุตสาหกรรมสมัยใหม่",
    caption: "ข้อมูลจากหน้างานคือจุดเริ่มต้นของการตัดสินใจที่แม่นยำ",
  },
  {
    src: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&fm=jpg&q=86&w=2200",
    alt: "อาคารอุตสาหกรรมกับระบบพลังงานแสงอาทิตย์",
    caption: "เมื่อพลังงาน คาร์บอน และการผลิตอยู่ในภาพเดียวกัน องค์กรจะเห็นโอกาสได้มากกว่าเดิม",
  },
];

export default function InsightsExperience() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [activeGallery, setActiveGallery] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const filteredStories = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return stories.filter((story) => {
      const matchCategory =
        activeCategory === "ทั้งหมด" || story.category === activeCategory;

      const matchKeyword =
        keyword.length === 0 ||
        story.title.toLowerCase().includes(keyword) ||
        story.excerpt.toLowerCase().includes(keyword) ||
        story.category.toLowerCase().includes(keyword);

      return matchCategory && matchKeyword;
    });
  }, [activeCategory, query]);

  const moveGallery = (direction: number) => {
    const next =
      (activeGallery + direction + galleryItems.length) % galleryItems.length;

    setActiveGallery(next);

    if (galleryRef.current) {
      galleryRef.current.scrollTo({
        left: next * galleryRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") moveGallery(1);
      if (event.key === "ArrowLeft") moveGallery(-1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, activeGallery]);

  return (
    <main className="overflow-x-clip bg-[#f4f5f1] text-[#18231c]">
      {/* Hero */}
      <section className="px-5 pb-14 pt-36 sm:px-8 sm:pt-40 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[1fr_430px] lg:items-end">
            <div className="max-w-[790px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4c7659]">
                GreenFactory Insights
              </p>

              <h1 className="mt-5 text-[clamp(2.9rem,5.4vw,5.8rem)] font-medium leading-[1.01] tracking-[-0.058em]">
                มุมมองใหม่
                <span className="block text-[#4f7f5e]">
                  สำหรับโรงงานที่ขับเคลื่อนด้วยข้อมูล
                </span>
              </h1>

              <p className="mt-6 max-w-[640px] text-[14px] leading-8 text-[#69766d] sm:text-[15px]">
                บทความสั้น ภาพจริง และแนวคิดที่ช่วยให้เห็นว่า
                ข้อมูลที่ดีสามารถเปลี่ยนการทำงานขององค์กรได้อย่างไร
              </p>
            </div>

            <div>
              <label
                htmlFor="insights-search"
                className="mb-3 block text-[10px] font-medium text-[#68766d]"
              >
                ค้นหาหัวข้อที่สนใจ
              </label>

              <div className="flex h-[56px] items-center gap-3 rounded-full border border-[#243f2d]/12 bg-white px-5 shadow-[0_15px_38px_rgba(25,57,36,0.06)]">
                <Search className="h-[18px] w-[18px] text-[#4f7a5e]" />
                <input
                  id="insights-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="พลังงาน คาร์บอน ข้อมูล..."
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#9aa39d]"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="ล้างคำค้นหา"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#748078] hover:bg-[#edf1ed]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured editorial */}
      <section className="px-5 pb-16 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href={stories[0].href}
            className="group relative block min-h-[560px] overflow-hidden rounded-[30px] bg-[#102218] sm:min-h-[650px]"
          >
            <img
              src={stories[0].image}
              alt={stories[0].imageAlt}
              className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-[1.02]"
            />

            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,18,12,0.88)_0%,rgba(8,18,12,0.58)_46%,rgba(8,18,12,0.08)_78%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />

            <div className="relative flex min-h-[560px] max-w-[720px] flex-col justify-end p-7 text-white sm:min-h-[650px] sm:p-10 lg:p-14">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/62">
                เรื่องเด่น · {stories[0].category}
              </p>

              <h2 className="mt-5 text-[clamp(2.3rem,4.4vw,5rem)] font-medium leading-[1.05] tracking-[-0.05em]">
                {stories[0].title}
              </h2>

              <p className="mt-5 max-w-[600px] text-[13px] leading-7 text-white/68 sm:text-[14px]">
                {stories[0].excerpt}
              </p>

              <div className="mt-8 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 text-[11px] font-medium">
                  เปิดบทความ
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>

                <span className="h-4 w-px bg-white/25" />

                <span className="flex items-center gap-2 text-[10px] text-white/52">
                  <Clock3 className="h-3.5 w-3.5" />
                  {stories[0].readTime}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Filter */}
      <section className="sticky top-[70px] z-20 border-y border-[#203c2b]/10 bg-[#f4f5f1]/92 px-5 backdrop-blur-xl sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex min-h-[70px] max-w-[1400px] items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-[12px] font-medium transition ${
                activeCategory === category
                  ? "bg-[#1f7548] text-white"
                  : "border border-[#263f2f]/10 bg-white text-[#617067] hover:text-[#296642]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Stories */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-24 xl:px-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d795b]">
              Latest perspectives
            </p>
            <h2 className="mt-3 text-[clamp(2rem,3vw,3.2rem)] font-medium tracking-[-0.045em]">
              อ่านต่อแบบไม่เสียเวลา
            </h2>
          </div>

          {filteredStories.length > 0 ? (
            <div className="divide-y divide-[#203c2b]/10 border-y border-[#203c2b]/10">
              {filteredStories.map((story, index) => (
                <Link
                  key={story.id}
                  href={story.href}
                  className="group grid gap-6 py-8 md:grid-cols-[220px_1fr_auto] md:items-center lg:grid-cols-[300px_1fr_auto]"
                >
                  <div className="h-[170px] overflow-hidden rounded-[18px]">
                    <img
                      src={story.image}
                      alt={story.imageAlt}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="max-w-[700px]">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4d785a]">
                      {story.category}
                    </p>

                    <h3 className="mt-3 text-[22px] font-medium leading-8 tracking-[-0.03em] sm:text-[25px]">
                      {story.title}
                    </h3>

                    <p className="mt-3 text-[12px] leading-6 text-[#748078] sm:text-[13px]">
                      {story.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end md:gap-12">
                    <span className="text-[10px] text-[#89938c]">
                      {story.readTime}
                    </span>

                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#294432]/12 bg-white text-[#39734e] transition group-hover:bg-[#1f7548] group-hover:text-white">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#2e593d]/20 bg-white px-6 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[#577f63]" />
              <p className="mt-5 text-[15px] font-medium">
                ไม่พบเนื้อหาที่ตรงกับคำค้น
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Full-width editorial statement */}
      <section className="relative min-h-[620px] overflow-hidden bg-[#0d1b13]">
        <img
          src="https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?auto=format&fit=crop&fm=jpg&q=86&w=2400"
          alt="โรงงานอุตสาหกรรมขนาดใหญ่"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/52" />

        <div className="relative mx-auto flex min-h-[620px] max-w-[1400px] items-end px-5 pb-16 pt-28 text-white sm:px-8 sm:pb-20 lg:px-12 xl:px-16">
          <div className="max-w-[850px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              A clearer industrial future
            </p>

            <h2 className="mt-5 text-[clamp(2.6rem,5.5vw,6rem)] font-medium leading-[1.02] tracking-[-0.06em]">
              โรงงานไม่จำเป็นต้องมีข้อมูลมากขึ้น
              <span className="block text-white/64">
                แค่ต้องเห็นข้อมูลที่สำคัญให้ชัดขึ้น
              </span>
            </h2>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-24 xl:px-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d795b]">
                Visual journal
              </p>
              <h2 className="mt-3 text-[clamp(2rem,3vw,3.2rem)] font-medium tracking-[-0.045em]">
                มองอุตสาหกรรมผ่านภาพ
              </h2>
            </div>

            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => moveGallery(-1)}
                aria-label="ภาพก่อนหน้า"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#274231]/12 hover:bg-[#edf2ed]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => moveGallery(1)}
                aria-label="ภาพถัดไป"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#274231]/12 hover:bg-[#edf2ed]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={galleryRef}
            onScroll={() => {
              const element = galleryRef.current;
              if (!element) return;
              setActiveGallery(
                Math.round(element.scrollLeft / element.clientWidth),
              );
            }}
            className="flex snap-x snap-mandatory overflow-x-auto rounded-[28px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {galleryItems.map((item, index) => (
              <button
                type="button"
                key={item.src}
                onClick={() => {
                  setActiveGallery(index);
                  setLightboxOpen(true);
                }}
                className="group relative min-w-full snap-center overflow-hidden text-left"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-[440px] w-full object-cover transition duration-800 group-hover:scale-[1.015] sm:h-[560px]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-transparent to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 text-white sm:p-9">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.17em] text-white/55">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(galleryItems.length).padStart(2, "0")}
                    </p>
                    <p className="mt-3 max-w-[760px] text-[21px] font-medium leading-8 sm:text-[28px]">
                      {item.caption}
                    </p>
                  </div>

                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/10 backdrop-blur-md transition group-hover:bg-white group-hover:text-[#18231c]">
                    <Expand className="h-[18px] w-[18px]" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 flex justify-center gap-1.5">
            {galleryItems.map((item, index) => (
              <button
                key={item.src}
                type="button"
                onClick={() => {
                  setActiveGallery(index);
                  if (galleryRef.current) {
                    galleryRef.current.scrollTo({
                      left: index * galleryRef.current.clientWidth,
                      behavior: "smooth",
                    });
                  }
                }}
                aria-label={`ไปยังภาพที่ ${index + 1}`}
                className={`h-1 rounded-full transition-all ${
                  activeGallery === index
                    ? "w-9 bg-[#1f7548]"
                    : "w-4 bg-[#cbd4cc]"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="แกลเลอรีภาพ"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/94 p-4 sm:p-7"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="ปิดแกลเลอรี"
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md hover:bg-white hover:text-black"
          >
            <X className="h-[18px] w-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => moveGallery(-1)}
            aria-label="ภาพก่อนหน้า"
            className="absolute left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md hover:bg-white hover:text-black sm:left-7"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <figure className="flex h-full w-full max-w-[1500px] flex-col items-center justify-center">
            <img
              src={galleryItems[activeGallery].src}
              alt={galleryItems[activeGallery].alt}
              className="max-h-[82vh] max-w-full object-contain"
            />

            <figcaption className="mt-5 max-w-[780px] text-center text-[13px] leading-6 text-white/70">
              {galleryItems[activeGallery].caption}
            </figcaption>
          </figure>

          <button
            type="button"
            onClick={() => moveGallery(1)}
            aria-label="ภาพถัดไป"
            className="absolute right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md hover:bg-white hover:text-black sm:right-7"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </main>
  );
}
