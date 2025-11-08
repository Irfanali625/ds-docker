import React from "react";
import { IconLogout } from "@tabler/icons-react";

interface DashboardNavbarProps {
  user: any;
  logout: () => void;
}

export function DashboardNavbar({ user, logout }: DashboardNavbarProps) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            VALID NUMBER CHECK
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-sm sm:text-base text-gray-700 font-medium hidden sm:inline">
              Welcome, {user?.name}
            </span>
            <span className="text-xs text-gray-700 font-medium sm:hidden">
              {user?.name?.split(' ')[0]}
            </span>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 active:bg-red-800 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              aria-label="Logout"
            >
              <IconLogout className="w-3.5 h-3.5" stroke={2} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
