interface TabsProps {
  activeTab: "single" | "bulk" | "csv";
  setActiveTab: (tab: "single" | "bulk" | "csv") => void;
}

export function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {(["single", "bulk", "csv"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === tab
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab === "csv" ? "CSV Upload" : `${tab} Validation`}
          </button>
        ))}
      </nav>
    </div>
  );
}
