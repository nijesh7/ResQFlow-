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
  Phone,
  MapPin,
  X,
  UserPlus,
  LogIn
} from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onCancel }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("REQUESTER");

  // Form Fields
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [serviceArea, setServiceArea] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Role Definitions for Registration & Demo Personas
  const roleCards: {
    role: UserRole;
    title: string;
    subtitle: string;
    badge: string;
    accentBg: string;
    accentBorder: string;
    accentText: string;
    icon: any;
    desc: string;
    demoUser: { name: string; email: string; org: string };
  }[] = [
    {
      role: "REQUESTER",
      title: "Shelter Lead / Requester",
      subtitle: "Community Relief Unit",
      badge: "Demand Generator",
      accentBg: "bg-[#FFFBEB]",
      accentBorder: "border-[#F59E0B]",
      accentText: "text-[#B45309]",
      icon: HeartHandshake,
      desc: "Log emergency supply requests for your shelter, track incoming trucks, and sign off delivery receipts.",
      demoUser: {
        name: "Dr. Suresh Kumar",
        email: "stjude.shelter@relief.org",
        org: "St. Jude Relief Shelter (240 evacuees)",
      },
    },
    {
      role: "DONOR",
      title: "Supply Donor / Warehouse",
      subtitle: "Relief Depot Partner",
      badge: "Logistics Supplier",
      accentBg: "bg-[#F0FDFA]",
      accentBorder: "border-[#12B8A6]",
      accentText: "text-[#0F766E]",
      icon: Package,
      desc: "Register warehouse inventories, monitor shelf-life expiry, and see your donated supplies reaching victims.",
      demoUser: {
        name: "Apex Logistics Hub",
        email: "logistics.apex@donors.org",
        org: "Apex Pharma Humanitarian Donation",
      },
    },
    {
      role: "COORDINATOR",
      title: "Relief Coordinator",
      subtitle: "Crisis Operations Lead",
      badge: "Allocation Authority",
      accentBg: "bg-[#FEF2F2]",
      accentBorder: "border-[#F04452]",
      accentText: "text-[#F04452]",
      icon: ShieldCheck,
      desc: "Execute the deterministic AI matching engine, review priority scores, and dispatch relief consignments.",
      demoUser: {
        name: "Priya Sharma",
        email: "coordinator.priya@resqflow.org",
        org: "Coastal Disaster Relief Volunteers",
      },
    },
    {
      role: "ADMIN",
      title: "Platform Administrator",
      subtitle: "Governance & Compliance",
      badge: "System Security",
      accentBg: "bg-[#F5F3FF]",
      accentBorder: "border-[#7C3AED]",
      accentText: "text-[#7C3AED]",
      icon: UserCheck,
      desc: "Accredit NGOs, inspect cryptographic immutable audit ledgers, and manage platform synchronization.",
      demoUser: {
        name: "Anand Kumar",
        email: "admin.anand@resqflow.org",
        org: "Disaster Tech Operations Authority",
      },
    },
  ];

  // Select persona when signing in
  const handleSelectPersona = (p: typeof roleCards[0]) => {
    setSelectedRole(p.role);
    setName(p.demoUser.name);
    setEmail(p.demoUser.email);
    setPassword("emergency2026");
    setOrgName(p.demoUser.org);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (isRegister) {
      if (!name) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!orgName) {
        setErrorMsg("Please enter your shelter, organization, or depot name.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 450));

      const user: AuthUser = {
        uid: `uid-${Date.now().toString(36)}`,
        displayName: name || (email.split("@")[0]),
        email: email,
        role: selectedRole,
        organisationName: orgName || (selectedRole === "REQUESTER" ? "Community Relief Shelter" : "Humanitarian Logistics Partner"),
        phone: phone || undefined,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("resqflow_auth_user", JSON.stringify(user));
      }

      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative">
      {/* Top Banner */}
      <div className="w-full max-w-2xl mb-4 bg-[#FFFFFF] border border-[#E7EAF0] rounded-xl px-4 py-2 text-center text-xs text-[#687386] flex items-center justify-center gap-2 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#F04452] animate-pulse" />
        <span className="font-medium">ResQFlow Command &bull; Disaster Resource Allocation SaaS Platform</span>
      </div>

      <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#E7EAF0] rounded-3xl p-6 sm:p-9 shadow-lg shadow-black/5 space-y-6">
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
            {isRegister ? (
              <>Create a ResQ<span className="text-[#F04452]">Flow</span> Account</>
            ) : (
              <>Sign In to ResQ<span className="text-[#F04452]">Flow</span></>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#687386] max-w-md mx-auto">
            {isRegister
              ? "Register your shelter, relief depot, or crisis unit. Your role determines your access."
              : "Select your role and authenticate to access your specialized operations portal."}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs. Register */}
        <div className="flex items-center p-1 bg-[#F7F8FA] border border-[#E7EAF0] rounded-2xl max-w-sm mx-auto shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isRegister
                ? "bg-[#FFFFFF] text-[#172033] shadow-xs border border-[#E7EAF0]"
                : "text-[#687386] hover:text-[#172033]"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg(null);
              // Clear demo values for registration
              setName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setOrgName("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isRegister
                ? "bg-[#FFFFFF] text-[#F04452] shadow-xs border border-[#E7EAF0]"
                : "text-[#687386] hover:text-[#172033]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* 1. Interactive Role Selector Cards */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C9BAE]">
              1. Choose Your Operational Role
            </span>
            <span className="text-[11px] text-[#12B8A6] font-semibold">
              {isRegister ? "Determines portal permissions" : "Click to load demo profile"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {roleCards.map((p) => {
              const isSelected = selectedRole === p.role;
              const Icon = p.icon;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(p.role);
                    if (!isRegister) {
                      handleSelectPersona(p);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `border-2 ${p.accentBorder} bg-[#FAFBFD] shadow-xs ring-2 ring-black/5`
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

        {/* 2. Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-[#E7EAF0]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C9BAE]">
              2. {isRegister ? "Account & Organization Credentials" : "Enter Credentials"}
            </span>
            {!isRegister && (
              <span className="text-[11px] text-[#8C9BAE]">
                Active role: <span className="font-bold text-[#172033]">{selectedRole}</span>
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#F04452] text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Registration specific fields: Name & Organization */}
          {(isRegister || name) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Full Name / Contact Lead {isRegister && <span className="text-[#F04452]">*</span>}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                  <input
                    type="text"
                    required={isRegister}
                    placeholder="e.g. Dr. Suresh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Organization / Shelter / Depot {isRegister && <span className="text-[#F04452]">*</span>}
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                  <input
                    type="text"
                    required={isRegister}
                    placeholder={
                      selectedRole === "REQUESTER"
                        ? "e.g. St. Jude Relief Shelter (240 evacuees)"
                        : selectedRole === "DONOR"
                        ? "e.g. Apex Pharma Humanitarian Depot"
                        : "e.g. Coastal Disaster Relief Volunteers"
                    }
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional details for Register mode */}
          {isRegister && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Phone / Emergency Hotline
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98401 23456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Service Area / Zone Location
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Chennai North Zone / Ward 4B"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Official Email Address <span className="text-[#F04452]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Password <span className="text-[#F04452]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
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

          {/* Confirm Password in Register mode */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Confirm Password <span className="text-[#F04452]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#8C9BAE] absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#CBD5E1]"
                />
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg(null);
              }}
              className="text-xs text-[#687386] hover:text-[#172033] font-semibold"
            >
              {isRegister ? (
                <>Already have an account? <span className="text-[#F04452] underline">Sign In</span></>
              ) : (
                <>Need an account? <span className="text-[#F04452] underline">Register here</span></>
              )}
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#687386] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#F04452] hover:bg-[#E02E3D] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {loading
                    ? isRegister ? "Creating Account..." : "Signing In..."
                    : isRegister ? `Register as ${selectedRole}` : `Enter Portal as ${selectedRole}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
