"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneValidator } from "@/components/phone-validation/PhoneValidator";
import { api } from "@/lib/api";
import { DashboardNavbar } from "./components/DashboardNavbar";
import { DashboardTabs } from "./components/DashboardTabs";
import { MyHistory } from "./components/tabs/MyHistory";

export function DashboardView() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"validator" | "history">(
    "validator"
  );
  const [history, getHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    try {
      const history = await api.getHistory();
      getHistory(history);
    } catch (err: any) {
      console.error("Failed to load history:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardNavbar user={user} logout={logout} />
      <main className="max-w-7xl mx-auto p-8">
        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "history" && (
          <MyHistory history={history}/>
        )}
        {activeTab === "validator" && <PhoneValidator />}
      </main>
    </div>
  );
}
