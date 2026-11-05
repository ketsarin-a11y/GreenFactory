"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/server/actions/_action";

/**
 * Calls a server action, shows a toast, and exposes field errors for the form.
 * `run` resolves to the result so callers can close dialogs on success.
 */
export function useAction<I, T>(fn: (input: I) => Promise<ActionResult<T>>, opts?: { success?: string | ((data: T) => string) }) {
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const run = (input: I) =>
    new Promise<ActionResult<T>>((resolve) =>
      start(async () => {
        let r: ActionResult<T>;
        try {
          r = await fn(input);
        } catch {
          // Network error, body too large, server crash: keep the form and tell the user.
          r = { ok: false, message: "ส่งข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่" };
        }
        if (r.ok) {
          setErrors({});
          const msg = typeof opts?.success === "function" ? opts.success(r.data) : opts?.success;
          if (msg) toast.success(msg);
        } else {
          setErrors(r.fieldErrors ?? {});
          toast.error(r.message);
        }
        resolve(r);
      }),
    );
  return { run, pending, errors };
}
