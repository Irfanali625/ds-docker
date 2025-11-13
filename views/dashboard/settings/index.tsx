"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardNavbar } from "../components/DashboardNavbar";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSettingsSchema } from "@/hook/useSettingsSchema";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Settings() {
  const { user, logout, fetchAndSetUser } = useAuth();
  const schema = useSettingsSchema();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<any>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: any) => {
    try {
      const payload = { ...values };
      if (
        !payload.oldPassword &&
        !payload.newPassword &&
        !payload.confirmPassword
      ) {
        delete payload.oldPassword;
        delete payload.newPassword;
        delete payload.confirmPassword;
      }
      const response = await api.updateProfile(payload);
      await fetchAndSetUser();
      setSuccessMessage(response.message);
    } catch (error: any) {
      console.error("Update failed:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardNavbar user={user} logout={logout} />
      <main className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Account Settings
        </h2>

        {successMessage && (
          <p className="text-green-600 mb-4 font-medium">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <input
                    {...field}
                    value={field.value ?? ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your name"
                  />
                  {fieldState.error && (
                    <p className="text-red-600 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <input
                    {...field}
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your email"
                  />
                  {fieldState.error && (
                    <p className="text-red-600 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Old Password
            </label>
            <Controller
              name="oldPassword"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <input
                    {...field}
                    value={field.value ?? ""}
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter old password (optional)"
                  />
                  {fieldState.error && (
                    <p className="text-red-600 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <Controller
              name="newPassword"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <input
                    {...field}
                    value={field.value ?? ""}
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter new password (optional)"
                  />
                  {fieldState.error && (
                    <p className="text-red-600 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <input
                    {...field}
                    value={field.value ?? ""}
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Confirm new password (optional)"
                  />
                  {fieldState.error && (
                    <p className="text-red-600 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
}
