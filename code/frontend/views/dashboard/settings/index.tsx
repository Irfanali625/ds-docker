"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { TextField, PasswordField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const MIN_PASSWORD_LENGTH = 8;

const profileSchema = yup.object({
  name: yup.string().trim().required("Enter your name").max(80, "Name is too long"),
  email: yup.string().trim().required("Enter your email").email("Enter a valid email address"),
});

const passwordSchema = yup.object({
  oldPassword: yup.string().required("Enter your current password"),
  newPassword: yup
    .string()
    .required("Enter a new password")
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`),
  confirmPassword: yup
    .string()
    .required("Confirm your new password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

type ProfileData = yup.InferType<typeof profileSchema>;
type PasswordData = yup.InferType<typeof passwordSchema>;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 py-8 first:pt-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ProfileForm() {
  const { user, updateSession } = useAuth();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileData>({ resolver: yupResolver(profileSchema) });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email });
  }, [user, reset]);

  const onSubmit = async (values: ProfileData) => {
    setSaved(false);
    try {
      const res = await authApi.updateProfile(values);
      updateSession(res.user, res.token);
      reset({ name: res.user.name, email: res.user.email });
      setSaved(true);
    } catch (err: any) {
      setError("root", { message: err.message });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardBody className="space-y-5">
          {errors.root && <Alert tone="error">{errors.root.message}</Alert>}
          {saved && !isDirty && <Alert tone="success">Your profile has been updated.</Alert>}
          <TextField label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </CardBody>
        <CardFooter>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const { user, updateSession } = useAuth();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordData>({ resolver: yupResolver(passwordSchema) });

  const onSubmit = async (values: PasswordData) => {
    if (!user) return;
    setSaved(false);
    try {
      const res = await authApi.updateProfile({ name: user.name, email: user.email, ...values });
      updateSession(res.user, res.token);
      reset({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setSaved(true);
    } catch (err: any) {
      setError("root", { message: err.message });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardBody className="space-y-5">
          {errors.root && <Alert tone="error">{errors.root.message}</Alert>}
          {saved && <Alert tone="success">Your password has been changed.</Alert>}
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            error={errors.oldPassword?.message}
            {...register("oldPassword")}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <PasswordField
              label="New password"
              autoComplete="new-password"
              hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
        </CardBody>
        <CardFooter>
          <Button type="submit" loading={isSubmitting}>
            Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function Settings() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title="Account settings"
        description={
          user?.createdAt
            ? `Member since ${new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}`
            : undefined
        }
      />
      <div className="divide-y divide-slate-200">
        <Section title="Profile" description="Your name and the email address you sign in with.">
          <ProfileForm />
        </Section>
        <Section title="Password" description="Use a password you do not use on other sites.">
          <PasswordForm />
        </Section>
      </div>
    </>
  );
}
