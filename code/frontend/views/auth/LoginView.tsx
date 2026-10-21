"use client";

import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { AuthLayout } from "./AuthLayout";

export function LoginView() {
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Enter your email and password to access your account."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:text-brand-800">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
