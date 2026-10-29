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
  LifeBuoy,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { ResQLogo } from "./ui/ResQLogo";

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
  onOpenHowItWorks?: () => void;
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
  onOpenHowItWorks,
}) => {
  // Role-specific navigation specifications
  const ROLE_NAV_CONFIG: Record<
    UserRole,
    {
      portalTitle: string;
      portalBadge: string;
      portalDesc: string;
      allowedTabs: string[];
      customLabels: Record<string, string>;
    }
  > = {
    COORDINATOR: {
      portalTitle: "Tactical Command HQ",
      portalBadge: "Coordinator",
      portalDesc: "Central disaster triage & AI allocation",
      allowedTabs: [
        "OVERVIEW",
        "MAP",
        "REQUESTS",
        "SUPPLIES",
        "ALLOCATIONS",
        "FULFILMENT",
        "ANALYTICS",
        "AUDIT",
      ],
      customLabels: {
        OVERVIEW: "Command Overview",
        MAP: "Operations Map",
        REQUESTS: "Shelter Aid Requests",
        SUPPLIES: "Supply Depots",
        ALLOCATIONS: "AI Allocation Engine",
        FULFILMENT: "Deliveries & Tracking",
        ANALYTICS: "Resource Analytics",
        AUDIT: "Immutable Audit Ledger",
      },
    },
    REQUESTER: {
      portalTitle: "Shelter Requester Portal",
      portalBadge: "Requester",
      portalDesc: "Submit emergency needs & verify delivery",
      allowedTabs: ["REQUESTS", "FULFILMENT", "MAP"],
      customLabels: {
        REQUESTS: "My Shelter Requests",
        FULFILMENT: "Incoming Deliveries",
        MAP: "Shelter & Flood Map",
      },
    },
    DONOR: {
      portalTitle: "Humanitarian Donor Portal",
      portalBadge: "Donor",
      portalDesc: "Pledge supplies & track delivery impact",
      allowedTabs: ["SUPPLIES", "FULFILMENT", "ANALYTICS", "MAP"],
      customLabels: {
        SUPPLIES: "My Depot Inventory",
        FULFILMENT: "Outbound Dispatches",
        ANALYTICS: "Donation Impact",
        MAP: "Depots & Regional Heatmap",
      },
    },
    ADMIN: {
      portalTitle: "Platform Admin Console",
      portalBadge: "Administrator",
      portalDesc: "Organization compliance & system security",
      allowedTabs: ["ADMIN", "AUDIT", "ANALYTICS", "OVERVIEW"],
      customLabels: {
        ADMIN: "Platform Governance",
        AUDIT: "Immutable Audit Ledger",
        ANALYTICS: "System Telemetry",
        OVERVIEW: "Command Overview",
      },
    },
  };

  const currentRoleNav = ROLE_NAV_CONFIG[currentRole] || ROLE_NAV_CONFIG.COORDINATOR;

  const allNavItems = [
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
    {
      id: "AUDIT",
      label: "Audit Ledger",
      icon: ShieldCheck,
      badge: null,
    },
  ];

  // Filter items specifically for the active role
  const navItems = allNavItems
    .filter((item) => currentRoleNav.allowedTabs.includes(item.id))
    .map((item) => ({
      ...item,
      label: currentRoleNav.customLabels[item.id] || item.label,
    }));

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
    COORDINATOR: { label: "Coordinator", bg: "bg-[#FEF2F2]", text: "text-[#F04452]", border: "border-[#FEE2E2]" },
    REQUESTER: { label: "Requester", bg: "bg-[#FFFBEB]", text: "text-[#B45309]", border: "border-[#FEF3C7]" },
    DONOR: { label: "Donor", bg: "bg-[#F0FDFA]", text: "text-[#0F766E]", border: "border-[#CCFBF1]" },
    ADMIN: { label: "Admin", bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]", border: "border-[#EDE9FE]" },
  };

  const currentRoleConfig = roleLabels[currentRole] || roleLabels.COORDINATOR;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E7EAF0] text-[#172033] select-none">
      {/* 1. Brand Logo & Role Portal Badge */}
      <div className="p-4 border-b border-[#E7EAF0] space-y-3">
        <div className="flex items-center justify-between">
          <ResQLogo variant="full" size="sm" animated showTagline badgeText="Live" />

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#687386] hover:text-[#172033] hover:bg-[#F7F8FA] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Role Portal Indicator Header */}
        <div className={`p-2.5 rounded-xl border ${currentRoleConfig.bg} ${currentRoleConfig.border} transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${currentRoleConfig.text}`}>
              {currentRoleNav.portalTitle}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-[#4A5568] mt-0.5 font-medium line-clamp-1">
            {currentRoleNav.portalDesc}
          </p>
        </div>
      </div>

      {/* 2. Navigation items - specifically tailored for the active role */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <div className="px-3 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#8C9BAE] uppercase tracking-wider">
            {currentRoleConfig.label} Views
          </span>
          <span className="text-[10px] font-mono text-[#8C9BAE]">
            {navItems.length} pages
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
                <span className="truncate">{item.label}</span>
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

        {/* How ResQFlow Works Guide Button */}
        {onOpenHowItWorks && (
          <div className="pt-2 px-1">
            <button
              onClick={() => {
                onOpenHowItWorks();
                onCloseMobile();
              }}
              className="w-full p-2.5 rounded-xl border border-[#CCFBF1] bg-gradient-to-r from-[#F0FDFA] to-[#E6FFFA] hover:border-[#99F6E4] text-left transition-all cursor-pointer group flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-[#0F766E] leading-none">
                    How ResQFlow Works
                  </div>
                  <div className="text-[10px] text-[#115E59] mt-0.5">
                    Plain English Guide &amp; Tips
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#0F766E] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* 3. User & Organization Profile at bottom (Role Locked) */}
      <div className="p-3 border-t border-[#E7EAF0] bg-[#FFFFFF]">
        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFBFD] border border-[#E7EAF0]">
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
