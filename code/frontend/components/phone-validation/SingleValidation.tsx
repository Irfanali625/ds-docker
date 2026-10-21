"use client";

import { FormEvent, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/components/ui/cn";

export function SingleValidation({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (phoneNumber: string) => void;
}) {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (phone.trim()) onSubmit(phone.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="single-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
        Phone number
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="single-phone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 415 555 2671"
          className={cn(inputClass(), "h-11 flex-1 text-[15px]")}
        />
        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={!phone.trim()}
          icon={<IconSearch className="h-4 w-4" stroke={2} />}
          className="sm:w-40"
        >
          {loading ? "Checking" : "Validate"}
        </Button>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Include the country code for numbers outside the US and Canada.
      </p>
    </form>
  );
}
