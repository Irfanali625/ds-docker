import React from "react";

interface DashboardNavbarProps {
  user: any;
  logout: () => void;
}

export function DashboardNavbar({ user, logout }: DashboardNavbarProps) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            Data Scraping Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
