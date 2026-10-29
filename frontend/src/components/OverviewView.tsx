"use client";

import React, { useState } from "react";
import {
  AidRequest,
  SupplyOffer,
  AllocationRecord,
  UserRole,
  MatchingResult
} from "@/types";
import { DisasterMap } from "./DisasterMap";
import {
  AlertCircle,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Flame,
  Droplets,
  UtensilsCrossed,
  Pill,
  Tent,
  Layers,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Cpu,
  MapPin,
  ExternalLink,
  HelpCircle,
  Info,
  Shield
} from "lucide-react";

interface OverviewViewProps {
  requests: AidRequest[];
  supplies: SupplyOffer[];
  allocations: AllocationRecord[];
  currentRole: UserRole;
  onRunEngine: () => Promise<MatchingResult>;
  onNavigateTab: (tabId: string) => void;
  onOpenCreateRequest?: () => void;
  onOpenHowItWorks?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  requests,
  supplies,
  allocations,
  currentRole,
  onRunEngine,
  onNavigateTab,
  onOpenCreateRequest,
  onOpenHowItWorks,
}) => {
  const [isRunningAI, setIsRunningAI] = useState(false);

  // Dynamic calculations
  const criticalRequests = requests.filter((r) => r.urgency === "CRITICAL");
  const availableStock = supplies.reduce((acc, s) => acc + s.available_quantity, 0);
  const reservedStock = supplies.reduce((acc, s) => acc + s.reserved_quantity, 0);
  const verifiedDeliveries = allocations.filter((a) => a.allocation_status === "Received");
  const activeAllocationsCount = allocations.filter((a) => a.allocation_status !== "Cancelled").length;

  // Category breakdown for bottom visualization
  const categories = ["WATER", "FOOD", "MEDICINE", "SHELTER"];
  const categoryStats = categories.map((cat) => {
    const demand = requests
      .filter((r) => r.item_category.toUpperCase() === cat)
      .reduce((acc, r) => acc + r.quantity_required, 0);
    const supply = supplies
      .filter((s) => s.item_category.toUpperCase() === cat)
      .reduce((acc, s) => acc + s.available_quantity, 0);
    const pct = demand > 0 ? Math.min(100, Math.round((supply / demand) * 100)) : 100;
    return { cat, demand, supply, pct };
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "WATER":
        return Droplets;
      case "FOOD":
        return UtensilsCrossed;
      case "MEDICINE":
        return Pill;
      case "SHELTER":
        return Tent;
      default:
        return Layers;
    }
  };

  const handleQuickMatch = async () => {
    setIsRunningAI(true);
    try {
      await onRunEngine();
      onNavigateTab("ALLOCATIONS");
    } finally {
      setIsRunningAI(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Live Incident Banner */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
              Relief Operations
            </h1>
            <p className="text-sm text-[#687386] font-medium mt-0.5">
              Every resource. Every request. One coordinated response.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleQuickMatch}
              disabled={isRunningAI}
              className="px-4 py-2 rounded-xl bg-[#172033] hover:bg-[#232F48] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-70"
            >
              <Cpu className="w-4 h-4 text-[#12B8A6]" />
              <span>{isRunningAI ? "Computing..." : "Run AI Allocation"}</span>
            </button>

            <button
              onClick={() => onNavigateTab("REQUESTS")}
              className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>View All Requests</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#687386]" />
            </button>
          </div>
        </div>

        {/* Compact Live Incident Banner */}
        <div className="resq-surface rounded-xl p-3 sm:px-4 sm:py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F04452] animate-pulse shrink-0" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="font-bold text-[#172033]">
                Cyclone Michaung Response &amp; Coastal Relief
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]">
                Level 3 &bull; Critical
              </span>
              <span className="text-[#687386] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#8C9BAE]" />
                Chennai Coastal &amp; Thiruvallur District
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#8C9BAE] w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-[#E7EAF0]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated 4 mins ago
            </span>
            <button
              onClick={() => onNavigateTab("MAP")}
              className="text-[#12B8A6] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View Map</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive "How ResQFlow Works in 3 Easy Steps" Flow Banner */}
      <div className="bg-[#FFFFFF] border border-[#E7EAF0] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#12B8A6]" />
              Simplified 3-Step Crisis Operations Flow
            </h2>
            <p className="text-[11px] text-[#687386] mt-0.5">
              Click any step below to jump directly to that operation in 1 click
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenHowItWorks && (
              <button
                onClick={onOpenHowItWorks}
                className="text-[11px] font-bold text-[#0F766E] hover:text-[#0D9488] bg-[#F0FDFA] hover:bg-[#CCFBF1] px-2.5 py-1 rounded-xl border border-[#CCFBF1] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need Help? Plain English Guide</span>
              </button>
            )}
            <span className="text-[10px] font-semibold text-[#0F766E] bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#CCFBF1] self-start sm:self-auto hidden sm:inline">
              Interactive Workflow
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 */}
          <button
            onClick={() => onNavigateTab("REQUESTS")}
            className="p-3.5 rounded-xl border border-[#FEF3C7] bg-[#FFFBEB]/70 hover:bg-[#FEF3C7]/60 text-left transition-all cursor-pointer group flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              1
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#92400E]">Shelters Post Needs</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#B45309] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-[#78350F] mt-0.5 leading-tight">
                Evacuee camps log water, food, medicine, and tarpaulin demands.
              </p>
            </div>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => onNavigateTab("ALLOCATIONS")}
            className="p-3.5 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA]/70 hover:bg-[#CCFBF1]/60 text-left transition-all cursor-pointer group flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#12B8A6] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              2
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#0F766E]">AI Matches Depots</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#0F766E] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-[#115E59] mt-0.5 leading-tight">
                Deterministic engine matches local inventory by distance &amp; urgency.
              </p>
            </div>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => onNavigateTab("FULFILMENT")}
            className="p-3.5 rounded-xl border border-[#EDE9FE] bg-[#F5F3FF]/70 hover:bg-[#EDE9FE]/60 text-left transition-all cursor-pointer group flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              3
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#6D28D9]">Dispatch &amp; Verify</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6D28D9] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-[#5B21B6] mt-0.5 leading-tight">
                Drivers transit goods and shelter managers sign off on physical receipt.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Four Premium Metric Cards (Linear / Stripe style, restrained accents, subtle variations) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Critical Requests (Coral Accent) */}
        <div className="resq-surface-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-[#687386] block">Critical Requests</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#172033] tracking-tight">
                  {criticalRequests.length}
                </span>
                <span className="text-[11px] font-bold text-[#F04452] bg-[#FEF2F2] px-1.5 py-0.5 rounded border border-[#FEE2E2]">
                  Immediate Action
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#F04452] flex items-center justify-center shrink-0 border border-[#FEE2E2]/60">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] text-[#687386]">
            <span>Total requests in pool</span>
            <span className="font-semibold text-[#172033]">{requests.length} needs</span>
          </div>
        </div>

        {/* Card 2: Available Supplies (Turquoise Accent) */}
        <div className="resq-surface-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-[#687386] block">Available Supplies</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#172033] tracking-tight">
                  {availableStock.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-[#0F766E] bg-[#F0FDFA] px-1.5 py-0.5 rounded border border-[#CCFBF1]">
                  Ready
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#12B8A6] flex items-center justify-center shrink-0 border border-[#CCFBF1]/60">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] text-[#687386]">
            <span>Across depots</span>
            <span className="font-semibold text-[#172033]">{supplies.length} stockpoints</span>
          </div>
        </div>

        {/* Card 3: Active Allocations (Amber Accent) */}
        <div className="resq-surface-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-[#687386] block">Active Allocations</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#172033] tracking-tight">
                  {reservedStock.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FEF3C7]">
                  Units Locked
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#F4AE42] flex items-center justify-center shrink-0 border border-[#FEF3C7]/60">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] text-[#687386]">
            <span>Active consignments</span>
            <span className="font-semibold text-[#172033]">{activeAllocationsCount} batches</span>
          </div>
        </div>

        {/* Card 4: Verified Deliveries (Emerald Accent) */}
        <div className="resq-surface-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-[#687386] block">Verified Deliveries</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#172033] tracking-tight">
                  {verifiedDeliveries.length}
                </span>
                <span className="text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#DCFCE7]">
                  Confirmed
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0 border border-[#DCFCE7]/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] text-[#687386]">
            <span>Recipient verification</span>
            <span className="font-semibold text-[#16A34A]">100% Chain</span>
          </div>
        </div>
      </div>

      {/* 3. Balanced Two-Column Section: Left Map, Right Active Emergency Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (7 cols) */}
        <div className="lg:col-span-7">
          <DisasterMap
            requests={requests}
            supplies={supplies}
            onOpenAllocations={() => onNavigateTab("ALLOCATIONS")}
            compactHeight={true}
          />
        </div>

        {/* Right Column: Active Emergency Requests List (5 cols) */}
        <div className="lg:col-span-5 resq-surface rounded-2xl p-4 sm:p-5 flex flex-col h-full bg-[#FFFFFF]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
            <div>
              <h3 className="font-bold text-sm text-[#172033]">Urgent Shelter Demands</h3>
              <p className="text-[11px] text-[#687386]">Awaiting coordinator matching</p>
            </div>
            <button
              onClick={() => onNavigateTab("REQUESTS")}
              className="text-xs font-semibold text-[#F04452] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Table</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E7EAF0] overflow-y-auto max-h-[380px] lg:max-h-[420px] pr-1">
            {requests.slice(0, 5).map((req) => {
              const Icon = getCategoryIcon(req.item_category);
              const isCritical = req.urgency === "CRITICAL";
              return (
                <div
                  key={req.request_id}
                  className="py-3 flex items-start justify-between gap-3 hover:bg-[#FAFBFD] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isCritical
                          ? "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]"
                          : "bg-[#F7F8FA] text-[#687386] border border-[#E7EAF0]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-[#172033] truncate">
                          {req.requester_name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isCritical
                              ? "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]"
                              : req.urgency === "HIGH"
                              ? "bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]"
                              : "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]"
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#687386] truncate mt-0.5">
                        {req.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8C9BAE]">
                        <span>ID: {req.request_id}</span>
                        <span>&bull;</span>
                        <span className="text-[#172033] font-semibold">
                          {req.quantity_required} {req.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab("ALLOCATIONS")}
                    className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F7F8FA] hover:bg-[#F0F2F6] text-[#172033] border border-[#E7EAF0] transition-colors cursor-pointer"
                  >
                    Allocate
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-3 mt-auto border-t border-[#E7EAF0]">
            <button
              onClick={() => onNavigateTab("REQUESTS")}
              className="w-full py-2 rounded-xl bg-[#F7F8FA] hover:bg-[#F0F2F6] text-[#172033] text-xs font-semibold text-center border border-[#E7EAF0] transition-colors cursor-pointer"
            >
              Explore All {requests.length} Aid Demands
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Allocation Activity & Resource Availability Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Allocation Activity Feed (7 cols) */}
        <div className="lg:col-span-7 resq-surface rounded-2xl p-4 sm:p-5 bg-[#FFFFFF]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
            <div>
              <h3 className="font-bold text-sm text-[#172033]">Recent Allocation Activity</h3>
              <p className="text-[11px] text-[#687386]">Transparent consignment dispatch stream</p>
            </div>
            <button
              onClick={() => onNavigateTab("FULFILMENT")}
              className="text-xs font-semibold text-[#12B8A6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Deliveries</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E7EAF0] mt-1">
            {allocations.slice(0, 4).map((alloc) => {
              const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
                Received: { label: "Delivered", bg: "bg-[#F0FDF4]", text: "text-[#15803D]" },
                Dispatched: { label: "In Transit", bg: "bg-[#FFFBEB]", text: "text-[#B45309]" },
                Reserved: { label: "Stock Reserved", bg: "bg-[#F0FDFA]", text: "text-[#0F766E]" },
                Approved: { label: "Approved", bg: "bg-[#F7F8FA]", text: "text-[#172033]" },
                Cancelled: { label: "Released", bg: "bg-[#FEF2F2]", text: "text-[#F04452]" },
                Disputed: { label: "Disputed", bg: "bg-[#FEF2F2]", text: "text-[#F04452]" },
              };
              const currentStatus = statusConfig[alloc.allocation_status] || {
                label: alloc.allocation_status,
                bg: "bg-[#F7F8FA]",
                text: "text-[#172033]",
              };

              return (
                <div key={alloc.allocation_id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#F7F8FA] border border-[#E7EAF0] flex items-center justify-center text-[#172033] font-bold text-xs shrink-0">
                      <Truck className="w-3.5 h-3.5 text-[#687386]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#172033] truncate">
                        Consignment #{alloc.allocation_id} &bull; {alloc.approved_quantity} {alloc.unit}
                      </div>
                      <div className="text-[11px] text-[#8C9BAE] truncate">
                        Matched by {alloc.approved_by}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
                      {currentStatus.label}
                    </span>
                    <div className="text-[10px] text-[#8C9BAE] mt-0.5 font-mono">
                      {alloc.created_at ? new Date(alloc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Resource Availability Visualization (5 cols) */}
        <div className="lg:col-span-5 resq-surface rounded-2xl p-4 sm:p-5 bg-[#FFFFFF]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
            <div>
              <h3 className="font-bold text-sm text-[#172033]">Resource Readiness</h3>
              <p className="text-[11px] text-[#687386]">Supply capacity vs verified demand</p>
            </div>
            <button
              onClick={() => onNavigateTab("ANALYTICS")}
              className="text-xs font-semibold text-[#12B8A6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Telemetry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 mt-3">
            {categoryStats.map((item) => {
              const Icon = getCategoryIcon(item.cat);
              const barColor = item.pct >= 80 ? "bg-[#12B8A6]" : item.pct >= 40 ? "bg-[#F4AE42]" : "bg-[#F04452]";
              return (
                <div key={item.cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-[#172033]">
                      <Icon className="w-3.5 h-3.5 text-[#687386]" />
                      <span>{item.cat}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-[#687386]">
                        {item.supply} avail / {item.demand} req
                      </span>
                      <span className="font-bold text-[#172033] w-10 text-right">
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F1F4F8] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(100, item.pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] text-[#687386]">
            <span>Algorithm Match Confidence</span>
            <span className="font-bold text-[#12B8A6]">98.4% Deterministic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
