"use client";

import { Factory, ImageUp, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export default function FactoryLogoCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function removeImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="rounded-[22px] border border-[#e1eae4] bg-white p-5 shadow-[0_12px_36px_rgba(30,73,46,0.055)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-[18px] font-extrabold text-[#26362d]">
          โลโก้โรงงาน
        </h2>
        <p className="mt-1 text-[12px] text-[#819087]">
          รองรับ JPG, PNG และ WebP ขนาดไม่เกิน 5 MB
        </p>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className="flex min-h-[180px] items-center justify-center rounded-[18px] border border-dashed border-[#cfdcd4] bg-[#f8fbf9] p-5"
      >
        {preview ? (
          <img
            src={preview}
            alt="ตัวอย่างโลโก้โรงงาน"
            className="max-h-[140px] max-w-full rounded-[16px] object-contain"
          />
        ) : (
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#e7f7ed] text-[#168451]">
              <Factory className="h-8 w-8" />
            </span>
            <p className="mt-4 text-[13px] font-bold text-[#56665d]">
              ลากไฟล์มาวาง หรือเลือกไฟล์จากเครื่อง
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => handleFile(event.target.files?.[0])}
        className="hidden"
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#b9dbc8] bg-[#f2faf5] text-[12px] font-bold text-[#168451] transition hover:bg-[#e8f6ee]"
        >
          <ImageUp className="h-4 w-4" />
          {preview ? "เปลี่ยนโลโก้" : "เลือกไฟล์"}
        </button>

        <button
          type="button"
          onClick={removeImage}
          disabled={!preview}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#f0c5c5] bg-[#fff7f7] text-[12px] font-bold text-[#cb4d4d] transition hover:bg-[#fff0f0] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Trash2 className="h-4 w-4" />
          ลบโลโก้
        </button>
      </div>
    </section>
  );
}
