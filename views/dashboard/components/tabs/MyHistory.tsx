import React from "react";
import { HistoryTable } from "@/components/LeadsTable";

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
