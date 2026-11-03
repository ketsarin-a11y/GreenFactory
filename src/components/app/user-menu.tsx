"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/server/actions/auth";

export function UserMenu(props: { name: string; email: string; roleLabel: string; avatarUrl: string | null; profileHref: string }) {
  const initials = props.name.trim().slice(0, 2);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="เมนูผู้ใช้">
        <Avatar className="size-8">
          {props.avatarUrl && <AvatarImage src={props.avatarUrl} alt="" />}
          <AvatarFallback className="bg-accent text-xs font-medium text-accent-foreground">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium">{props.name}</span>
          <span className="block text-xs text-muted-foreground">{props.roleLabel}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{props.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{props.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={props.profileHref}>
            <User /> โปรไฟล์ของฉัน
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOut /> ออกจากระบบ
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
