import { cn } from "@/lib/utils";
import { CONNECTION, StatusBadge } from "@/components/data/status-badge";

/**
 * Sensor connection: ONLINE gets a lime "live" dot that pulses (DESIGN.md: lime only for live);
 * every other state is the regular status badge (icon + label, no motion).
 */
export function ConnectionBadge({ value, className }: { value: string; className?: string }) {
  if (value !== "ONLINE") {
    const [tone, label] = CONNECTION[value] ?? ["neutral", value];
    return <StatusBadge tone={tone} className={className}>{label}</StatusBadge>;
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-[#0ca30c]/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-[#0a7d0a] dark:text-status-good", className)}>
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-lime opacity-70 motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-brand-lime ring-1 ring-[#0a7d0a]/40" />
      </span>
      {CONNECTION.ONLINE[1]}
    </span>
  );
}
