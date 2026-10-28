"use client";

import React, { useState } from "react";
import { UserRole, AuthUser } from "@/types";
import {
  Flame,
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
  Shield
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

  // Quick Demo Preloaded Personas
  const demoPersonas = [
    {
      role: "COORDINATOR" as UserRole,
      title: "Relief Coordinator",
      name: "Priya Sharma",
      email: "coordinator.priya@resqflow.org",
      org: "Coastal Disaster Relief Volunteers",
      badge: "Allocation Authority",
      borderColor: "border-teal-500",
      activeBg: "bg-teal-50/80 border-teal-500 text-teal-900 ring-2 ring-teal-500/20",
      iconColor: "text-teal-600 bg-teal-100/60",
      icon: ShieldCheck,
      desc: "Execute allocation algorithms, verify urgency, and approve safe inventory reservations."
    },
    {
      role: "REQUESTER" as UserRole,
      title: "Community Requester",
      name: "Dr. Suresh Kumar",
      email: "stjude.shelter@relief.org",
      org: "St. Jude Relief Shelter (240 evacuees)",
      badge: "Shelter / Clinic Lead",
      borderColor: "border-amber-500",
      activeBg: "bg-amber-50/80 border-amber-500 text-amber-900 ring-2 ring-amber-500/20",
      iconColor: "text-amber-600 bg-amber-100/60",
      icon: HeartHandshake,
      desc: "Submit emergency supply requests, track delivery transit, and verify received aid."
    },
    {
      role: "DONOR" as UserRole,
      title: "Supply Donor / Depot",
      name: "Apex Logistics Hub",
      email: "logistics.apex@donors.org",
      org: "Apex Pharma Humanitarian Donation",
      badge: "Warehouse / Depot",
      borderColor: "border-sky-500",
      activeBg: "bg-sky-50/80 border-sky-500 text-sky-900 ring-2 ring-sky-500/20",
      iconColor: "text-sky-600 bg-sky-100/60",
      icon: Package,
      desc: "Register warehouse stocks, monitor shelf-life expiry, and manage dispatch orders."
    },
    {
      role: "ADMIN" as UserRole,
      title: "Platform Administrator",
      name: "Anand Kumar",
      email: "admin.anand@resqflow.org",
      org: "Disaster Tech Operations Authority",
      badge: "Security & Governance",
      borderColor: "border-purple-500",
      activeBg: "bg-purple-50/80 border-purple-500 text-purple-900 ring-2 ring-purple-500/20",
      iconColor: "text-purple-600 bg-purple-100/60",
      icon: UserCheck,
      desc: "Verify humanitarian organisations, inspect immutable audit logs, and manage accounts."
    }
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
      // Simulate authentication delay
      await new Promise((res) => setTimeout(res, 500));

      const user: AuthUser = {
        uid: `uid-${Date.now().toString(36)}`,
        displayName: name || email.split("@")[0],
        email: email,
        role: selectedRole,
        organisationName: orgName || "Independent Community Responder",
      };

      // Persist in localStorage
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Emergency status ticker */}
      <div className="w-full max-w-3xl mb-6 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-center text-xs text-slate-600 flex items-center justify-center gap-2 shadow-sm">
        <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
        <span>
          ResQFlow Disaster Response Network &bull; Role-Aware Secure Access &bull; For direct life threats call 112 / 911
        </span>
      </div>

      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20 mb-1">
            <Flame className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to ResQ<span className="text-teal-600">Flow</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Select your operational role below to access your emergency resource allocation dashboard.
          </p>
        </div>

        {/* STEP 1: Interactive Role Selector Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              1. Choose Your Operational Role
            </label>
            <span className="text-[11px] text-teal-600 font-semibold">Click a role to pre-fill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoPersonas.map((p) => {
              const isSelected = selectedRole === p.role;
              const Icon = p.icon;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSelectPersona(p)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? p.activeBg
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${isSelected ? p.iconColor : "bg-slate-100 text-slate-600"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">{p.title}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{p.badge}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Authentication Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Credentials & Profile Details
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">{isRegister ? "Already registered?" : "Need a new account?"}</span>
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-teal-600 hover:text-teal-700 font-semibold underline cursor-pointer"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name / Contact Lead
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@emergency.org"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Organisation / Shelter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organisation / Shelter Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Coastal Relief Shelter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 font-semibold transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer ml-auto"
            >
              {loading ? "Authenticating..." : isRegister ? `Register as ${selectedRole}` : `Sign In as ${selectedRole}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
