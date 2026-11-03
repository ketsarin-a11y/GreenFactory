"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar,
} from "@/components/ui/sidebar";
import type { Role } from "@/server/auth/roles";
import { LogoMark, Logo } from "./logo";
import { NAV } from "./nav-config";

export function AppSidebar({ role, orgName }: { role: Role; orgName: string }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 px-3 pt-4">
        <Link href="/" className="flex h-11 items-center justify-center rounded-lg bg-white px-3 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-0" aria-label="GreenFactory Insight">
          <Logo className="w-[156px] group-data-[collapsible=icon]:hidden" />
          <LogoMark className="hidden w-5 group-data-[collapsible=icon]:block" />
        </Link>
        <p className="truncate px-1 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">{orgName}</p>
      </SidebarHeader>
      <SidebarContent>
        {NAV[role].map((group, i) => (
          <SidebarGroup key={group.label ?? i}>
            {group.label && <SidebarGroupLabel className="text-sidebar-foreground/50">{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="relative data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-white data-[active=true]:before:absolute data-[active=true]:before:inset-y-1.5 data-[active=true]:before:-left-2 data-[active=true]:before:w-1 data-[active=true]:before:rounded-full data-[active=true]:before:bg-brand-lime"
                      >
                        <Link href={item.href} onClick={() => setOpenMobile(false)} aria-current={active ? "page" : undefined}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="px-4 pb-4 text-[11px] text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
        Data drives better decisions
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
