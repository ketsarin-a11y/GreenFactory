import { cn } from "@/lib/utils";

/** Machine/checkpoint/QR code as a small stamped nameplate (DESIGN.md), not monospace text. */
export function Nameplate({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-[5px] border border-border bg-background px-1.5 py-px font-display text-[11px] leading-4 font-medium text-muted-foreground tabular", className)}>
      {children}
    </span>
  );
}
