"use client";

import Link from "next/link";
import { IconX } from "@tabler/icons-react";
import { StatusPage, primaryLinkClass } from "./StatusPage";

export default function SubscriptionCancelView() {
  return (
    <StatusPage
      icon={<IconX className="h-6 w-6" stroke={2.25} />}
      iconClassName="bg-slate-100 text-slate-500"
      title="Checkout cancelled"
      actions={
        <Link href="/dashboard" className={primaryLinkClass}>
          Back to dashboard
        </Link>
      }
    >
      <p>
        You left checkout before paying, so nothing was charged. You can upgrade again at any time
        from your dashboard.
      </p>
    </StatusPage>
  );
}
