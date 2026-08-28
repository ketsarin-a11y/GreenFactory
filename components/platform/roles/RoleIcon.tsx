import {
  Factory,
  Leaf,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Role } from "./types";

export default function RoleIcon({
  role,
  size = "md",
}: {
  role: Role;
  size?: "md" | "sm";
}) {
  const Icon =
    role.icon === "shield"
      ? ShieldCheck
      : role.icon === "users"
        ? Users
        : role.icon === "factory"
          ? Factory
          : Leaf;

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${role.tone.iconBg} ${role.tone.iconText} ${
        size === "md" ? "h-11 w-11" : "h-8 w-8"
      }`}
    >
      <Icon className={size === "md" ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2} />
    </span>
  );
}
