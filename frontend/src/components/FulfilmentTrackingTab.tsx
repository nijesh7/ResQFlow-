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
  Search
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
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            Consignment Fulfilment & Delivery Tracking
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent chain-of-custody tracking from stock reservation through transit to recipient receipt.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: `All (${allocations.length})` },
            { id: "RESERVED", label: `Reserved (${allocations.filter(a => a.allocation_status === "Reserved").length})` },
            { id: "TRANSIT", label: `In Transit (${allocations.filter(a => a.allocation_status === "Dispatched").length})` },
            { id: "DELIVERED", label: `Delivered (${allocations.filter(a => a.allocation_status === "Received").length})` },
            { id: "DISPUTED", label: `Disputed (${allocations.filter(a => a.allocation_status === "Disputed").length})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === pill.id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by allocation, request, or depot ID..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-sm"
        />
      </div>

      {/* Consignment List */}
      {filteredAllocations.length === 0 ? (
        <div className="p-12 text-center border border-slate-200 rounded-2xl bg-white text-slate-500 text-xs shadow-sm">
          No matching consignments found. Run the Allocation Engine to approve recommendations and initiate deliveries.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAllocations.map((alloc) => {
            const isDispatched = ["Dispatched", "Partially Received", "Received", "Disputed"].includes(alloc.allocation_status);
            const isReceived = alloc.allocation_status === "Received";
            const isDisputed = alloc.allocation_status === "Disputed";
            const isCancelled = alloc.allocation_status === "Cancelled";

            // Step progression: 1 = Reserved, 2 = Dispatched, 3 = Received
            const currentStep = isReceived ? 3 : isDispatched ? 2 : 1;

            return (
              <div
                key={alloc.allocation_id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      {alloc.allocation_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isReceived
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isDisputed
                          ? "bg-red-50 text-red-700 border-red-200"
                          : isCancelled
                          ? "bg-slate-100 text-slate-500 border-slate-200"
                          : isDispatched
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {alloc.allocation_status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Updated: {new Date(alloc.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Visual Progress Stepper */}
                <div className="py-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                    <span className={currentStep >= 1 ? "text-teal-700 font-bold" : ""}>1. Stock Reserved</span>
                    <span className={currentStep >= 2 ? "text-sky-700 font-bold" : ""}>2. In Transit</span>
                    <span className={currentStep >= 3 ? "text-emerald-700 font-bold" : ""}>3. Delivered & Confirmed</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isReceived
                          ? "bg-emerald-500 w-full"
                          : isDispatched
                          ? "bg-sky-500 w-2/3"
                          : "bg-teal-500 w-1/3"
                      }`}
                    />
                  </div>
                </div>

                {/* Flow Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-0.5">
                      Routing & Endpoints
                    </span>
                    <div className="font-semibold text-slate-800">
                      Destination: <span className="font-mono text-teal-700">{alloc.request_id}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Source Depot: <span className="font-mono text-slate-700">{alloc.supply_id}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-0.5">
                      Quantity Accounting
                    </span>
                    <div className="font-bold text-slate-900 text-sm">
                      {alloc.approved_quantity} {alloc.unit} Approved
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Dispatched: <strong className="text-slate-700">{alloc.dispatched_quantity || 0}</strong> &bull; Received: <strong className="text-slate-700">{alloc.received_quantity || 0}</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-0.5">
                      Authorization & Audit Note
                    </span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {alloc.approved_by}
                    </div>
                    {alloc.override_reason ? (
                      <span className="text-amber-700 text-[11px] block truncate font-medium mt-0.5">
                        Note: {alloc.override_reason}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] block">Standard algorithm match</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  {alloc.allocation_status === "Reserved" && (
                    <>
                      <button
                        onClick={() => handleOpenAction(alloc, "CANCEL")}
                        className="px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel & Release Stock
                      </button>
                      <button
                        onClick={() => handleOpenAction(alloc, "DISPATCH")}
                        className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Dispatch Aid
                      </button>
                    </>
                  )}

                  {alloc.allocation_status === "Dispatched" && (
                    <button
                      onClick={() => handleOpenAction(alloc, "CONFIRM")}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm Delivery / Report Discrepancy
                    </button>
                  )}

                  {isReceived && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Full Aid Delivered & Confirmed by Recipient</span>
                    </div>
                  )}

                  {isDisputed && (
                    <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                      <AlertOctagon className="w-4 h-4 text-red-600" />
                      <span>Delivery Discrepancy Under Coordinator Review</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal */}
      {activeAlloc && actionType && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {actionType === "DISPATCH" && "Dispatch Emergency Consignment"}
                {actionType === "CONFIRM" && "Confirm Consignment Receipt"}
                {actionType === "CANCEL" && "Cancel Allocation & Release Stock"}
              </h3>
              <button
                onClick={() => {
                  setActiveAlloc(null);
                  setActionType(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Allocation Reference:</span>
                <span className="font-mono text-teal-700 font-bold">{activeAlloc.allocation_id}</span>
              </div>

              {actionType !== "CANCEL" && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {actionType === "DISPATCH" ? "Dispatched Quantity" : "Quantity Received"} ({activeAlloc.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={activeAlloc.approved_quantity}
                    value={actionQty}
                    onChange={(e) => setActionQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold"
                  />
                  {actionType === "CONFIRM" && actionQty < activeAlloc.approved_quantity && (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] mt-2 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Reporting less than {activeAlloc.approved_quantity} {activeAlloc.unit} will flag this consignment for discrepancy audit.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {actionType === "DISPATCH"
                    ? "Transit Vehicle / Driver Details"
                    : actionType === "CONFIRM"
                    ? "Recipient Notes & Verification"
                    : "Mandatory Cancellation Reason"}
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide operational details for the transparent audit log..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveAlloc(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteAction}
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-sm transition-all cursor-pointer ${
                    actionType === "CANCEL"
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-teal-600 hover:bg-teal-500"
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Confirm Action"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
