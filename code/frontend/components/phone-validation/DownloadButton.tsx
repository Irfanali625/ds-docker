"use client";

import { useState } from "react";
import { IconDownload } from "@tabler/icons-react";
import { Button, ButtonProps } from "@/components/ui/Button";
import { validationApi } from "@/lib/api";

export function DownloadButton({
  historyId,
  label = "Download CSV",
  onError,
  ...props
}: {
  historyId: string;
  label?: string;
  onError?: (message: string) => void;
} & Omit<ButtonProps, "onClick" | "onError">) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      await validationApi.download(historyId);
    } catch (err: any) {
      onError?.(err.message || "Download failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={download}
      loading={busy}
      icon={<IconDownload className="h-4 w-4" stroke={2} />}
      {...props}
    >
      {label}
    </Button>
  );
}
