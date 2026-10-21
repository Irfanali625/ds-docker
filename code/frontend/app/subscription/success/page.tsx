import type { Metadata } from "next";
import SubscriptionSuccessView from "@/views/dashboard/subscription/SubscriptionSuccessView";

export const metadata: Metadata = { title: "Payment received" };

export default function Page() {
  return <SubscriptionSuccessView />;
}
