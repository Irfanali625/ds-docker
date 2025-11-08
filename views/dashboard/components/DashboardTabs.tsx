import React from "react";

interface DashboardTabsProps {
  activeTab: "validator" | "history" | "subscription";
  setActiveTab: (tab: "validator" | "history" | "subscription") => void;
}

export function DashboardTabs({ activeTab, setActiveTab }: DashboardTabsProps) {
  const tabClasses = (tab: string) =>
    `py-4 px-1 border-b-2 font-medium text-sm ${
      activeTab === tab
        ? "border-indigo-500 text-indigo-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;

  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab("validator")}
          className={tabClasses("validator")}
        >
          Phone Validator
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={tabClasses("history")}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab("subscription")}
          className={tabClasses("subscription")}
        >
          Subscription
        </button>
      </nav>
    </div>
  );
}
