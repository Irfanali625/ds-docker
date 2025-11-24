"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneValidator } from "@/components/phone-validation/PhoneValidator";
import { api } from "@/lib/api";
import { DashboardNavbar } from "./components/DashboardNavbar";
import { DashboardTabs } from "./components/DashboardTabs";
import { MyHistory } from "./components/tabs/MyHistory";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { subscriptionApi } from "@/lib/api";

export function DashboardView() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "validator" | "history" | "subscription"
  >("validator");
  const [history, getHistory] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState(19);

  const handleLogout = () => {
    logout();
  };

  const loadHistory = async () => {
    try {
      const history = await api.getHistory();
      getHistory(history);
    } catch (err: any) {
      console.error("Failed to load history:", err);
    }
  };

  const loadPremiumPrice = async () => {
    try {
      const status = await subscriptionApi.getStatus();
      setPremiumPrice(status.premiumPrice);
    } catch (err: any) {
      console.error("Failed to load subscription status:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
    if (activeTab === "subscription") {
      loadPremiumPrice();
    }
  }, [activeTab]);

  useEffect(() => {
    loadPremiumPrice();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardNavbar user={user} logout={handleLogout} />
      <main className="max-w-7xl mx-auto p-8">
        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "history" && <MyHistory history={history} />}
        {activeTab === "validator" && (
          <div className="space-y-6">
            {/* Well be Set later */}
            {/* <SubscriptionStatus onUpgrade={() => setShowUpgradeModal(true)} /> */}
            <PhoneValidator />
          </div>
        )}
      </main>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        premiumPrice={premiumPrice}
      />
    </div>
  );
}
