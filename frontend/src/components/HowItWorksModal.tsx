"use client";

import React, { useState } from "react";
import { UserRole } from "@/types";
import { ResQLogo } from "./ui/ResQLogo";
import {
  X,
  HeartHandshake,
  Package,
  Cpu,
  Truck,
  CheckCircle2,
  Shield,
  HelpCircle,
  Phone,
  ArrowRight,
  BookOpen,
  Info,
  Lightbulb,
  MapPin,
  Clock,
  Sparkles,
  Users
} from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole?: (role: UserRole) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<"FLOW" | "ROLES" | "GLOSSARY" | "EMERGENCY">("FLOW");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Dialog */}
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-[#E7EAF0] flex flex-col overflow-hidden text-[#172033]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E7EAF0] flex items-center justify-between bg-gradient-to-r from-[#FFFFFF] via-[#FAFBFD] to-[#F7F8FA]">
          <div className="flex items-center gap-3">
            <ResQLogo variant="icon" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-title" className="text-lg sm:text-xl font-black text-[#172033] tracking-tight">
                  How ResQFlow Works
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                  Plain English Guide
                </span>
              </div>
              <p className="text-xs text-[#687386] mt-0.5">
                Disaster relief coordination made simple, transparent, and fast for everyone.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#687386] hover:text-[#172033] hover:bg-[#F0F2F6] transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E7EAF0] px-4 sm:px-6 bg-[#FFFFFF] overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab("FLOW")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "FLOW"
                ? "bg-[#172033] text-white shadow-xs"
                : "text-[#687386] hover:text-[#172033] hover:bg-[#F7F8FA]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4-Step Relief Flow</span>
          </button>

          <button
            onClick={() => setActiveTab("ROLES")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "ROLES"
                ? "bg-[#172033] text-white shadow-xs"
                : "text-[#687386] hover:text-[#172033] hover:bg-[#F7F8FA]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Who Does What (Roles)</span>
          </button>

          <button
            onClick={() => setActiveTab("GLOSSARY")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "GLOSSARY"
                ? "bg-[#172033] text-white shadow-xs"
                : "text-[#687386] hover:text-[#172033] hover:bg-[#F7F8FA]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Jargon Buster (Glossary)</span>
          </button>

          <button
            onClick={() => setActiveTab("EMERGENCY")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "EMERGENCY"
                ? "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2] font-extrabold"
                : "text-[#687386] hover:text-[#F04452] hover:bg-[#FEF2F2]"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Emergency Contacts</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: 4-STEP RELIEF FLOW */}
          {activeTab === "FLOW" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                <div className="text-xs text-[#115E59]">
                  <span className="font-bold">The Problem:</span> During floods or cyclones, supplies often sit in warehouses while nearby shelters run out of drinking water.
                  <br />
                  <span className="font-bold">The ResQFlow Solution:</span> We connect real needs to nearby stock in seconds using transparent AI matching.
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 sm:p-5 rounded-2xl border border-[#FEF3C7] bg-[#FFFBEB]/50 hover:bg-[#FFFBEB] transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#F59E0B] text-white font-black text-sm flex items-center justify-center shadow-xs">
                      1
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#FEF3C7] text-[#B45309]">
                      Shelter Side
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#92400E] flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-[#F59E0B]" />
                      Shelter Asks for Aid
                    </h3>
                    <p className="text-xs text-[#78350F] mt-1 leading-relaxed">
                      Camp leaders say: <em>&ldquo;We have 150 evacuees and need 300 bottles of drinking water &amp; first-aid kits within 4 hours.&rdquo;</em>
                    </p>
                  </div>
                  <div className="text-[11px] text-[#B45309] font-medium bg-white/80 p-2.5 rounded-xl border border-[#FEF3C7]">
                    💡 <strong>Result:</strong> Request is verified with exact GPS coordinates and urgency priority score.
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 sm:p-5 rounded-2xl border border-[#CCFBF1] bg-[#F0FDFA]/50 hover:bg-[#F0FDFA] transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#0D9488] text-white font-black text-sm flex items-center justify-center shadow-xs">
                      2
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#CCFBF1] text-[#0F766E]">
                      Donor Side
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0F766E] flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#0D9488]" />
                      Donors Register Supplies
                    </h3>
                    <p className="text-xs text-[#115E59] mt-1 leading-relaxed">
                      Pharma firms, supermarkets, and NGOs log their available goods: <em>&ldquo;5,000 IV fluids &amp; 1,000 meal packs available at South Depot.&rdquo;</em>
                    </p>
                  </div>
                  <div className="text-[11px] text-[#0F766E] font-medium bg-white/80 p-2.5 rounded-xl border border-[#CCFBF1]">
                    💡 <strong>Result:</strong> Stock is reserved in real time so two shelters aren&apos;t promised the same goods.
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 sm:p-5 rounded-2xl border border-[#E0E7FF] bg-[#EEF2FF]/50 hover:bg-[#EEF2FF] transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#4F46E5] text-white font-black text-sm flex items-center justify-center shadow-xs">
                      3
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E0E7FF] text-[#4338CA]">
                      Engine Side
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#3730A3] flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#4F46E5]" />
                      AI Fair Matchmaker
                    </h3>
                    <p className="text-xs text-[#312E81] mt-1 leading-relaxed">
                      Our deterministic algorithm finds the closest warehouse with the fastest route, prioritizing infant care, elderly shelters, and critical medical emergencies.
                    </p>
                  </div>
                  <div className="text-[11px] text-[#4338CA] font-medium bg-white/80 p-2.5 rounded-xl border border-[#E0E7FF]">
                    💡 <strong>Result:</strong> Zero favoritism. Every decision is explainable and recorded.
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 sm:p-5 rounded-2xl border border-[#EDE9FE] bg-[#F5F3FF]/50 hover:bg-[#F5F3FF] transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white font-black text-sm flex items-center justify-center shadow-xs">
                      4
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#EDE9FE] text-[#7C3AED]">
                      Delivery Side
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#6D28D9] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#7C3AED]" />
                      Dispatch &amp; Recipient Handover
                    </h3>
                    <p className="text-xs text-[#5B21B6] mt-1 leading-relaxed">
                      A relief vehicle is dispatched. When it arrives at the camp, the shelter lead signs off on the physical delivery using a digital confirmation receipt.
                    </p>
                  </div>
                  <div className="text-[11px] text-[#6D28D9] font-medium bg-white/80 p-2.5 rounded-xl border border-[#EDE9FE]">
                    💡 <strong>Result:</strong> Complete chain of custody. Donors see proof their donation reached real victims.
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-[#687386]">
                  Ready to test it? You can test each step right now!
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab("REQUESTS");
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#F7F8FA] hover:bg-[#E7EAF0] text-[#172033] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    1. View Shelter Requests
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab("ALLOCATIONS");
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#172033] hover:bg-[#232F48] text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <span>2. Try AI Matchmaker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES */}
          {activeTab === "ROLES" && (
            <div className="space-y-4">
              <p className="text-xs text-[#687386]">
                ResQFlow tailors its screens depending on who you are. Here is what each role does:
              </p>

              <div className="space-y-3">
                {/* Requester */}
                <div className="p-4 rounded-2xl border border-[#FEF3C7] bg-[#FFFBEB]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FEF3C7] text-[#B45309]">
                        SHELTER REQUESTER
                      </span>
                      <h4 className="font-bold text-sm text-[#172033]">Camp Leads, Shelter Volunteers, Doctors</h4>
                    </div>
                    <p className="text-xs text-[#687386]">
                      Can submit emergency requests for food/water/medicine, view ETA of incoming trucks, and confirm receipt when boxes arrive.
                    </p>
                  </div>
                  {onSelectRole && (
                    <button
                      onClick={() => {
                        onSelectRole("REQUESTER");
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#FEF3C7] text-[#B45309] hover:bg-[#FEF3C7] text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      Switch to Requester View
                    </button>
                  )}
                </div>

                {/* Donor */}
                <div className="p-4 rounded-2xl border border-[#CCFBF1] bg-[#F0FDFA]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#CCFBF1] text-[#0F766E]">
                        SUPPLY DONOR / WAREHOUSE
                      </span>
                      <h4 className="font-bold text-sm text-[#172033]">NGOs, Supermarkets, Logistics Depots</h4>
                    </div>
                    <p className="text-xs text-[#687386]">
                      Can register pallets of goods, track shelf-life expiry dates, dispatch outgoing delivery vans, and view transparent impact metrics.
                    </p>
                  </div>
                  {onSelectRole && (
                    <button
                      onClick={() => {
                        onSelectRole("DONOR");
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#CCFBF1] text-[#0F766E] hover:bg-[#CCFBF1] text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      Switch to Donor View
                    </button>
                  )}
                </div>

                {/* Coordinator */}
                <div className="p-4 rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FEE2E2] text-[#F04452]">
                        TACTICAL COORDINATOR
                      </span>
                      <h4 className="font-bold text-sm text-[#172033]">Disaster Response HQ Officers</h4>
                    </div>
                    <p className="text-xs text-[#687386]">
                      Has 360&deg; visibility over all requests and warehouses, executes the automated AI matching engine, and authorizes emergency dispatches.
                    </p>
                  </div>
                  {onSelectRole && (
                    <button
                      onClick={() => {
                        onSelectRole("COORDINATOR");
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#FEE2E2] text-[#F04452] hover:bg-[#FEE2E2] text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      Switch to Coordinator View
                    </button>
                  )}
                </div>

                {/* Admin */}
                <div className="p-4 rounded-2xl border border-[#EDE9FE] bg-[#F5F3FF]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#EDE9FE] text-[#7C3AED]">
                        PLATFORM ADMIN
                      </span>
                      <h4 className="font-bold text-sm text-[#172033]">Government &amp; System Auditors</h4>
                    </div>
                    <p className="text-xs text-[#687386]">
                      Accredits relief organizations, verifies legal compliance, and inspects the cryptographic tamper-evident audit ledger.
                    </p>
                  </div>
                  {onSelectRole && (
                    <button
                      onClick={() => {
                        onSelectRole("ADMIN");
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#EDE9FE] text-[#7C3AED] hover:bg-[#EDE9FE] text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      Switch to Admin View
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GLOSSARY / JARGON BUSTER */}
          {activeTab === "GLOSSARY" && (
            <div className="space-y-3">
              <p className="text-xs text-[#687386]">
                Technical words in disaster tech can be confusing. Here is a simple translation:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-[#E7EAF0] bg-[#FFFFFF] space-y-1">
                  <span className="font-bold text-[#172033] block">AI Allocation Engine</span>
                  <p className="text-[#687386]">
                    A computer program that automatically calculates which nearby warehouse has the items a shelter needs, picking the shortest road and most urgent case.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E7EAF0] bg-[#FFFFFF] space-y-1">
                  <span className="font-bold text-[#172033] block">Critical vs High Urgency</span>
                  <p className="text-[#687386]">
                    <strong>Critical (Red):</strong> Life-threatening within 6 hours (e.g. insulin or infant drinking water).
                    <br />
                    <strong>High (Yellow):</strong> Needed within 24 hours.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E7EAF0] bg-[#FFFFFF] space-y-1">
                  <span className="font-bold text-[#172033] block">Chain of Custody</span>
                  <p className="text-[#687386]">
                    A clear record showing who picked up the boxes from the warehouse, who drove them, and who received them at the shelter door.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E7EAF0] bg-[#FFFFFF] space-y-1">
                  <span className="font-bold text-[#172033] block">Immutable Audit Ledger</span>
                  <p className="text-[#687386]">
                    A digital record that cannot be deleted or modified by anyone, ensuring zero fraud and 100% honesty in disaster donations.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E7EAF0] bg-[#FFFFFF] space-y-1">
                  <span className="font-bold text-[#172033] block">Reserved Quantity</span>
                  <p className="text-[#687386]">
                    Items in a warehouse that have already been matched to a shelter and are waiting for a truck, so they cannot be promised to someone else.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E7EAF0] bg-[#FFFFFF] space-y-1">
                  <span className="font-bold text-[#172033] block">Disaster Geo-Fence</span>
                  <p className="text-[#687386]">
                    The physical perimeter on the map affected by the disaster (e.g. flooded coastal region).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCY CONTACTS */}
          {activeTab === "EMERGENCY" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#F04452] shrink-0 mt-0.5" />
                <div className="text-xs text-[#991B1B]">
                  <span className="font-bold">Life-Threatening Emergency?</span> If immediate rescue or evacuation is needed, please call government emergency services directly.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-[#E7EAF0] bg-white text-center space-y-1">
                  <div className="text-2xl font-black text-[#F04452]">112</div>
                  <div className="text-xs font-bold text-[#172033]">National Emergency</div>
                  <p className="text-[11px] text-[#687386]">Police, Fire, Ambulance &amp; Coast Guard</p>
                </div>

                <div className="p-4 rounded-xl border border-[#E7EAF0] bg-white text-center space-y-1">
                  <div className="text-2xl font-black text-[#12B8A6]">1070</div>
                  <div className="text-xs font-bold text-[#172033]">State Disaster Control</div>
                  <p className="text-[11px] text-[#687386]">Flood &amp; Cyclone Emergency Center</p>
                </div>

                <div className="p-4 rounded-xl border border-[#E7EAF0] bg-white text-center space-y-1">
                  <div className="text-2xl font-black text-[#6366F1]">104</div>
                  <div className="text-xs font-bold text-[#172033]">Medical Helpline</div>
                  <p className="text-[11px] text-[#687386]">Emergency Medical &amp; Ambulance Triage</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#E7EAF0] bg-[#F7F8FA] text-xs text-[#687386] space-y-1.5">
                <div className="font-bold text-[#172033] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F04452]" />
                  Active Command Zone: Chennai &amp; Thiruvallur Coastal Region
                </div>
                <p>
                  Disaster Ops Room: Ripon Building Central Annex &bull; Direct Relay: +91 44 2538 4520
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E7EAF0] bg-[#FAFBFD] flex items-center justify-between">
          <span className="text-xs text-[#687386]">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E7EAF0] text-[10px] font-mono">Esc</kbd> anytime to close this guide.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#172033] hover:bg-[#232F48] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Got it, Let&apos;s Start
          </button>
        </div>
      </div>
    </div>
  );
};
