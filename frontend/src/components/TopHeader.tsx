"use client";

import React, { useState, useEffect } from "react";
import { UserRole, AuthUser } from "@/types";
import {
  Search,
  Bell,
  RefreshCw,
  Menu,
  ChevronRight,
  Shield,
  CheckCircle,
  Wifi,
  Sparkles,
  Command,
  HelpCircle,
  SlidersHorizontal
} from "lucide-react";

interface TopHeaderProps {
  activeTab: string;
  backendOnline: boolean;
  notificationCount: number;
  onOpenNotifications: () => void;
  onResetDemo: () => void;
  authUser: AuthUser | null;
  currentRole: UserRole;
  onToggleMobileSidebar: () => void;
  onGlobalSearch?: (query: string) => void;
  onOpenLogin: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  backendOnline,
  notificationCount,
  onOpenNotifications,
  onResetDemo,
  authUser,
  currentRole,
  onToggleMobileSidebar,
  onGlobalSearch,
  onOpenLogin,
}) => {
  const [searchVal, setSearchVal] = useState("");
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toTimeString().substring(0, 8) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabBreadcrumbs: Record<string, { parent: string; current: string }> = {
    OVERVIEW: { parent: "Operations", current: "Relief Operations Command" },
    MAP: { parent: "Operations", current: "Geospatial Operations Map" },
    REQUESTS: { parent: "Coordination", current: "Shelter Aid Requests" },
    SUPPLIES: { parent: "Logistics", current: "Supply Depot Inventory" },
    ALLOCATIONS: { parent: "Intelligence", current: "Algorithmic Allocation Engine" },
    FULFILMENT: { parent: "Logistics", current: "Deliveries & Chain of Custody" },
    ANALYTICS: { parent: "Intelligence", current: "Resource Coverage & Telemetry" },
    ADMIN: { parent: "Settings", current: "Administration & Audit Trail" },
  };

  const breadcrumb = tabBreadcrumbs[activeTab] || { parent: "Operations", current: "Overview" };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E7EAF0] px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#687386] hover:text-[#172033] hover:bg-[#F7F8FA] transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-[#687386] font-medium" aria-label="Breadcrumb">
          <span className="hover:text-[#172033] transition-colors cursor-pointer hidden sm:inline">
            {breadcrumb.parent}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] hidden sm:inline" />
          <span className="font-semibold text-[#172033] truncate max-w-[180px] sm:max-w-none">
            {breadcrumb.current}
          </span>
        </nav>
      </div>

      {/* Middle: Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C9BAE]" />
          <input
            type="text"
            placeholder="Search shelters, inventory, consignments..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              if (onGlobalSearch) onGlobalSearch(e.target.value);
            }}
            className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-12 py-1.5 text-xs text-[#172033] placeholder-[#8C9BAE] focus:outline-none focus:border-[#CBD5E1] focus:bg-[#FFFFFF] transition-all"
          />
          <div className="absolute right-2.5 top-2 flex items-center gap-0.5 text-[10px] text-[#8C9BAE] font-mono bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E7EAF0]">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Sync Indicator, Notifications, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Operations Timestamp */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-[#687386] bg-[#F7F8FA] px-2.5 py-1 rounded-lg border border-[#E7EAF0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12B8A6] animate-pulse" />
          <span>{timeStr || "12:00:00 UTC"}</span>
        </div>

        {/* Sync Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
            backendOnline
              ? "bg-[#F0FDFA] text-[#0F766E] border-[#CCFBF1]"
              : "bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]"
          }`}
          title={backendOnline ? "Connected to FastAPI Allocation Engine" : "Running on Local In-Memory Engine"}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline ? "bg-[#12B8A6] animate-pulse-subtle" : "bg-[#F4AE42]"
            }`}
          />
          <span className="hidden sm:inline">
            {backendOnline ? "Cloud Sync Active" : "Local Engine"}
          </span>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          title="Reset dataset to initial demonstration state"
          className="p-2 rounded-xl text-[#687386] hover:text-[#172033] hover:bg-[#F7F8FA] border border-[#E7EAF0] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-[#687386] hover:text-[#172033] hover:bg-[#F7F8FA] border border-[#E7EAF0] transition-colors cursor-pointer"
          title="Open notification feed"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F04452] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Persona / Profile trigger */}
        <button
          onClick={onOpenLogin}
          className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E7EAF0] group cursor-pointer"
          title="Switch role / View profile"
        >
          <div className="w-8 h-8 rounded-lg bg-[#172033] text-white text-xs font-bold flex items-center justify-center group-hover:ring-2 group-hover:ring-[#F04452]/20 transition-all">
            {authUser?.displayName ? authUser.displayName.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-[12px] font-semibold text-[#172033] leading-none mb-0.5 group-hover:text-[#F04452] transition-colors">
              {authUser?.displayName?.split(" ")[0] || "Priya"}
            </div>
            <div className="text-[10px] text-[#687386] font-medium leading-none">
              {currentRole}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
