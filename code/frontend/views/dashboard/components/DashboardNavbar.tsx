import React, { useState, useRef, useEffect } from "react";
import { IconLogout, IconSettings, IconChevronDown, IconHome } from "@tabler/icons-react";
import Link from "next/link";

interface DashboardNavbarProps {
  user: any;
  logout: () => void;
}

export function DashboardNavbar({ user, logout }: DashboardNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            VALID NUMBER CHECK
          </h1>

          <div
            className="relative flex items-center gap-3 sm:gap-4"
            ref={menuRef}
          >
            {/* Username button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition-all duration-200 focus:outline-none"
            >
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                {user?.name || "User"}
              </span>
              <IconChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  <IconHome className="w-4 h-4 text-gray-600" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  <IconSettings className="w-4 h-4 text-gray-600" />
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  <IconLogout className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
