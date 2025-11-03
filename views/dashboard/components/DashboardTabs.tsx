import React from 'react';

interface DashboardTabsProps {
  activeTab: 'get' | 'my-leads' | 'validator';
  setActiveTab: (tab: 'get' | 'my-leads' | 'validator') => void;
  leadsCount: number;
}

export function DashboardTabs({ activeTab, setActiveTab, leadsCount }: DashboardTabsProps) {
  const tabClasses = (tab: string) =>
    `py-4 px-1 border-b-2 font-medium text-sm ${
      activeTab === tab
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;

  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <button onClick={() => setActiveTab('get')} className={tabClasses('get')}>
          Get Leads
        </button>
        <button onClick={() => setActiveTab('my-leads')} className={tabClasses('my-leads')}>
          My Leads ({leadsCount})
        </button>
        <button onClick={() => setActiveTab('validator')} className={tabClasses('validator')}>
          Phone Validator
        </button>
      </nav>
    </div>
  );
}
