"use client";

import React, { useState } from "react";
import { Organisation, UserRole } from "@/types";
import { DEMO_ORGANISATIONS } from "@/lib/demo-data";
import { ShieldAlert, Building2, CheckCircle2, XCircle, AlertTriangle, UserX, UserCheck } from "lucide-react";

interface AdminTabProps {
  currentRole: UserRole;
}

export const AdminTab: React.FC<AdminTabProps> = ({ currentRole }) => {
  const [organisations, setOrganisations] = useState<Organisation[]>(DEMO_ORGANISATIONS);

  const handleVerify = (orgId: string, status: "Verified" | "Suspended") => {
    setOrganisations((prev) =>
      prev.map((org) => (org.organisationId === orgId ? { ...org, verificationStatus: status } : org))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">System Administration & Security Governance</h3>
        <p className="text-xs text-slate-400">Review humanitarian organisation credentials, manage privileges, and enforce security policies</p>
      </div>

      {/* Organisation Verification Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-400" />
            <h4 className="font-bold text-slate-100 text-sm">Humanitarian Organisation Verifications</h4>
          </div>
          <span className="text-xs text-slate-400">
            Never trust client-side claims &bull; Server verifies registration certificates
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {organisations.map((org) => (
            <div key={org.organisationId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{org.name}</span>
                  <span className="font-mono text-slate-400 text-[11px]">({org.organisationId})</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    org.verificationStatus === "Verified"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                      : org.verificationStatus === "Suspended"
                      ? "bg-red-950 text-red-400 border-red-800"
                      : "bg-amber-950 text-amber-300 border-amber-800"
                  }`}>
                    {org.verificationStatus}
                  </span>
                </div>
                <div className="text-slate-400">
                  Type: <strong>{org.organisationType}</strong> &bull; Service Area: {org.serviceArea} &bull; Contact: {org.contactEmail}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {org.verificationStatus !== "Verified" && (
                  <button
                    onClick={() => handleVerify(org.organisationId, "Verified")}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Verification
                  </button>
                )}

                {org.verificationStatus !== "Suspended" && (
                  <button
                    onClick={() => handleVerify(org.organisationId, "Suspended")}
                    className="px-3 py-1.5 rounded-lg border border-red-900/60 text-red-400 hover:bg-red-950/40 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Suspend Organisation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & System Rules Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
          <h4 className="font-bold text-slate-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-teal-400" />
            Security & Privacy Posture
          </h4>
          <p className="text-slate-400">
            Recipient home addresses and vulnerable family contact information are obfuscated and never exposed to the public internet. Approximate grid coordinates are used for relief logistics.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
          <h4 className="font-bold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Stock Non-Negativity Invariant
          </h4>
          <p className="text-slate-400">
            Available stock counts in Cloud Firestore are protected by ACID transactions. Concurrency locks ensure multiple simultaneous relief requests cannot exceed available depot limits.
          </p>
        </div>
      </div>
    </div>
  );
};
