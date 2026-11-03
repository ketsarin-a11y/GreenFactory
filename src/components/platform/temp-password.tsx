"use client";

import { useState } from "react";
import { Copy, Dices } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** 12 chars from an unambiguous alphabet, always with letters and digits (passes passwordProblem). */
function generate() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = letters + digits;
  const rnd = crypto.getRandomValues(new Uint32Array(12));
  const chars = Array.from(rnd, (n, i) => (i === 0 ? letters : i === 1 ? digits : all)[n % (i === 0 ? letters.length : i === 1 ? digits.length : all.length)]);
  return chars.sort(() => (crypto.getRandomValues(new Uint8Array(1))[0] > 127 ? 1 : -1)).join("");
}

/** Temporary password input with generate + copy, so the admin can hand it over. */
export function TempPasswordInput({ id, name, value, onChange, onGenerate, invalid }: {
  id: string;
  name: string;
  value?: string;
  onChange?: (v: string) => void;
  /** Called with a generated password (e.g. to fill a confirm field too). */
  onGenerate?: (v: string) => void;
  invalid?: boolean;
}) {
  const [own, setOwn] = useState("");
  const v = value ?? own;
  const set = onChange ?? setOwn;
  return (
    <div className="flex gap-2">
      <Input id={id} name={name} value={v} onChange={(e) => set(e.target.value)} autoComplete="new-password" className="h-10 font-mono" aria-invalid={invalid} required minLength={8} />
      <Button type="button" variant="outline" className="h-10" onClick={() => {
          const g = generate();
          set(g);
          onGenerate?.(g);
        }}>
        <Dices /> สุ่ม
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        className="size-10"
        disabled={!v}
        aria-label="คัดลอกรหัสผ่าน"
        onClick={() => navigator.clipboard.writeText(v).then(() => toast.success("คัดลอกรหัสผ่านแล้ว"))}
      >
        <Copy />
      </Button>
    </div>
  );
}
