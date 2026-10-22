import Link from "next/link";
import { ReactNode } from "react";
import {
  IconArrowRight,
  IconBuildingSkyscraper,
  IconCheck,
  IconChevronRight,
  IconChevronDown,
  IconCopyOff,
  IconCreditCard,
  IconDatabase,
  IconDownload,
  IconFileSpreadsheet,
  IconFileUpload,
  IconHistory,
  IconList,
  IconLock,
  IconPhone,
  IconPhoneCall,
  IconPhoneCheck,
  IconSearch,
  IconSettings,
  IconSpeakerphone,
  IconUserSearch,
  IconWorld,
} from "@tabler/icons-react";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import { MAX_BULK_NUMBERS, MAX_CSV_ROWS } from "@/types/phoneValidation";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const TRUST = [
  { icon: IconWorld, label: "Live carrier lookups" },
  { icon: IconLock, label: "Encrypted in transit" },
  { icon: IconCreditCard, label: "Payments by Square" },
  { icon: IconDownload, label: "Export results anytime" },
];

const EXTRAS = [
  {
    icon: IconBuildingSkyscraper,
    title: "B2B and B2C lists",
    body: "Tag every run as business or consumer so your lists stay organised.",
  },
  {
    icon: IconCopyOff,
    title: "Duplicates removed",
    body: "Repeated numbers and rows without a phone number are skipped automatically.",
  },
  {
    icon: IconWorld,
    title: "International formats",
    body: "Numbers with a country code, plus 10-digit US and Canadian numbers in any style.",
  },
  {
    icon: IconCheck,
    title: "Honest results",
    body: "Valid, invalid, or not checked. We never guess when a lookup could not complete.",
  },
];

const USE_CASES = [
  {
    icon: IconPhoneCall,
    title: "Sales teams",
    body: "Spend dialing time on prospects you can actually reach.",
  },
  {
    icon: IconSpeakerphone,
    title: "Marketing",
    body: "Clean SMS and call lists before every campaign goes out.",
  },
  {
    icon: IconUserSearch,
    title: "Recruiting",
    body: "Confirm candidate contact details before you reach out.",
  },
  {
    icon: IconDatabase,
    title: "Data operations",
    body: "Keep CRM records accurate as lists grow and age.",
  },
];

const STEPS = [
  {
    title: "Create an account",
    body: "Sign up with your email in under a minute. No card required to start.",
  },
  {
    title: "Add your numbers",
    body: "Type a single number, paste a list, or upload a CSV exported from your CRM.",
  },
  {
    title: "Export clean data",
    body: "Review valid, invalid and unchecked numbers, then download the results as a CSV.",
  },
];

const FAQ = [
  {
    q: "How are numbers validated?",
    a: "Each number is checked against live carrier lookup data, so you know whether it is a real, assignable number rather than just correctly formatted.",
  },
  {
    q: "What does “Not checked” mean?",
    a: "It means the lookup could not be completed, for example because of a temporary provider issue. We report it separately instead of marking the number invalid.",
  },
  {
    q: "What format should my CSV be in?",
    a: "Any CSV with a header row. We read the column named phone, mobile or similar, and fall back to the first column. Files can be up to 10 MB.",
  },
  {
    q: "Which number formats are supported?",
    a: "International numbers with a country code, like +44 20 7946 0958, and 10-digit US and Canadian numbers in any common format.",
  },
  {
    q: "Can I download my past results?",
    a: "Yes. Every run is saved to your history, and you can download the full results as a CSV at any time.",
  },
];

type Tone = "success" | "danger" | "warning";

const PREVIEW_ROWS: { number: string; e164?: string; national?: string; country?: string; tone: Tone; label: string }[] = [
  { number: "14155552671", e164: "+14155552671", national: "(415) 555-2671", country: "US", tone: "success", label: "Valid" },
  { number: "442071838750", e164: "+442071838750", national: "020 7183 8750", country: "GB", tone: "success", label: "Valid" },
  { number: "12125550147", country: "US", tone: "danger", label: "Invalid" },
  { number: "61293744000", e164: "+61293744000", national: "(02) 9374 4000", country: "AU", tone: "success", label: "Valid" },
  { number: "16465550123", tone: "warning", label: "Not checked" },
];

function GridBackdrop({ className, dark }: { className?: string; dark?: boolean }) {
  const line = dark ? "white" : "rgb(15 23 42)";
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }}
    />
  );
}

function CtaLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "inverted" | "outline-dark";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        variant === "primary" && "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
        variant === "secondary" &&
          "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
        variant === "inverted" && "bg-white text-slate-900 hover:bg-slate-100",
        variant === "outline-dark" && "border border-white/20 text-white hover:bg-white/10",
        className
      )}
    >
      {children}
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.5rem] sm:leading-[1.15]">
        {title}
      </h2>
      {body && <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{body}</p>}
    </div>
  );
}

/* ------------------------------ Hero preview ----------------------------- */

function MiniSegmented({ options, active, size = "md" }: { options: ReactNode[]; active: number; size?: "sm" | "md" }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1">
      {options.map((option, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md font-medium",
            size === "sm" ? "h-6 px-2.5 text-[11px]" : "h-7 px-3 text-xs",
            i === active ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600"
          )}
        >
          {option}
        </span>
      ))}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div
        aria-hidden="true"
        className="absolute inset-x-10 -top-10 bottom-10 -z-10 rounded-[3rem] bg-brand-200/50 blur-3xl"
      />
      <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-1.5 shadow-overlay ring-1 ring-slate-900/[0.03] backdrop-blur sm:p-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            </div>
            <div className="mx-auto flex h-6 w-full max-w-xs items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white text-[11px] text-slate-500">
              <IconLock className="h-3 w-3" stroke={2} />
              validnumbercheck.app/dashboard
            </div>
            <div className="w-[42px]" />
          </div>

          <div className="flex text-left">
            <aside className="hidden w-52 shrink-0 flex-col border-r border-slate-200 bg-slate-50/70 md:flex">
              <div className="flex h-12 items-center border-b border-slate-200 px-4">
                <Logo className="[&>span:first-child]:h-6 [&>span:first-child]:w-6 [&>span:last-child]:text-[13px]" />
              </div>
              <div className="flex-1 space-y-1 px-2.5 py-3">
                <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Workspace
                </p>
                {[
                  { icon: IconPhoneCheck, label: "Validate", active: true },
                  { icon: IconHistory, label: "History" },
                  { icon: IconSettings, label: "Settings" },
                ].map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium",
                      active ? "bg-white text-slate-900 shadow-card ring-1 ring-slate-200" : "text-slate-600"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-brand-600" : "text-slate-400")} stroke={1.75} />
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-slate-200 p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-800">
                  AM
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-slate-900">Alex Morgan</span>
                  <span className="block truncate text-[10px] text-slate-500">alex@company.com</span>
                </span>
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="hidden h-12 items-center gap-1.5 border-b border-slate-200 px-5 text-xs md:flex">
                <span className="text-slate-500">Workspace</span>
                <IconChevronRight className="h-3 w-3 text-slate-300" stroke={2} />
                <span className="font-medium text-slate-900">Validate</span>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <div>
                  <p className="text-base font-semibold tracking-tight text-slate-900">Validate phone numbers</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Check numbers against carrier records. Every run is saved to your history.
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 px-3 py-2.5 shadow-card sm:flex-row sm:items-center sm:justify-between">
                  <MiniSegmented
                    active={2}
                    options={[
                      <><IconPhone className="hidden h-3.5 w-3.5 sm:block" stroke={1.75} />Single number</>,
                      <><IconList className="hidden h-3.5 w-3.5 sm:block" stroke={1.75} />Paste a list</>,
                      <><IconFileUpload className="hidden h-3.5 w-3.5 sm:block" stroke={1.75} />Upload CSV</>,
                    ]}
                  />
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="text-xs font-medium text-slate-700">List type</span>
                    <MiniSegmented active={0} options={["B2B", "B2C"]} />
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 shadow-card">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">Results</p>
                      <p className="truncate text-[11px] text-slate-500">
                        B2B list, checked Oct 21, 2026, 8:02 PM. 214 duplicates removed.
                      </p>
                    </div>
                    <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm">
                      <IconDownload className="h-3.5 w-3.5" stroke={2} />
                      Download CSV
                    </span>
                  </div>

                  <div className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4 sm:divide-x sm:divide-slate-200">
                    {[
                      { label: "Total", value: "9,652", color: "text-slate-900" },
                      { label: "Valid", value: "8,412", color: "text-emerald-600" },
                      { label: "Invalid", value: "1,203", color: "text-red-600" },
                      { label: "Not checked", value: "37", color: "text-amber-600" },
                    ].map((stat) => (
                      <div key={stat.label} className="px-4 py-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
                        <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", stat.color)}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-b border-slate-200 px-4 py-2.5">
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <span className="bg-emerald-500" style={{ width: "87.2%" }} />
                      <span className="bg-red-500" style={{ width: "12.4%" }} />
                      <span className="bg-amber-400" style={{ width: "0.4%" }} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      {[
                        { label: "Valid", pct: "87%", dot: "bg-emerald-500" },
                        { label: "Invalid", pct: "12%", dot: "bg-red-500" },
                        { label: "Not checked", pct: "0%", dot: "bg-amber-400" },
                      ].map((s) => (
                        <span key={s.label} className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                          {s.label}
                          <span className="font-medium text-slate-700">{s.pct}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-slate-200 px-4 py-2">
                    <MiniSegmented size="sm" active={0} options={["All", "Valid", "Invalid", "Not checked"]} />
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:grid-cols-[1fr_0.8fr_1fr_1fr_0.4fr]">
                    <span>Number</span>
                    <span>Status</span>
                    <span className="hidden sm:block">E.164</span>
                    <span className="hidden sm:block">National format</span>
                    <span className="hidden sm:block">Country</span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {PREVIEW_ROWS.map((row) => (
                      <li
                        key={row.number}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 sm:grid-cols-[1fr_0.8fr_1fr_1fr_0.4fr]"
                      >
                        <span className="truncate font-mono text-xs text-slate-900">{row.number}</span>
                        <span>
                          <Badge tone={row.tone} dot>
                            {row.label}
                          </Badge>
                        </span>
                        <Cell value={row.e164} mono />
                        <Cell value={row.national} />
                        <Cell value={row.country} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({ value, mono }: { value?: string; mono?: boolean }) {
  return (
    <span className={cn("hidden truncate text-xs text-slate-600 sm:block", mono && "font-mono")}>
      {value || <span className="text-slate-300">None</span>}
    </span>
  );
}

/* ---------------------------- Feature visuals ---------------------------- */

function BentoCard({
  icon: Icon,
  title,
  body,
  children,
  className,
}: {
  icon: typeof IconPhone;
  title: string;
  body: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card",
        className
      )}
    >
      <div className="flex flex-1 items-center justify-center border-b border-slate-100 bg-slate-50/70 px-6 py-8">
        {children}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <Icon className="h-[18px] w-[18px] text-brand-700" stroke={1.75} />
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
      </div>
    </div>
  );
}

function CsvVisual() {
  return (
    <div className="w-full max-w-md space-y-3">
      <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-slate-200">
          <IconFileSpreadsheet className="h-5 w-5" stroke={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">contacts-q3.csv</p>
          <p className="text-xs text-slate-500">2.4 MB</p>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-medium text-white shadow-sm">
          <IconFileUpload className="h-3.5 w-3.5" stroke={2} />
          Validate file
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone="neutral">Reads the phone or mobile column</Badge>
        <Badge tone="neutral">214 duplicates removed</Badge>
        <Badge tone="neutral">18 rows without a phone number skipped</Badge>
      </div>
    </div>
  );
}

function SingleVisual() {
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="flex gap-2">
        <div className="flex h-9 flex-1 items-center rounded-lg border border-slate-300 bg-white px-3 font-mono text-[13px] text-slate-800 shadow-sm">
          +1 415 555 2671
        </div>
        <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-medium text-white shadow-sm">
          <IconSearch className="h-3.5 w-3.5" stroke={2} />
          Validate
        </span>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-medium text-slate-900">+14155552671</span>
          <Badge tone="success" dot>
            Valid
          </Badge>
        </div>
        <p className="mt-1 text-xs text-slate-500">(415) 555-2671 &middot; US</p>
      </div>
    </div>
  );
}

function ListVisual() {
  return (
    <div className="w-full max-w-xs space-y-2">
      <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-[13px] leading-6 text-slate-700 shadow-sm">
        <p>+14155552671</p>
        <p>+442071838750</p>
        <p>(212) 555-0147</p>
        <p className="text-slate-400">+61293744000</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">4 of {MAX_BULK_NUMBERS.toLocaleString()} numbers</span>
        <span className="inline-flex h-8 items-center rounded-lg bg-brand-600 px-3 text-xs font-medium text-white shadow-sm">
          Validate 4 numbers
        </span>
      </div>
    </div>
  );
}

function HistoryVisual() {
  const rows = [
    { date: "Oct 21, 8:02 PM", method: "CSV", list: "B2B", total: "9,652", valid: 87 },
    { date: "Oct 20, 3:15 PM", method: "List", list: "B2C", total: "384", valid: 92 },
    { date: "Oct 18, 11:40 AM", method: "Single", list: "B2B", total: "1", valid: 100 },
  ];
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1.3fr_0.7fr_0.6fr_1fr_auto] gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        <span>Date</span>
        <span>Method</span>
        <span>List</span>
        <span>Valid</span>
        <span className="w-4" />
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div
            key={row.date}
            className="grid grid-cols-[1.3fr_0.7fr_0.6fr_1fr_auto] items-center gap-3 px-4 py-2.5 text-xs"
          >
            <span className="truncate text-slate-900">{row.date}</span>
            <span className="text-slate-600">{row.method}</span>
            <span>
              <Badge tone="brand">{row.list}</Badge>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-10 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${row.valid}%` }} />
              </span>
              <span className="tabular-nums text-slate-500">{row.valid}%</span>
            </span>
            <IconDownload className="h-4 w-4 text-slate-500" stroke={1.75} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Page ---------------------------------- */

export function LandingView({ signedIn }: { signedIn: boolean }) {
  const primaryHref = signedIn ? "/dashboard" : "/register";
  const primaryLabel = signedIn ? "Open dashboard" : "Start for free";

  return (
    <div className="bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" aria-label="Valid Number Check home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Dashboard
                <IconArrowRight className="h-3.5 w-3.5" stroke={2} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden h-9 items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <GridBackdrop className="opacity-[0.045] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300"
              >
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">New</span>
                CSV uploads up to {MAX_CSV_ROWS.toLocaleString()} rows
                <IconArrowRight className="h-3 w-3" stroke={2} />
              </a>
              <h1 className="mt-8 text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.025em] text-slate-900 sm:text-6xl sm:leading-[1.05]">
                Know which numbers are real{" "}
                <span className="text-slate-400">before you dial.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Phone number validation for B2B and B2C contact lists. Check one number, a pasted
                list, or an entire CSV against live carrier data, and export clean results in minutes.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <CtaLink href={primaryHref} className="w-full sm:w-auto">
                  {primaryLabel}
                  <IconArrowRight className="h-4 w-4" stroke={2} />
                </CtaLink>
                <CtaLink href="#how-it-works" variant="secondary" className="w-full sm:w-auto">
                  See how it works
                </CtaLink>
              </div>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
                {["No credit card required", "Free validations to start", "CSV export included"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <IconCheck className="h-4 w-4 text-emerald-600" stroke={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 sm:mt-20">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-slate-200 bg-slate-50/70">
          <ul className="mx-auto grid max-w-6xl grid-cols-2 px-6 md:grid-cols-4">
            {TRUST.map(({ icon: Icon, label }, i) => (
              <li
                key={label}
                className={cn(
                  "flex items-center justify-center gap-2.5 py-6 text-center text-sm font-medium text-slate-600",
                  i % 2 === 1 && "border-l border-slate-200",
                  i === 2 && "md:border-l md:border-slate-200",
                  i < 2 && "border-b border-slate-200 md:border-b-0"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 text-slate-400" stroke={1.75} />
                {label}
              </li>
            ))}
          </ul>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Features"
              title="Every way you need to validate, in one place"
              body="Pick the method that fits the job. Results look the same whichever way you check, and every run is saved."
            />

            <div className="mt-16 grid gap-5 lg:grid-cols-3">
              <BentoCard
                className="lg:col-span-2"
                icon={IconFileUpload}
                title="Upload a CSV"
                body={`Validate up to ${MAX_CSV_ROWS.toLocaleString()} rows at once. We detect the phone column, remove duplicates and skip empty rows for you.`}
              >
                <CsvVisual />
              </BentoCard>
              <BentoCard
                icon={IconPhone}
                title="Single number"
                body="Check one number in seconds before you call, text, or save it to your CRM."
              >
                <SingleVisual />
              </BentoCard>
              <BentoCard
                icon={IconList}
                title="Paste a list"
                body={`Drop in up to ${MAX_BULK_NUMBERS.toLocaleString()} numbers, one per line, in any common format.`}
              >
                <ListVisual />
              </BentoCard>
              <BentoCard
                className="lg:col-span-2"
                icon={IconHistory}
                title="History and downloads"
                body="Every run is saved to your history with its counts. Download the full results as a CSV whenever you need them."
              >
                <HistoryVisual />
              </BentoCard>
            </div>

            <div className="mt-20 grid gap-x-10 gap-y-10 border-t border-slate-200 pt-12 sm:grid-cols-2 lg:grid-cols-4">
              {EXTRAS.map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-card ring-1 ring-slate-200">
                    <Icon className="h-[18px] w-[18px]" stroke={1.75} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 border-t border-slate-200 bg-slate-50/70 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading eyebrow="How it works" title="From raw list to clean data in three steps" />
            <ol className="mt-16 grid gap-5 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
                  <span className="font-mono text-sm font-medium text-brand-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-[13px] top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 md:flex"
                    >
                      <IconArrowRight className="h-3.5 w-3.5" stroke={2} />
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <SectionHeading
              align="left"
              eyebrow="Who it's for"
              title="Built for teams that rely on reachable contacts"
              body="Bad numbers waste calls, campaign budget and time. Validate before you reach out, not after."
            />
            <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
              {USE_CASES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-white p-7">
                  <Icon className="h-5 w-5 text-brand-700" stroke={1.75} />
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-16 border-t border-slate-200 bg-slate-50/70 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Pricing"
              title="Simple, transparent pricing"
              body="Start for free. Upgrade when you need unlimited validation."
            />

            <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
              <PlanCard
                name="Free"
                price="$0"
                period="forever"
                description="For trying things out and occasional checks."
                features={["5 free validations", "Single, list and CSV validation", "Downloadable results"]}
                cta={{ href: primaryHref, label: signedIn ? "Open dashboard" : "Create free account" }}
              />
              <PlanCard
                featured
                name="Premium"
                price="$19.99"
                period="per month"
                description="For teams cleaning contact lists every week."
                features={[
                  "Unlimited validations for 30 days",
                  "Single number, list and CSV validation",
                  "Full history with downloadable results",
                ]}
                cta={{ href: primaryHref, label: "Get Premium" }}
              />
            </div>
            <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
              <IconLock className="h-4 w-4 shrink-0" stroke={1.75} />
              Prices in USD. Payments are processed securely by Square.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-16 py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title="Frequently asked questions"
              body="Everything you need to know about validating numbers with Valid Number Check."
            />
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {FAQ.map((item, i) => (
                <details key={item.q} open={i === 0} className="group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-medium text-slate-900">
                    {item.q}
                    <IconChevronDown
                      className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                      stroke={1.75}
                    />
                  </summary>
                  <p className="-mt-1 max-w-xl pb-6 text-[15px] leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-6 pb-24 sm:pb-32">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-slate-900 px-8 py-14 sm:px-14 sm:py-16">
            <GridBackdrop dark className="opacity-[0.06] [mask-image:linear-gradient(to_left,black,transparent)]" />
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl"
            />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Stop calling numbers that don&rsquo;t exist.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                  Create an account and validate your first list in under a minute.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <CtaLink href={primaryHref} variant="inverted">
                  {primaryLabel}
                  <IconArrowRight className="h-4 w-4" stroke={2} />
                </CtaLink>
                {!signedIn && (
                  <CtaLink href="/login" variant="outline-dark">
                    Sign in
                  </CtaLink>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[2fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Phone number validation for B2B and B2C contact lists.
            </p>
          </div>
          <FooterColumn title="Product" links={NAV.map((item) => ({ ...item, anchor: true }))} />
          <FooterColumn
            title="Account"
            links={
              signedIn
                ? [
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/dashboard/history", label: "History" },
                    { href: "/dashboard/settings", label: "Settings" },
                  ]
                : [
                    { href: "/login", label: "Sign in" },
                    { href: "/register", label: "Create account" },
                  ]
            }
          />
        </div>
        <div className="border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Valid Number Check. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; anchor?: boolean }[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            {link.anchor ? (
              <a href={link.href} className="text-sm text-slate-500 hover:text-slate-900">
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="text-sm text-slate-500 hover:text-slate-900">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  featured,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: { href: string; label: string };
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-8",
        featured ? "border-slate-900 shadow-overlay ring-1 ring-slate-900" : "border-slate-200 shadow-card"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{name}</h3>
        {featured && <Badge tone="brand">Recommended</Badge>}
      </div>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <p className="mt-8 flex items-baseline gap-1.5">
        <span className="text-5xl font-semibold tracking-tight text-slate-900">{price}</span>
        <span className="text-sm text-slate-500">{period}</span>
      </p>
      <CtaLink href={cta.href} variant={featured ? "primary" : "secondary"} className="mt-8 w-full">
        {cta.label}
      </CtaLink>
      <ul className="mt-8 space-y-3 border-t border-slate-100 pt-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
            <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" stroke={2.5} />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
