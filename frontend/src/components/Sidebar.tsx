"use client";

import React from "react";
import { UserRole, AuthUser } from "@/types";
import {
  LayoutDashboard,
  MapPin,
  HeartHandshake,
  Package,
  Cpu,
  Truck,
  BarChart3,
  ShieldCheck,
  LogOut,
  ChevronRight,
  X,
  ExternalLink,
  Flame,
  LifeBuoy
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  authUser: AuthUser | null;
  onSignOut: () => void;
  onOpenLogin: () => void;
  criticalRequestsCount: number;
  availableStockCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigateTab,
  currentRole,
  onRoleChange,
  authUser,
  onSignOut,
  onOpenLogin,
  criticalRequestsCount,
  availableStockCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: "OVERVIEW",
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "MAP",
      label: "Operations Map",
      icon: MapPin,
      badge: null,
    },
    {
      id: "REQUESTS",
      label: "Aid Requests",
      icon: HeartHandshake,
      badge: criticalRequestsCount > 0 ? `${criticalRequestsCount} urgent` : null,
      badgeVariant: "critical",
    },
    {
      id: "SUPPLIES",
      label: "Supply Depots",
      icon: Package,
      badge: null,
    },
    {
      id: "ALLOCATIONS",
      label: "Allocation Engine",
      icon: Cpu,
      badge: "AI Match",
      badgeVariant: "turquoise",
    },
    {
      id: "FULFILMENT",
      label: "Deliveries",
      icon: Truck,
      badge: null,
    },
    {
      id: "ANALYTICS",
      label: "Analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "ADMIN",
      label: "Administration",
      icon: ShieldCheck,
      badge: null,
    },
  ];

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    COORDINATOR: { label: "Coordinator", bg: "bg-[#FEF2F2]", text: "text-[#F04452]" },
    REQUESTER: { label: "Requester", bg: "bg-[#FFFBEB]", text: "text-[#B45309]" },
    DONOR: { label: "Donor", bg: "bg-[#F0FDFA]", text: "text-[#0F766E]" },
    ADMIN: { label: "Admin", bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]" },
  };

  const currentRoleConfig = roleLabels[currentRole] || roleLabels.COORDINATOR;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E7EAF0] text-[#172033] select-none">
      {/* 1. Brand Logo */}
      <div className="p-5 flex items-center justify-between border-b border-[#E7EAF0]">
        <div className="flex items-center gap-3">
          {/* Custom Emergency-Response Symbol (Distinctive Coral-Red Hex Cross with flow curves) */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F04452] to-[#E02E3D] flex items-center justify-center text-white shadow-sm shadow-red-500/20">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" opacity="0.35" strokeWidth="1.5" />
              <path d="M12 4v16M4 12h16" />
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[17px] tracking-tight text-[#172033]">
                ResQ<span className="text-[#F04452]">Flow</span>
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F7F8FA] border border-[#E7EAF0] text-[#687386] tracking-wide uppercase">
                Command
              </span>
            </div>
            <p className="text-[11px] text-[#687386] font-medium leading-tight">
              Humanitarian Response
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-[#687386] hover:text-[#172033] hover:bg-[#F7F8FA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Navigation items */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold text-[#8C9BAE] uppercase tracking-wider">
            Platform Navigation
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigateTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group cursor-pointer ${
                isActive
                  ? "bg-[#F7F8FA] text-[#172033] font-semibold shadow-xs border border-[#E7EAF0]"
                  : "text-[#4A5568] hover:text-[#172033] hover:bg-[#FAFBFD]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-[#F04452]" : "text-[#687386] group-hover:text-[#172033]"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                    item.badgeVariant === "critical"
                      ? "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]"
                      : item.badgeVariant === "turquoise"
                      ? "bg-[#F0FDFA] text-[#12B8A6] border border-[#CCFBF1]"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Disaster Status Card in Sidebar */}
        <div className="pt-4 px-1">
          <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E7EAF0] text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#172033] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F04452] animate-pulse" />
                Active Operation
              </span>
              <span className="text-[10px] font-mono text-[#687386]">Zone A-4</span>
            </div>
            <p className="text-[11px] text-[#687386] line-clamp-1 mb-2 font-medium">
              Cyclone Michaung Coastal Relief
            </p>
            <div className="flex items-center justify-between text-[11px] text-[#4A5568] pt-1.5 border-t border-[#E7EAF0]">
              <span>Response Rate</span>
              <span className="font-bold text-[#12B8A6]">94.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. User & Organization Profile at bottom */}
      <div className="p-3 border-t border-[#E7EAF0] bg-[#FFFFFF]">
        {/* Persona quick switch buttons */}
        <div className="mb-3 px-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-[#8C9BAE] tracking-wider">
              Simulation Role
            </span>
            <span className="text-[10px] font-semibold text-[#12B8A6]">Active Persona</span>
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#F7F8FA] rounded-lg border border-[#E7EAF0]">
            {(["COORDINATOR", "REQUESTER", "DONOR", "ADMIN"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                title={`Switch to ${r} role`}
                className={`text-[10px] py-1 rounded font-bold transition-all cursor-pointer ${
                  currentRole === r
                    ? "bg-[#FFFFFF] text-[#172033] shadow-xs border border-[#E7EAF0]"
                    : "text-[#687386] hover:text-[#172033]"
                }`}
              >
                {r.slice(0, 4)}
              </button>
            ))}
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFBFD] border border-[#E7EAF0]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#172033] to-[#2B384E] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {authUser?.displayName ? authUser.displayName.charAt(0).toUpperCase() : "P"}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-[12px] font-semibold text-[#172033] truncate">
                {authUser?.displayName || "Priya Sharma"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${currentRoleConfig.bg} ${currentRoleConfig.text}`}>
                  {currentRoleConfig.label}
                </span>
                <span className="text-[10px] text-[#8C9BAE] truncate">
                  {authUser?.organisationName || "UN Disaster Relief"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onSignOut}
            title="Sign out or switch account"
            className="p-1.5 rounded-lg text-[#8C9BAE] hover:text-[#F04452] hover:bg-[#FEF2F2] transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer body */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
