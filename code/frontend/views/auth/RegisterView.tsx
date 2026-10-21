"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { AuthLayout } from "./AuthLayout";

export function RegisterView() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start validating phone numbers in a few seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
