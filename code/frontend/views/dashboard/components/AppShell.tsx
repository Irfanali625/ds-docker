"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconChevronDown,
  IconHistory,
  IconLogout,
  IconPhoneCheck,
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

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
          {initials(user?.name)}
        </span>
        <span className="hidden max-w-[160px] truncate text-sm font-medium text-slate-700 sm:block">
          {user?.name}
        </span>
        <IconChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-overlay"
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

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
          <Link href="/dashboard" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden h-full items-center gap-1 md:flex" aria-label="Main">
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "relative flex h-full items-center px-3 text-sm font-medium transition-colors",
                  isActive(href) ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600" />
                )}
              </Link>
            ))}
          </nav>

          <div className="ml-auto">
            <UserMenu />
          </div>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto border-t border-slate-100 px-2 md:hidden"
          aria-label="Main"
        >
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
