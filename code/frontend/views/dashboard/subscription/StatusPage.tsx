import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

export function StatusPage({
  icon,
  iconClassName,
  title,
  children,
  actions,
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg px-6 py-10 text-center sm:px-10">
          <div
            className={cn(
              "mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full",
              iconClassName
            )}
          >
            {icon}
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{actions}</div>
        </Card>
      </main>
    </div>
  );
}

export const primaryLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700";
export const secondaryLinkClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50";
