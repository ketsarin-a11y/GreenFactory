import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { CurrentUser } from "@/server/auth/current-user";
import { ROLE_LABEL } from "@/server/auth/roles";
import { AppSidebar } from "./app-sidebar";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme";

const PROFILE: Record<CurrentUser["role"], string> = {
  OPERATOR: "/operator/profile",
  MANAGER: "/manager/profile",
  COMPANY_ADMIN: "/company/profile",
  PLATFORM_ADMIN: "/platform/settings",
};

export function AppShell({ user, context, actions, children }: {
  user: CurrentUser;
  /** Shown in the top bar: the factory/company being viewed. */
  context?: { primary: string; secondary?: string };
  /** Extra top-bar controls (alerts bell…). */
  actions?: ReactNode;
  children: ReactNode;
}) {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return (
    <SidebarProvider>
      <AppSidebar role={user.role} orgName={user.companyName ?? "GreenFactory Platform"} />
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-6">
          <SidebarTrigger className="-ml-1" aria-label="เปิด/ปิดเมนู" />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <p className="flex min-w-0 items-baseline gap-2 truncate text-sm">
            <span className="truncate font-medium">{context?.primary ?? user.companyName ?? "GreenFactory Platform"}</span>
            {context?.secondary && <span className="hidden truncate text-muted-foreground md:inline">{context.secondary}</span>}
          </p>
          <div className="ml-auto flex items-center gap-2">
            {actions}
            <ThemeToggle />
            <UserMenu
              name={name || user.email}
              email={user.email}
              roleLabel={ROLE_LABEL[user.role]}
              avatarUrl={user.avatarPath ? `/api/files/avatar/${user.id}` : null}
              profileHref={PROFILE[user.role]}
            />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
