import { HistoryTable } from "@/components/HistoryTable";
import React from "react";

interface MyHistoryProps {
  history: any;
}

export function MyHistory({ history }: MyHistoryProps) {
  return (
    <div>
      <HistoryTable history={history} />
    </div>
  );
}
