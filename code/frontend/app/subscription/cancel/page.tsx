import type { Metadata } from "next";
import SubscriptionCancelView from "@/views/dashboard/subscription/SubscriptionCancelView";

export const metadata: Metadata = { title: "Checkout cancelled" };

export default function Page() {
  return <SubscriptionCancelView />;
}
