"use client";

import React, { useState } from "react";
import { UserRole } from "@/types";
import {
  HelpCircle,
  Sparkles,
  HeartHandshake,
  Package,
  Cpu,
  Truck,
  ArrowRight,
  Info,
  ChevronDown,
  ShieldCheck,
  Zap,
  MapPin
} from "lucide-react";

interface QuickHelpBarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigateTab: (tabId: string) => void;
  onOpenHowItWorks: () => void;
  onOpenCreateRequest?: () => void;
  onOpenCreateSupply?: () => void;
}

export const QuickHelpBar: React.FC<QuickHelpBarProps> = ({
  currentRole,
  onRoleChange,
  onNavigateTab,
  onOpenHowItWorks,
  onOpenCreateRequest,
  onOpenCreateSupply,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roleInfo: Record<
    UserRole,
    {
      title: string;
      simpleDesc: string;
      bg: string;
      border: string;
      badgeText: string;
      badgeColor: string;
    }
  > = {
    COORDINATOR: {
      title: "Tactical Coordinator",
      simpleDesc: "You can triage incoming shelter needs, run the smart AI matching engine, and dispatch supply trucks.",
      bg: "bg-[#FEF2F2]/60",
      border: "border-[#FEE2E2]",
      badgeText: "Full HQ Control",
      badgeColor: "bg-[#FEF2F2] text-[#F04452] border-[#FEE2E2]",
    },
    REQUESTER: {
      title: "Shelter Lead / Requester",
      simpleDesc: "You can submit emergency requests for your evacuees and track incoming delivery vans with digital sign-off.",
      bg: "bg-[#FFFBEB]/60",
      border: "border-[#FEF3C7]",
      badgeText: "Demand Mode",
      badgeColor: "bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]",
    },
    DONOR: {
      title: "Humanitarian Donor",
      simpleDesc: "You can register warehouse stock, pledge relief goods, and see where your donations are dispatched.",
      bg: "bg-[#F0FDFA]/60",
      border: "border-[#CCFBF1]",
      badgeText: "Supply Mode",
      badgeColor: "bg-[#F0FDFA] text-[#0F766E] border-[#CCFBF1]",
    },
    ADMIN: {
      title: "Platform Administrator",
      simpleDesc: "You manage NGO accreditations, system permissions, and verify the immutable cryptographic audit trail.",
      bg: "bg-[#F5F3FF]/60",
      border: "border-[#EDE9FE]",
      badgeText: "Governance Mode",
      badgeColor: "bg-[#F5F3FF] text-[#7C3AED] border-[#EDE9FE]",
    },
  };

  const currentConfig = roleInfo[currentRole] || roleInfo.COORDINATOR;

  return (
    <div className="bg-white border border-[#E7EAF0] rounded-2xl p-3 sm:p-4 shadow-xs transition-all">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Left: Role Explanation & Quick Persona Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#172033]">
              Active Role: <span className="text-[#F04452]">{currentConfig.title}</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${currentConfig.badgeColor}`}>
              {currentConfig.badgeText}
            </span>
          </div>

          {/* 1-Click Segmented Persona Switcher */}
          <div className="flex items-center bg-[#F7F8FA] p-0.5 rounded-xl border border-[#E7EAF0] text-xs">
            {(
              [
                { role: "COORDINATOR", label: "Coordinator", icon: "⚡" },
                { role: "REQUESTER", label: "Requester", icon: "🆘" },
                { role: "DONOR", label: "Donor", icon: "📦" },
                { role: "ADMIN", label: "Admin", icon: "🛡️" },
              ] as const
            ).map((item) => {
              const isSelected = currentRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => onRoleChange(item.role as UserRole)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? "bg-white text-[#172033] shadow-xs border border-[#E7EAF0]"
                      : "text-[#687386] hover:text-[#172033]"
                  }`}
                  title={`Switch to ${item.label} view`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Launch Shortcuts & Plain English Guide Button */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          {/* Quick Action: Ask for Help (Shelter) */}
          {currentRole === "REQUESTER" && (
            <button
              onClick={() => {
                onNavigateTab("REQUESTS");
                if (onOpenCreateRequest) onOpenCreateRequest();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F04452] hover:bg-[#E02E3D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>+ Ask For Emergency Aid</span>
            </button>
          )}

          {/* Quick Action: Donate Goods (Donor) */}
          {currentRole === "DONOR" && (
            <button
              onClick={() => {
                onNavigateTab("SUPPLIES");
                if (onOpenCreateSupply) onOpenCreateSupply();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>+ Register Donated Stock</span>
            </button>
          )}

          {/* Quick Action: Auto-Match (Coordinator) */}
          {currentRole === "COORDINATOR" && (
            <button
              onClick={() => onNavigateTab("ALLOCATIONS")}
              className="px-3 py-1.5 rounded-xl bg-[#172033] hover:bg-[#232F48] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Auto-Match Aid</span>
            </button>
          )}

          {/* Track Deliveries Shortcut */}
          <button
            onClick={() => onNavigateTab("FULFILMENT")}
            className="px-3 py-1.5 rounded-xl bg-[#F7F8FA] hover:bg-[#E7EAF0] border border-[#E7EAF0] text-[#172033] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-[#687386]" />
            <span>Track Deliveries</span>
          </button>

          {/* "How It Works" Plain English Button */}
          <button
            id="quick-help-how-it-works-btn"
            onClick={onOpenHowItWorks}
            className="px-3 py-1.5 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#CCFBF1] text-[#0F766E] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Read how ResQFlow works in plain English"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How It Works</span>
          </button>
        </div>
      </div>
    </div>
  );
};
