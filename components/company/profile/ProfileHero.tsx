"use client";

import { Camera, CheckCircle2, Save } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  companyName: string;
  factoryName: string;
  onSave: () => void;
  saved: boolean;
};

export default function ProfileHero({
  firstName,
  lastName,
  email,
  position,
  companyName,
  factoryName,
  onSave,
  saved,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "CA";

  function handleFile(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
  }

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#dce9e1] bg-white px-6 py-6 shadow-[0_18px_52px_rgba(30,73,46,0.07)] sm:px-7">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#daf7e5] blur-3xl" />
      <div className="absolute -bottom-24 right-48 h-52 w-52 rounded-full bg-[#e7efff] blur-3xl" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            {preview ? (
              <img
                src={preview}
                alt="รูปโปรไฟล์"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-[0_10px_28px_rgba(38,92,58,0.15)]"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#d8f7e4] via-[#dcecff] to-[#e8dcff] text-[26px] font-extrabold text-[#176c48] ring-4 ring-white shadow-[0_10px_28px_rgba(38,92,58,0.15)]">
                {initials}
              </div>
            )}

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#167c4d] text-white shadow-lg hover:bg-[#126b42]"
              aria-label="เปลี่ยนรูปโปรไฟล์"
            >
              <Camera className="h-4 w-4" />
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>

          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#1d8a57]">
              My Profile
            </p>
            <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.03em] text-[#26362d]">
              {firstName} {lastName}
            </h1>
            <p className="mt-1 text-[14px] font-bold text-[#4f6157]">
              {position}
            </p>
            <p className="mt-2 text-[12px] text-[#7e8b83]">
              {companyName} · {factoryName}
            </p>
            <p className="mt-1 text-[12px] text-[#8b9890]">{email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#167c4d] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(22,124,77,0.2)] transition hover:-translate-y-0.5 hover:bg-[#126b42]"
        >
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              บันทึกเรียบร้อย
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              บันทึกการเปลี่ยนแปลง
            </>
          )}
        </button>
      </div>
    </section>
  );
}
