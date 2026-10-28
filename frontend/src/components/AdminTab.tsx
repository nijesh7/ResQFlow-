"use client";

import React, { useState } from "react";
import { Organisation, UserRole } from "@/types";
import { DEMO_ORGANISATIONS } from "@/lib/demo-data";
import { seedFirestoreWithDemoData } from "@/lib/firestore-sync";
import {
  ShieldAlert,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserX,
  UserCheck,
  Database,
  UploadCloud,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Lock
} from "lucide-react";

interface AdminTabProps {
  currentRole: UserRole;
}

export const AdminTab: React.FC<AdminTabProps> = ({ currentRole }) => {
  const [organisations, setOrganisations] = useState<Organisation[]>(DEMO_ORGANISATIONS);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleVerify = (orgId: string, status: "Verified" | "Suspended") => {
    setOrganisations((prev) =>
      prev.map((org) => (org.organisationId === orgId ? { ...org, verificationStatus: status } : org))
    );
  };

  const handleSeedFirestore = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedFirestoreWithDemoData();
      setSeedResult(res);
    } catch (err: any) {
      setSeedResult({ success: false, message: err.message || "Failed to seed." });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            System Administration & Cloud Database Control
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Cloud Firestore live synchronization, verify humanitarian NGO credentials, and review security controls.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Admin Role Authorized
        </span>
      </div>

      {/* Cloud Firestore Integration & Sync Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="font-bold text-base text-slate-900">Google Cloud Firestore Integration</h4>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Project: resqflow-1b377
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Connected to Google Cloud Firestore with real-time atomic transactions, least-privilege security rules, and distributed caching.
              </p>
            </div>
          </div>

          <button
            onClick={handleSeedFirestore}
            disabled={seeding}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            <UploadCloud className={`w-4 h-4 ${seeding ? "animate-bounce" : ""}`} />
            {seeding ? "Seeding Cloud Firestore..." : "Seed Demo Data to Firestore"}
          </button>
        </div>

        {seedResult && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border font-medium ${
              seedResult.success
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {seedResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{seedResult.message}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Collection</span>
            <strong className="text-slate-800 font-mono text-xs">aidRequests</strong>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Collection</span>
            <strong className="text-slate-800 font-mono text-xs">supplyOffers</strong>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Collection</span>
            <strong className="text-slate-800 font-mono text-xs">allocations</strong>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Collection</span>
            <strong className="text-slate-800 font-mono text-xs">auditLogs</strong>
          </div>
        </div>
      </div>

      {/* Organisation Verification Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">Humanitarian Organisation Verifications</h4>
          </div>
          <span className="text-xs text-slate-500">
            Never trust client-side claims &bull; Platform administrators verify official disaster relief registration
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {organisations.map((org) => (
            <div key={org.organisationId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-slate-50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{org.name}</span>
                  <span className="font-mono text-slate-500 text-[11px]">({org.organisationId})</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      org.verificationStatus === "Verified"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : org.verificationStatus === "Suspended"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {org.verificationStatus}
                  </span>
                </div>
                <div className="text-slate-500">
                  Type: <strong className="text-slate-700">{org.organisationType}</strong> &bull; Service Area: <span className="text-slate-700">{org.serviceArea}</span> &bull; Contact: <span className="text-slate-700">{org.contactEmail}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {org.verificationStatus !== "Verified" && (
                  <button
                    onClick={() => handleVerify(org.organisationId, "Verified")}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Verification
                  </button>
                )}

                {org.verificationStatus !== "Suspended" && (
                  <button
                    onClick={() => handleVerify(org.organisationId, "Suspended")}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Suspend Org
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & System Rules Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-xs space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-teal-600" />
            Security & Privacy Posture
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Recipient home addresses and vulnerable family contact information are strictly obfuscated and never exposed to the public internet. Approximate grid coordinates are used exclusively for logistics and allocation routing.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-xs space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Stock Non-Negativity Invariant
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Available depot counts in Cloud Firestore and FastAPI are protected by atomic ACID mutex locks. Concurrency guarantees ensure that multiple simultaneous relief requests cannot exceed available depot physical limits.
          </p>
        </div>
      </div>
    </div>
  );
};
