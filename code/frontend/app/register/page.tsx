import type { Metadata } from "next";
import { RegisterView } from "@/views/auth/RegisterView";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return <RegisterView />;
}
