import SubscriptionCancelView from "@/views/dashboard/subscription/SubscriptionCancelView";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionCancelView />
    </Suspense>
  );
}
