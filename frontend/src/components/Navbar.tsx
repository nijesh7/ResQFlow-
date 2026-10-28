"use client";

import React from "react";
import { UserRole } from "@/types";
import {
  ShieldAlert,
  Flame,
  Radio,
  RefreshCw,
  Bell,
  UserCheck,
  Building2,
  Package,
  Layers
} from "lucide-react";

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetDemo: () => void;
  backendOnline: boolean;
  notificationCount: number;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onResetDemo,
  backendOnline,
  notificationCount,
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top emergency disclaimer bar */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 px-4 py-1 text-center text-xs font-medium text-teal-300/90 border-b border-teal-900/30 flex items-center justify-center gap-2">
        <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
        <span>Demonstration Emergency Allocation Platform &bull; Data clearly labelled for testing &bull; In real emergencies, call 112 / 911</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-black text-xl tracking-tight">
            <Flame className="w-6 h-6 text-slate-950 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">ResQ<span className="text-teal-400">Flow</span></span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                v1.0 Community
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Intelligent Emergency Resource Allocation</p>
          </div>
        </div>

        {/* Backend & Role Selector */}
        <div className="flex items-center gap-3">
          {/* Backend Status indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-800 bg-slate-900">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? "bg-emerald-500 shadow-sm shadow-emerald-500" : "bg-amber-500 shadow-sm shadow-amber-500"}`} />
            <span className="text-slate-300">
              {backendOnline ? "FastAPI Engine Active" : "Client Engine Fallback"}
            </span>
          </div>

          {/* Persona Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {(["REQUESTER", "DONOR", "COORDINATOR", "ADMIN"] as UserRole[]).map((role) => {
              const active = currentRole === role;
              return (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    active
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                  title={`Switch active persona to ${role}`}
                >
                  {role === "REQUESTER" && "Requester"}
                  {role === "DONOR" && "Donor"}
                  {role === "COORDINATOR" && "Coordinator"}
                  {role === "ADMIN" && "Admin"}
                </button>
              );
            })}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-teal-300 hover:border-teal-700/50 transition-colors"
            title="Reset Disaster Scenario Demo Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-teal-300 hover:border-teal-700/50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
