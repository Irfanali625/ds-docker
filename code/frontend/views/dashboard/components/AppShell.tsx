"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconChevronDown,
  IconChevronRight,
  IconHistory,
  IconLogout,
  IconPhoneCheck,
  IconPlus,
  IconSelector,
  IconSettings,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/components/ui/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Validate", icon: IconPhoneCheck },
  { href: "/dashboard/history", label: "History", icon: IconHistory },
  { href: "/dashboard/settings", label: "Settings", icon: IconSettings },
];

function initials(name?: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function UserMenu({ variant }: { variant: "sidebar" | "header" }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inSidebar = variant === "sidebar";

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          inSidebar ? "w-full p-2 text-left hover:bg-white hover:shadow-card hover:ring-1 hover:ring-slate-200" : "py-1 pl-1 pr-2 hover:bg-slate-100",
          inSidebar && open && "bg-white shadow-card ring-1 ring-slate-200"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
          {initials(user?.name)}
        </span>
        {inSidebar ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900">{user?.name}</span>
              <span className="block truncate text-xs text-slate-500">{user?.email}</span>
            </span>
            <IconSelector className="h-4 w-4 shrink-0 text-slate-400" />
          </>
        ) : (
          <IconChevronDown
            className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")}
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-overlay",
            inSidebar ? "inset-x-0 bottom-full mb-2" : "right-0 top-full mt-2 w-64"
          )}
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="truncate text-sm text-slate-500">{user?.email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <IconSettings className="h-4 w-4 text-slate-400" />
              Account settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <IconLogout className="h-4 w-4 text-slate-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {loading && <Spinner className="h-6 w-6 text-slate-400" />}
      </div>
    );
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : !!pathname?.startsWith(href);
  const current = NAV_ITEMS.find((item) => isActive(item.href));

  return (
    <div className="min-h-screen bg-white lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-slate-50/70 lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-white text-slate-900 shadow-card ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn("h-[18px] w-[18px]", isActive(href) ? "text-brand-600" : "text-slate-400")}
                stroke={1.75}
              />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <UserMenu variant="sidebar" />
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <UserMenu variant="header" />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 sm:px-4" aria-label="Main">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium",
                isActive(href)
                  ? "border-brand-600 text-slate-900"
                  : "border-transparent text-slate-500"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="sticky top-0 z-20 hidden h-16 border-b border-slate-200 bg-white/90 backdrop-blur lg:block">
        <div className="flex h-full items-center justify-between px-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Workspace</span>
            <IconChevronRight className="h-3.5 w-3.5 text-slate-300" stroke={2} />
            <span className="font-medium text-slate-900">{current?.label}</span>
          </nav>
          {pathname !== "/dashboard" && (
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
            >
              <IconPlus className="h-4 w-4" stroke={2} />
              New validation
            </Link>
          )}
        </div>
      </div>

      <main className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
