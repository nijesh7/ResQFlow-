"use client";

import React, { useState } from "react";
import { AllocationRecord, UserRole } from "@/types";
import {
  Truck,
  CheckCircle2,
  AlertOctagon,
  XCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  Filter,
  Search,
  X,
  ChevronRight,
  FileText
} from "lucide-react";

interface FulfilmentTrackingTabProps {
  allocations: AllocationRecord[];
  onDispatch: (allocId: string, qty: number, driverInfo: string) => Promise<void>;
  onConfirmDelivery: (allocId: string, receivedQty: number, notes?: string) => Promise<void>;
  onCancelAllocation: (allocId: string, reason: string) => Promise<void>;
  currentRole: UserRole;
}

export const FulfilmentTrackingTab: React.FC<FulfilmentTrackingTabProps> = ({
  allocations,
  onDispatch,
  onConfirmDelivery,
  onCancelAllocation,
  currentRole,
}) => {
  const [activeAlloc, setActiveAlloc] = useState<AllocationRecord | null>(null);
  const [actionType, setActionType] = useState<"DISPATCH" | "CONFIRM" | "CANCEL" | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form Inputs
  const [actionQty, setActionQty] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleOpenAction = (alloc: AllocationRecord, type: "DISPATCH" | "CONFIRM" | "CANCEL") => {
    setActiveAlloc(alloc);
    setActionType(type);
    if (type === "DISPATCH") {
      setActionQty(alloc.approved_quantity);
      setNotes("Loaded on relief logistics vehicle");
    } else if (type === "CONFIRM") {
      setActionQty(alloc.dispatched_quantity || alloc.approved_quantity);
      setNotes("");
    } else {
      setNotes("Operational cancellation authorized by coordinator");
    }
  };

  const handleExecuteAction = async () => {
    if (!activeAlloc || !actionType) return;
    setIsSubmitting(true);
    try {
      if (actionType === "DISPATCH") {
        await onDispatch(activeAlloc.allocation_id, actionQty, notes);
      } else if (actionType === "CONFIRM") {
        await onConfirmDelivery(activeAlloc.allocation_id, actionQty, notes);
      } else if (actionType === "CANCEL") {
        await onCancelAllocation(activeAlloc.allocation_id, notes);
      }
      setActiveAlloc(null);
      setActionType(null);
    } catch (err: any) {
      alert(`Fulfilment update error: ${err.message || "Failed"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAllocations = allocations.filter((a) => {
    const matchesFilter =
      statusFilter === "ALL"
        ? true
        : statusFilter === "TRANSIT"
        ? a.allocation_status === "Dispatched"
        : statusFilter === "RESERVED"
        ? a.allocation_status === "Reserved"
        : statusFilter === "DELIVERED"
        ? a.allocation_status === "Received"
        : statusFilter === "DISPUTED"
        ? a.allocation_status === "Disputed"
        : true;

    const matchesSearch =
      a.allocation_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.request_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.supply_id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Controls */}
      <div className="resq-surface rounded-2xl p-5 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#172033] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-4 h-4 text-[#12B8A6]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033] tracking-tight">
                Consignment Deliveries &amp; Chain of Custody
              </h2>
              <p className="text-xs text-[#687386]">
                End-to-end transparent verification from depot reservation to verified recipient receipt
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: `All (${allocations.length})` },
            { id: "RESERVED", label: `Reserved (${allocations.filter((a) => a.allocation_status === "Reserved").length})` },
            { id: "TRANSIT", label: `In Transit (${allocations.filter((a) => a.allocation_status === "Dispatched").length})` },
            { id: "DELIVERED", label: `Delivered (${allocations.filter((a) => a.allocation_status === "Received").length})` },
            { id: "DISPUTED", label: `Disputed (${allocations.filter((a) => a.allocation_status === "Disputed").length})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === pill.id
                  ? "bg-[#172033] text-white shadow-xs"
                  : "bg-[#F7F8FA] text-[#687386] border border-[#E7EAF0] hover:text-[#172033]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Allocations Delivery Timeline Cards */}
      <div className="space-y-4">
        {filteredAllocations.length === 0 ? (
          <div className="resq-surface rounded-2xl p-8 text-center bg-[#FFFFFF]">
            <Truck className="w-8 h-8 text-[#8C9BAE] mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-[#172033]">No consignments in this state</h4>
            <p className="text-xs text-[#687386] mt-1">
              Select another filter or generate allocations in the Allocation Engine.
            </p>
          </div>
        ) : (
          filteredAllocations.map((alloc) => {
            const isDelivered = alloc.allocation_status === "Received";
            const isInTransit = alloc.allocation_status === "Dispatched";
            const isReserved = alloc.allocation_status === "Reserved";
            const isDisputed = alloc.allocation_status === "Disputed";
            const isCancelled = alloc.allocation_status === "Cancelled";

            // Determine timeline stage: 1=Reserved, 2=In Transit, 3=Delivered
            const stage = isDelivered ? 3 : isInTransit ? 2 : 1;

            return (
              <div
                key={alloc.allocation_id}
                className="resq-surface rounded-2xl p-5 bg-[#FFFFFF] space-y-4 hover:border-[#D1D5DB] transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7EAF0]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-[#172033]">
                      #{alloc.allocation_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isDelivered
                          ? "bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]"
                          : isInTransit
                          ? "bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]"
                          : isDisputed
                          ? "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]"
                          : isCancelled
                          ? "bg-[#F1F5F9] text-[#64748B]"
                          : "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]"
                      }`}
                    >
                      {alloc.allocation_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#687386]">
                    <Clock className="w-3.5 h-3.5 text-[#8C9BAE]" />
                    <span>Updated: {new Date(alloc.updated_at || alloc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Details & Quantities */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFBFD] p-3 rounded-xl border border-[#E7EAF0] text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C9BAE] block">Target Request</span>
                    <span className="font-semibold text-[#172033] font-mono">{alloc.request_id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C9BAE] block">Source Depot</span>
                    <span className="font-semibold text-[#0F766E] font-mono">{alloc.supply_id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C9BAE] block">Approved Quantity</span>
                    <span className="font-bold text-[#172033]">
                      {alloc.approved_quantity} {alloc.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C9BAE] block">Authorized Coordinator</span>
                    <span className="font-semibold text-[#172033] truncate block">
                      {alloc.approved_by}
                    </span>
                  </div>
                </div>

                {/* Visual Delivery Timeline */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-[#8C9BAE] uppercase tracking-wider block mb-3">
                    Chain of Custody Progress
                  </span>

                  <div className="relative flex items-center justify-between">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E7EAF0] -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-0.5 bg-[#12B8A6] -translate-y-1/2 z-0 transition-all duration-500"
                      style={{
                        width: stage === 3 ? "100%" : stage === 2 ? "50%" : "0%",
                      }}
                    />

                    {/* Step 1: Stock Reserved */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-[#12B8A6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#172033] mt-1.5">
                        Stock Reserved
                      </span>
                      <span className="text-[10px] text-[#8C9BAE]">Depot inventory locked</span>
                    </div>

                    {/* Step 2: In Transit */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
                          stage >= 2
                            ? "bg-[#12B8A6] text-white"
                            : "bg-[#FFFFFF] border-2 border-[#E7EAF0] text-[#8C9BAE]"
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`text-[11px] font-semibold mt-1.5 ${
                          stage >= 2 ? "text-[#172033]" : "text-[#8C9BAE]"
                        }`}
                      >
                        Dispatched
                      </span>
                      <span className="text-[10px] text-[#8C9BAE]">
                        {alloc.dispatched_quantity ? `${alloc.dispatched_quantity} ${alloc.unit} in transit` : "Awaiting dispatch"}
                      </span>
                    </div>

                    {/* Step 3: Recipient Verified */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
                          stage >= 3
                            ? "bg-[#16A34A] text-white"
                            : "bg-[#FFFFFF] border-2 border-[#E7EAF0] text-[#8C9BAE]"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[11px] font-semibold mt-1.5 ${
                          stage >= 3 ? "text-[#15803D]" : "text-[#8C9BAE]"
                        }`}
                      >
                        Delivered
                      </span>
                      <span className="text-[10px] text-[#8C9BAE]">
                        {alloc.received_quantity ? `${alloc.received_quantity} ${alloc.unit} verified` : "Pending shelter receipt"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E7EAF0]">
                  <div className="text-[11px] text-[#687386]">
                    {alloc.override_reason && (
                      <span>Note: &quot;{alloc.override_reason}&quot;</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isReserved && (
                      <button
                        onClick={() => handleOpenAction(alloc, "DISPATCH")}
                        className="px-3 py-1.5 rounded-lg bg-[#172033] hover:bg-[#232F48] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#12B8A6]" />
                        <span>Dispatch Consignment</span>
                      </button>
                    )}

                    {isInTransit && (
                      <button
                        onClick={() => handleOpenAction(alloc, "CONFIRM")}
                        className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery Receipt</span>
                      </button>
                    )}

                    {!isDelivered && !isCancelled && (
                      <button
                        onClick={() => handleOpenAction(alloc, "CANCEL")}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#687386] hover:text-[#F04452] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                      >
                        Cancel &amp; Release Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Action Modals (Dispatch / Confirm Delivery / Cancel) */}
      {activeAlloc && actionType && (
        <div className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7EAF0] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-3">
              <h3 className="font-bold text-[#172033] text-base">
                {actionType === "DISPATCH"
                  ? "Dispatch Relief Consignment"
                  : actionType === "CONFIRM"
                  ? "Confirm Delivery at Shelter"
                  : "Cancel Allocation"}
              </h3>
              <button
                onClick={() => {
                  setActiveAlloc(null);
                  setActionType(null);
                }}
                className="p-1 rounded-md text-[#8C9BAE] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E7EAF0]">
                <div className="flex justify-between">
                  <span className="text-[#8C9BAE]">Consignment ID:</span>
                  <span className="font-mono font-bold text-[#172033]">#{activeAlloc.allocation_id}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[#8C9BAE]">Approved Quantity:</span>
                  <span className="font-bold text-[#172033]">
                    {activeAlloc.approved_quantity} {activeAlloc.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[#172033] font-semibold mb-1">
                  {actionType === "CONFIRM" ? "Quantity Actually Received" : "Quantity Dispatched"}
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeAlloc.approved_quantity}
                  value={actionQty}
                  onChange={(e) => setActionQty(Number(e.target.value))}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] font-bold text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#172033] font-semibold mb-1">
                  {actionType === "DISPATCH"
                    ? "Logistics Vehicle & Driver Details"
                    : actionType === "CONFIRM"
                    ? "Recipient Verification Notes / Discrepancy"
                    : "Reason for Stock Cancellation"}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter details..."
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7EAF0]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAlloc(null);
                    setActionType(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-[#687386] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAction}
                  disabled={isSubmitting || actionQty <= 0}
                  className={`px-4 py-2 rounded-xl text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                    actionType === "CONFIRM"
                      ? "bg-[#16A34A] hover:bg-[#15803D]"
                      : actionType === "DISPATCH"
                      ? "bg-[#172033] hover:bg-[#232F48]"
                      : "bg-[#F04452] hover:bg-[#E02E3D]"
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Commit Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
