import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return <Image src="/images/logo-wide.png" alt="GreenFactory Insight" width={1420} height={300} priority className={cn("h-auto w-[168px]", className)} />;
}

export function LogoMark({ className }: { className?: string }) {
  return <Image src="/images/logo-mark.png" alt="" width={390} height={300} loading="eager" className={cn("h-auto w-7", className)} />;
}
