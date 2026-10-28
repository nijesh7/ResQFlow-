"use client";

import React from "react";
import { UserRole } from "@/types";
import { UserCheck, ShieldCheck, HeartHandshake, Compass, AlertCircle } from "lucide-react";

interface RoleBannerProps {
  role: UserRole;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({ role }) => {
  const roleConfig = {
    REQUESTER: {
      title: "Community Requester Persona",
      desc: "Authorized to create emergency aid requests for your shelter/community, attach needs, track allocation status, and confirm final delivery receipt.",
      icon: HeartHandshake,
      badgeColor: "bg-amber-950/80 text-amber-300 border-amber-800",
      accent: "from-amber-500/10 to-transparent",
    },
    DONOR: {
      title: "Supply Donor / NGO Depot Persona",
      desc: "Authorized to register available humanitarian relief inventory, review matched emergency requests, and track safe stock reservations.",
      icon: Compass,
      badgeColor: "bg-blue-950/80 text-blue-300 border-blue-800",
      accent: "from-blue-500/10 to-transparent",
    },
    COORDINATOR: {
      title: "Emergency Relief Coordinator Persona",
      desc: "Authorized to review unfulfilled needs, execute the transparent allocation engine, inspect priority scores, approve transaction-safe stock reservations, and dispatch aid.",
      icon: ShieldCheck,
      badgeColor: "bg-teal-950/80 text-teal-300 border-teal-800",
      accent: "from-teal-500/10 to-transparent",
    },
    ADMIN: {
      title: "Platform Administrator Persona",
      desc: "Authorized to verify humanitarian organisations, audit immutable allocation trails, detect duplicate abuse, and configure categories.",
      icon: UserCheck,
      badgeColor: "bg-purple-950/80 text-purple-300 border-purple-800",
      accent: "from-purple-500/10 to-transparent",
    },
  }[role];

  const Icon = roleConfig.icon;

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r ${roleConfig.accent} p-4 sm:p-5 mb-6`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-teal-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">{roleConfig.title}</h2>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${roleConfig.badgeColor}`}>
                Active Role
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">{roleConfig.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-teal-400" />
          <span>Server validates all actions via Admin SDK & rules</span>
        </div>
      </div>
    </div>
  );
};
