"use client";

import React, { useState, useEffect } from "react";
import { UserRole, AuthUser } from "@/types";
import {
  Bell,
  RefreshCw,
  Menu,
  ChevronRight,
  Shield,
  ShieldCheck,
  HeartHandshake,
  Package,
  UserCheck,
  LogOut
} from "lucide-react";

interface TopHeaderProps {
  activeTab: string;
  backendOnline: boolean;
  notificationCount: number;
  onOpenNotifications: () => void;
  onResetDemo: () => void;
  authUser: AuthUser | null;
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onSignOut?: () => void;
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
  onRoleChange,
  onSignOut,
  onToggleMobileSidebar,
  onGlobalSearch,
  onOpenLogin,
}) => {
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

  const roleParents: Record<UserRole, string> = {
    COORDINATOR: "Disaster Command HQ",
    REQUESTER: "Shelter Requester Portal",
    DONOR: "Humanitarian Donor Portal",
    ADMIN: "Platform Admin Console",
  };

  const tabBreadcrumbs: Record<string, { parent: string; current: string }> = {
    OVERVIEW: { parent: "Operations", current: "Relief Operations Command" },
    MAP: { parent: "Geospatial", current: "Operations Map" },
    REQUESTS: { parent: "Shelter Demands", current: currentRole === "REQUESTER" ? "My Aid Demands" : "Shelter Aid Requests" },
    SUPPLIES: { parent: "Inventory", current: currentRole === "DONOR" ? "My Depot Inventory" : "Supply Depot Inventory" },
    ALLOCATIONS: { parent: "Intelligence", current: "AI Matching Engine" },
    FULFILMENT: { parent: "Logistics", current: currentRole === "REQUESTER" ? "Incoming Deliveries" : currentRole === "DONOR" ? "Outbound Dispatches" : "Deliveries & Tracking" },
    ANALYTICS: { parent: "Telemetry", current: currentRole === "DONOR" ? "Donation Impact" : "Resource Analytics" },
    ADMIN: { parent: "Governance", current: "Administration & Compliance" },
    AUDIT: { parent: "Security", current: "Immutable Audit Ledger" },
  };

  const currentParent = roleParents[currentRole] || "Operations";
  const breadcrumb = tabBreadcrumbs[activeTab] || { parent: currentParent, current: "Overview" };

  const roleBadgeConfig: Record<
    UserRole,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    COORDINATOR: {
      label: "Tactical Coordinator",
      bg: "bg-[#FEF2F2]",
      text: "text-[#F04452]",
      border: "border-[#FEE2E2]",
      icon: ShieldCheck,
    },
    REQUESTER: {
      label: "Shelter Requester",
      bg: "bg-[#FFFBEB]",
      text: "text-[#B45309]",
      border: "border-[#FEF3C7]",
      icon: HeartHandshake,
    },
    DONOR: {
      label: "Humanitarian Donor",
      bg: "bg-[#F0FDFA]",
      text: "text-[#0F766E]",
      border: "border-[#CCFBF1]",
      icon: Package,
    },
    ADMIN: {
      label: "Platform Admin",
      bg: "bg-[#F5F3FF]",
      text: "text-[#7C3AED]",
      border: "border-[#EDE9FE]",
      icon: UserCheck,
    },
  };

  const activeRoleBadge = roleBadgeConfig[currentRole] || roleBadgeConfig.COORDINATOR;
  const RoleIcon = activeRoleBadge.icon;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7EAF0] px-4 sm:px-6 flex items-center justify-between transition-colors">
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
          <span className="hover:text-[#172033] transition-colors cursor-pointer hidden xl:inline font-semibold text-[#8C9BAE]">
            {currentParent}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] hidden xl:inline" />
          <span className="font-bold text-[#172033] truncate max-w-[160px] sm:max-w-none">
            {breadcrumb.current}
          </span>
        </nav>
      </div>

      {/* Middle: Locked Verified Role Badge (No switching to other roles) */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${activeRoleBadge.bg} ${activeRoleBadge.border} ${activeRoleBadge.text} text-xs font-bold shadow-2xs`}
        >
          <RoleIcon className="w-4 h-4 shrink-0" />
          <span>{activeRoleBadge.label}</span>
          <span className="hidden md:inline font-normal text-[#687386] text-[11px] border-l border-black/10 pl-2">
            {authUser?.organisationName || authUser?.displayName || "Active Session"}
          </span>
        </div>
      </div>

      {/* Right: Actions, Sync Indicator, Notifications, User Avatar & Sign Out */}
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

        {/* User Identity Display (Role-Locked) */}
        <div
          className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E7EAF0]"
          title={`Session active as ${currentRole}. Sign out to switch account.`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#172033] text-white text-xs font-bold flex items-center justify-center">
            {authUser?.displayName ? authUser.displayName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-[12px] font-semibold text-[#172033] leading-none mb-0.5">
              {authUser?.displayName?.split(" ")[0] || "User"}
            </div>
            <div className="text-[10px] text-[#687386] font-medium leading-none">
              {currentRole}
            </div>
          </div>
        </div>

        {/* Explicit Sign Out Button */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            title="Sign out of current role"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-[#687386] hover:text-[#F04452] hover:bg-[#FEF2F2] border border-[#E7EAF0] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
