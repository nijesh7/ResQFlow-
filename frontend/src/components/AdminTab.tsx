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
  Lock,
  Key,
  Users,
  Settings,
  SlidersHorizontal
} from "lucide-react";

interface AdminTabProps {
  currentRole: UserRole;
}

export const AdminTab: React.FC<AdminTabProps> = ({ currentRole }) => {
  const [organisations, setOrganisations] = useState<Organisation[]>(DEMO_ORGANISATIONS);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeAdminSection, setActiveAdminSection] = useState<"ORGS" | "PERMISSIONS" | "DATABASE">("ORGS");

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
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="resq-surface rounded-2xl p-5 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#172033] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#12B8A6]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033] tracking-tight">
                Administration &amp; System Governance
              </h2>
              <p className="text-xs text-[#687386]">
                Manage humanitarian NGO credentials, role permissions, and Cloud Firestore synchronization
              </p>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-1">
          <button
            onClick={() => setActiveAdminSection("ORGS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeAdminSection === "ORGS" ? "bg-[#FFFFFF] text-[#172033] shadow-xs" : "text-[#687386] hover:text-[#172033]"
            }`}
          >
            Organizations
          </button>
          <button
            onClick={() => setActiveAdminSection("PERMISSIONS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeAdminSection === "PERMISSIONS" ? "bg-[#FFFFFF] text-[#172033] shadow-xs" : "text-[#687386] hover:text-[#172033]"
            }`}
          >
            Role Permissions
          </button>
          <button
            onClick={() => setActiveAdminSection("DATABASE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeAdminSection === "DATABASE" ? "bg-[#FFFFFF] text-[#172033] shadow-xs" : "text-[#687386] hover:text-[#172033]"
            }`}
          >
            Cloud Firestore
          </button>
        </div>
      </div>

      {/* 2. Organizations Section */}
      {activeAdminSection === "ORGS" && (
        <div className="resq-surface rounded-2xl overflow-hidden bg-[#FFFFFF]">
          <div className="p-4 sm:p-5 border-b border-[#E7EAF0] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#172033]">Relief Organizations &amp; NGOs</h3>
              <p className="text-xs text-[#687386]">Verify accreditation to authorize dispatch access</p>
            </div>
            <span className="text-xs font-semibold text-[#0F766E] bg-[#F0FDFA] px-2.5 py-1 rounded-lg border border-[#CCFBF1]">
              {organisations.filter((o) => o.verificationStatus === "Verified").length} Verified Partners
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAFBFD] border-b border-[#E7EAF0] text-[11px] font-semibold text-[#8C9BAE] uppercase">
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Service Area</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0]">
                {organisations.map((org) => {
                  const isVerified = org.verificationStatus === "Verified";

                  return (
                    <tr key={org.organisationId} className="hover:bg-[#FAFBFD] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#172033]">{org.name}</div>
                        <div className="text-[11px] text-[#687386]">{org.contactEmail}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E7EAF0] font-medium text-[11px] text-[#172033]">
                          {org.organisationType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#4A5568]">{org.serviceArea}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isVerified
                              ? "bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]"
                              : "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]"
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                          ) : (
                            <XCircle className="w-3 h-3 text-[#F04452]" />
                          )}
                          {org.verificationStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isVerified ? (
                          <button
                            onClick={() => handleVerify(org.organisationId, "Suspended")}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#F04452] hover:bg-[#FEF2F2] border border-[#FEE2E2] transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(org.organisationId, "Verified")}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-[#12B8A6] hover:bg-[#0D9488] shadow-xs transition-colors cursor-pointer"
                          >
                            Verify &amp; Accredit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Role Permissions Section */}
      {activeAdminSection === "PERMISSIONS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              role: "Coordinator",
              desc: "Disaster Operations Lead",
              badge: "Full Allocation Authority",
              color: "border-l-[#F04452]",
              permissions: [
                "Execute intelligent allocation engine",
                "Approve and reserve depot inventory",
                "Authorize transport dispatches",
                "Resolve duplicate requests & discrepancies",
              ],
            },
            {
              role: "Requester",
              desc: "Shelter & Camp Volunteer",
              badge: "Demand Generation",
              color: "border-l-[#F4AE42]",
              permissions: [
                "Submit emergency aid requests",
                "Track assigned consignment arrival",
                "Confirm receipt & report discrepancies",
                "View local disaster alert radius",
              ],
            },
            {
              role: "Donor",
              desc: "NGO & Warehouse Supplier",
              badge: "Supply Provisioning",
              color: "border-l-[#12B8A6]",
              permissions: [
                "Register warehouse inventory & donations",
                "Set shelf life & batch expiry parameters",
                "View depot reservation progress",
                "Generate donation tax receipts",
              ],
            },
            {
              role: "Administrator",
              desc: "System & Governance Officer",
              badge: "System Wide Access",
              color: "border-l-[#172033]",
              permissions: [
                "Verify and accredit humanitarian NGOs",
                "Trigger Cloud Firestore data sync",
                "Inspect immutable cryptographic audit logs",
                "Override system matching weights",
              ],
            },
          ].map((item) => (
            <div
              key={item.role}
              className={`resq-surface rounded-2xl p-5 bg-[#FFFFFF] border-l-4 ${item.color} space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#172033]">{item.role}</h4>
                  <p className="text-xs text-[#687386]">{item.desc}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033]">
                  {item.badge}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E7EAF0] text-xs">
                {item.permissions.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#4A5568]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#12B8A6] shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Cloud Firestore Section */}
      {activeAdminSection === "DATABASE" && (
        <div className="resq-surface rounded-2xl p-5 sm:p-6 bg-[#FFFFFF] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] text-[#12B8A6] flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#172033]">Cloud Firestore Real-Time Synchronization</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                    resqflow-1b377
                  </span>
                </div>
                <p className="text-xs text-[#687386] mt-0.5">
                  Distributed document store with atomic transactions and non-negative constraints
                </p>
              </div>
            </div>

            <button
              onClick={handleSeedFirestore}
              disabled={seeding}
              className="px-4 py-2 rounded-xl bg-[#172033] hover:bg-[#232F48] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <UploadCloud className={`w-4 h-4 text-[#12B8A6] ${seeding ? "animate-bounce" : ""}`} />
              <span>{seeding ? "Seeding..." : "Seed Demo Data to Firestore"}</span>
            </button>
          </div>

          {seedResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border font-medium ${
                seedResult.success
                  ? "bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]"
                  : "bg-[#FEF2F2] text-[#F04452] border-[#FEE2E2]"
              }`}
            >
              {seedResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#F04452] shrink-0" />
              )}
              <span>{seedResult.message}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-[#FAFBFD] border border-[#E7EAF0] p-3 rounded-xl">
              <span className="text-[10px] text-[#8C9BAE] uppercase font-bold block mb-1">Collection</span>
              <strong className="text-[#172033] font-mono">aidRequests</strong>
            </div>
            <div className="bg-[#FAFBFD] border border-[#E7EAF0] p-3 rounded-xl">
              <span className="text-[10px] text-[#8C9BAE] uppercase font-bold block mb-1">Collection</span>
              <strong className="text-[#172033] font-mono">supplyOffers</strong>
            </div>
            <div className="bg-[#FAFBFD] border border-[#E7EAF0] p-3 rounded-xl">
              <span className="text-[10px] text-[#8C9BAE] uppercase font-bold block mb-1">Collection</span>
              <strong className="text-[#172033] font-mono">allocations</strong>
            </div>
            <div className="bg-[#FAFBFD] border border-[#E7EAF0] p-3 rounded-xl">
              <span className="text-[10px] text-[#8C9BAE] uppercase font-bold block mb-1">Collection</span>
              <strong className="text-[#172033] font-mono">auditLogs</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
