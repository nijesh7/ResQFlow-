"use client";

import React, { useState } from "react";
import { UserRole, AuthUser } from "@/types";
import {
  ShieldCheck,
  HeartHandshake,
  Package,
  UserCheck,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Radio,
  Shield,
  X
} from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onCancel }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("COORDINATOR");

  // Form Fields
  const [name, setName] = useState<string>("Priya Sharma");
  const [email, setEmail] = useState<string>("coordinator.priya@resqflow.org");
  const [password, setPassword] = useState<string>("emergency2026");
  const [orgName, setOrgName] = useState<string>("Coastal Disaster Relief Volunteers");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Demo Personas
  const demoPersonas = [
    {
      role: "COORDINATOR" as UserRole,
      title: "Relief Coordinator",
      name: "Priya Sharma",
      email: "coordinator.priya@resqflow.org",
      org: "Coastal Disaster Relief Volunteers",
      badge: "Allocation Authority",
      accentBg: "bg-[#FEF2F2]",
      accentBorder: "border-[#F04452]",
      accentText: "text-[#F04452]",
      icon: ShieldCheck,
      desc: "Execute allocation algorithms, verify urgency, and approve safe inventory reservations.",
    },
    {
      role: "REQUESTER" as UserRole,
      title: "Community Shelter Lead",
      name: "Dr. Suresh Kumar",
      email: "stjude.shelter@relief.org",
      org: "St. Jude Relief Shelter (240 evacuees)",
      badge: "Demand Generator",
      accentBg: "bg-[#FFFBEB]",
      accentBorder: "border-[#F4AE42]",
      accentText: "text-[#B45309]",
      icon: HeartHandshake,
      desc: "Submit emergency supply requests, track delivery transit, and verify received aid.",
    },
    {
      role: "DONOR" as UserRole,
      title: "Supply Depot Manager",
      name: "Apex Logistics Hub",
      email: "logistics.apex@donors.org",
      org: "Apex Pharma Humanitarian Donation",
      badge: "Warehouse & Supplies",
      accentBg: "bg-[#F0FDFA]",
      accentBorder: "border-[#12B8A6]",
      accentText: "text-[#0F766E]",
      icon: Package,
      desc: "Register warehouse stocks, monitor shelf-life expiry, and manage dispatch orders.",
    },
    {
      role: "ADMIN" as UserRole,
      title: "Platform Administrator",
      name: "Anand Kumar",
      email: "admin.anand@resqflow.org",
      org: "Disaster Tech Operations Authority",
      badge: "Governance & Cloud",
      accentBg: "bg-[#F5F3FF]",
      accentBorder: "border-[#7C3AED]",
      accentText: "text-[#7C3AED]",
      icon: UserCheck,
      desc: "Verify humanitarian organisations, inspect immutable audit logs, and manage accounts.",
    },
  ];

  const handleSelectPersona = (p: typeof demoPersonas[0]) => {
    setSelectedRole(p.role);
    setName(p.name);
    setEmail(p.email);
    setOrgName(p.org);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      await new Promise((res) => setTimeout(res, 400));

      const user: AuthUser = {
        uid: `uid-${Date.now().toString(36)}`,
        displayName: name || email.split("@")[0],
        email: email,
        role: selectedRole,
        organisationName: orgName || "Independent Community Responder",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("resqflow_auth_user", JSON.stringify(user));
      }

      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGuest = () => {
    const user: AuthUser = {
      uid: "guest-coord-01",
      displayName: "Priya Sharma",
      email: "coordinator.priya@resqflow.org",
      role: "COORDINATOR",
      organisationName: "Coastal Disaster Relief Volunteers",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("resqflow_auth_user", JSON.stringify(user));
    }
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative">
      {/* Top Banner */}
      <div className="w-full max-w-2xl mb-6 bg-[#FFFFFF] border border-[#E7EAF0] rounded-xl px-4 py-2 text-center text-xs text-[#687386] flex items-center justify-center gap-2 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#F04452] animate-pulse" />
        <span>ResQFlow Command &bull; Disaster Response &amp; Emergency Resource Allocation</span>
      </div>

      <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#E7EAF0] rounded-3xl p-6 sm:p-9 shadow-lg shadow-black/4 space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F04452] to-[#E02E3D] text-white shadow-md shadow-red-500/20 mb-1">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v16M4 12h16" />
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Sign In to ResQ<span className="text-[#F04452]">Flow</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#687386] max-w-md mx-auto">
            Choose your disaster management role or select a persona for the demonstration.
          </p>
        </div>

        {/* 1. Interactive Role Selector Cards */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C9BAE]">
              1. Select Operational Persona
            </span>
            <span className="text-[11px] text-[#12B8A6] font-semibold">Click to prefill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {demoPersonas.map((p) => {
              const isSelected = selectedRole === p.role;
              const Icon = p.icon;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSelectPersona(p)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `border-2 ${p.accentBorder} bg-[#FAFBFD] shadow-xs`
                      : "border-[#E7EAF0] bg-[#FFFFFF] hover:bg-[#FAFBFD]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${p.accentBg} ${p.accentText}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#172033]">{p.title}</div>
                        <div className="text-[10px] text-[#8C9BAE]">{p.badge}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#12B8A6] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#687386] line-clamp-2">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-[#E7EAF0]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C9BAE]">
              2. Profile &amp; Authentication
            </span>
            <button
              type="button"
              onClick={handleQuickGuest}
              className="text-xs text-[#12B8A6] hover:underline font-semibold cursor-pointer"
            >
              Quick Demo Access &rarr;
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#F04452] text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Full Name / Contact Lead
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Organization / Facility Name
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-9 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#8C9BAE] hover:text-[#172033]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#687386] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#F04452] hover:bg-[#E02E3D] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Signing In..." : "Enter ResQFlow Command"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
