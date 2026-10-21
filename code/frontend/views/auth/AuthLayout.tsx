import { ReactNode } from "react";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";
import { Logo } from "@/components/ui/Logo";

const highlights = [
  "Check a single number, a pasted list, or a CSV of up to 10,000 rows",
  "See which numbers are valid, invalid, or could not be checked",
  "Download every run as a CSV from your history",
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-slate-900 p-10 lg:flex xl:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <Link href="/" className="relative">
          <Logo inverted />
        </Link>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white">
            Phone number validation for B2B and B2C contact lists.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                  <IconCheck className="h-3.5 w-3.5" stroke={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Valid Number Check
        </p>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="px-6 pt-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <p className="mt-8 text-center text-sm text-slate-500">{footer}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
