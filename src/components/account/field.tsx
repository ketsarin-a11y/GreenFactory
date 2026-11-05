import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/** Label above, control, then helper or error below (DESIGN.md forms). */
export function Field({ id, label, error, hint, children, required }: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-status-critical" aria-hidden> *</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-status-critical">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
