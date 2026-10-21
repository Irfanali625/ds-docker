import type { Metadata } from "next";
import { DashboardView } from "@/views/dashboard/DashboardView";

export const metadata: Metadata = { title: "Validate" };

export default function DashboardPage() {
  return <DashboardView />;
}
