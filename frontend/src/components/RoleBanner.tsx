"use client";

import React, { useState } from "react";
import { UserRole, AuthUser } from "@/types";
import {
  AlertCircle,
  ShieldCheck,
  HeartHandshake,
  Package,
  UserCheck,
  ArrowRight,
  X,
  Radio,
  Info
} from "lucide-react";

interface RoleBannerProps {
  role: UserRole;
  authUser?: AuthUser | null;
  onNavigateTab?: (tab: string) => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({ role, authUser, onNavigateTab }) => {
  const [alertDismissed, setAlertDismissed] = useState<boolean>(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const userName = authUser?.displayName || (
    role === "COORDINATOR" ? "Priya Sharma" :
    role === "REQUESTER" ? "Dr. Suresh Kumar" :
    role === "DONOR" ? "Apex Logistics" : "Anand Kumar"
  );

  const roleMeta = {
    COORDINATOR: {
      subtitle: "Review emergency demands, execute the transparent allocation engine, and approve safe stock reservations.",
      actionLabel: "Launch Allocation Engine",
      targetTab: "ALLOCATIONS",
      badge: "Emergency Coordinator",
      badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    },
    REQUESTER: {
      subtitle: "Submit aid requirements for your shelter or clinic, track delivery transit, and verify quantities received.",
      actionLabel: "Submit Aid Request",
      targetTab: "REQUESTS",
      badge: "Community Requester",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    },
    DONOR: {
      subtitle: "Register relief warehouse inventories, monitor shelf-life constraints, and manage reserved stock.",
      actionLabel: "Register Depot Supplies",
      targetTab: "SUPPLIES",
      badge: "Supply Donor",
      badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    },
    ADMIN: {
      subtitle: "Verify humanitarian organisations, manage permissions, synchronize Firestore database, and review immutable audit trails.",
      actionLabel: "Manage Firestore & NGOs",
      targetTab: "ADMIN",
      badge: "Platform Administrator",
      badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    },
  }[role];

  return (
    <div className="space-y-3 mb-6">
      {/* Compact Active Emergency Alert */}
      {!alertDismissed && (
        <div className="bg-red-50/90 border border-red-200/90 rounded-xl p-3 sm:px-4 flex items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-md bg-red-100 text-red-700">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <div className="text-slate-800">
              <span className="font-bold text-red-900">Level 3 Flood Alert &bull; Coastal Basin Ward 4:</span>{" "}
              <span className="text-slate-600">Flash waterlogging reported. High priority for potable water and trauma kits.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("OVERVIEW")}
                className="font-semibold text-red-700 hover:text-red-900 hover:underline px-2 py-0.5"
              >
                View on Map
              </button>
            )}
            <button
              onClick={() => setAlertDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              title="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Elegant Welcome & Context Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {userName.split(" ")[0]}
            </h1>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${roleMeta.badgeClass}`}>
              {roleMeta.badge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            {roleMeta.subtitle}
          </p>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab(roleMeta.targetTab)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <span>{roleMeta.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
