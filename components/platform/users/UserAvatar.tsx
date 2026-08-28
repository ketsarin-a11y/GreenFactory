"use client";

import { useState } from "react";
import type { UserRow } from "./types";

export default function UserAvatar({
  user,
  size = "md",
}: {
  user: UserRow;
  size?: "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-[#eef1f4] ring-1 ring-[#e1e5e8] ${
        size === "lg" ? "h-20 w-20" : "h-10 w-10"
      }`}
    >
      {user.avatarUrl && !failed ? (
        <img
          src={user.avatarUrl}
          alt={`${user.firstName} ${user.lastName}`}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[#eef3f8] text-[12px] font-bold text-[#587087]">
          {initials}
        </div>
      )}

      {user.status === "ACTIVE" && (
        <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-[#18a978] ring-2 ring-white" />
      )}
    </div>
  );
}
