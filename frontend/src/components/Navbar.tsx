"use client";

import React, { useState, useEffect } from "react";
import { UserRole, AuthUser } from "@/types";
import {
  Flame,
  Radio,
  RefreshCw,
  Bell,
  LogOut,
  LogIn,
  ShieldCheck,
  HeartHandshake,
  Package,
  UserCheck,
  Activity,
  Layers,
  MapPin,
  Clock,
  Compass
} from "lucide-react";

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetDemo: () => void;
  backendOnline: boolean;
  notificationCount: number;
  onOpenNotifications: () => void;
  authUser: AuthUser | null;
  onOpenLogin: () => void;
  onSignOut: () => void;
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onResetDemo,
  backendOnline,
  notificationCount,
  onOpenNotifications,
  authUser,
  onOpenLogin,
  onSignOut,
  activeTab = "OVERVIEW",
  onNavigateTab,
}) => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toISOString().substring(0, 10) + " " + now.toTimeString().substring(0, 8)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleBadges: Record<UserRole, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    COORDINATOR: {
      label: "Coordinator",
      color: "text-teal-400",
      bg: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      icon: ShieldCheck,
    },
    REQUESTER: {
      label: "Requester",
      color: "text-amber-400",
      bg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: HeartHandshake,
    },
    DONOR: {
      label: "Donor",
      color: "text-sky-400",
      bg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      icon: Package,
    },
    ADMIN: {
      label: "Admin",
      color: "text-purple-400",
      bg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      icon: UserCheck,
    },
  };

  const navLinks = [
    { id: "OVERVIEW", label: "Mission Control 360", icon: Compass },
    { id: "REQUESTS", label: "Aid Demands", icon: HeartHandshake },
    { id: "SUPPLIES", label: "Depots", icon: Package },
    { id: "ALLOCATIONS", label: "Allocation Engine", icon: Activity },
    { id: "FULFILMENT", label: "Deliveries", icon: Radio },
    { id: "ADMIN", label: "Admin & Cloud", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. Deep Petrol Navy SCADA Header Bar (Directly inspired by elements360 operations bar) */}
      <div className="bg-[#0b1e28] text-white border-b border-[#143242] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Live Emergency Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/30">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">
                  ResQ<span className="text-teal-400">Flow</span>
                  <span className="text-xs ml-1 font-mono text-teal-300 font-semibold px-1.5 py-0.5 rounded bg-teal-900/60 border border-teal-700/50">360</span>
                </span>
                <span className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Operations
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                Emergency Resource Allocation &amp; Telemetry Mission Control
              </p>
            </div>
          </div>

          {/* Right Header Status Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Live Clock (Just like the timestamp bar in elements360) */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e2735] border border-[#183a4c] text-teal-300 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>{timeStr || "2026-10-28 11:35:00"}</span>
            </div>

            {/* Backend health */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0e2735] border border-[#183a4c] text-xs">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-slate-300 font-mono text-[11px]">
                {backendOnline ? "Backend Online" : "Local Engine"}
              </span>
            </div>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-[#0e2735] hover:bg-[#143242] border border-[#183a4c] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-xs">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetDemo}
              className="p-2 rounded-xl bg-[#0e2735] hover:bg-[#143242] border border-[#183a4c] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Reset Disaster Dataset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* User Profile / Role */}
            {authUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#183a4c]">
                <div className="flex items-center gap-2 bg-[#0e2735] border border-[#183a4c] rounded-xl px-2.5 py-1">
                  <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-900 font-black text-xs flex items-center justify-center">
                    {authUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left text-xs leading-none">
                    <div className="font-semibold text-white truncate max-w-[110px] mb-0.5">
                      {authUser.displayName}
                    </div>
                    <div className="text-[10px] font-mono text-teal-400 font-bold">
                      {authUser.role}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onOpenLogin}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  title="Switch Persona / Role"
                >
                  Role
                </button>

                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Secondary Sub-Nav Bar with Crisp Operational Icons (Just like in the screenshot!) */}
      <div className="bg-[#08151c] border-b border-[#122834] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-1.5">
          <nav className="flex space-x-1 sm:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigateTab && onNavigateTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 shadow-inner"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Persona Switcher in Sub-Nav */}
          <div className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-[#122834] text-[11px]">
            <span className="text-slate-500">Persona:</span>
            {(["REQUESTER", "DONOR", "COORDINATOR", "ADMIN"] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  currentRole === role
                    ? "bg-teal-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {role.substring(0, 5)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
