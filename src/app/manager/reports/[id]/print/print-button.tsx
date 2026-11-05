"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Opens the print dialog once on load; the button reopens it. */
export function PrintButton() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);
  return <Button onClick={() => window.print()}><Printer /> พิมพ์ / บันทึกเป็น PDF</Button>;
}
