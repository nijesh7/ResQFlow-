"use client";

import React, { useState } from "react";
import { AllocationRecord, UserRole } from "@/types";
import { Truck, CheckCircle2, AlertOctagon, XCircle, Clock, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";

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

  // Form Inputs
  const [actionQty, setActionQty] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleOpenAction = (alloc: AllocationRecord, type: "DISPATCH" | "CONFIRM" | "CANCEL") => {
    setActiveAlloc(alloc);
    setActionType(type);
    if (type === "DISPATCH") {
      setActionQty(alloc.approved_quantity);
      setNotes("Loaded on relief vehicle");
    } else if (type === "CONFIRM") {
      setActionQty(alloc.dispatched_quantity || alloc.approved_quantity);
      setNotes("");
    } else {
      setNotes("Coordinator operational cancellation");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Delivery & Fulfilment Operations</h3>
          <p className="text-xs text-slate-400">Track relief consignments from stock reservation through transit to recipient delivery</p>
        </div>
      </div>

      {allocations.length === 0 ? (
        <div className="p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/40 text-slate-400 text-xs">
          No allocations currently in progress. Run the Allocation Engine in the Coordinator dashboard to approve and dispatch aid.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {allocations.map((alloc) => {
            const isDispatched = ["Dispatched", "Partially Received", "Received", "Disputed"].includes(alloc.allocation_status);
            const isReceived = alloc.allocation_status === "Received";
            const isDisputed = alloc.allocation_status === "Disputed";
            const isCancelled = alloc.allocation_status === "Cancelled";

            return (
              <div
                key={alloc.allocation_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950 px-2 py-1 rounded border border-teal-800">
                      {alloc.allocation_id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      isReceived
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : isDisputed
                        ? "bg-red-950 text-red-400 border-red-800"
                        : isCancelled
                        ? "bg-slate-800 text-slate-400 border-slate-700"
                        : isDispatched
                        ? "bg-sky-950 text-sky-300 border-sky-800"
                        : "bg-amber-950 text-amber-300 border-amber-800"
                    }`}>
                      {alloc.allocation_status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Last updated: {new Date(alloc.updated_at).toLocaleTimeString()}
                  </div>
                </div>

                {/* Flow Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Request & Depot</span>
                    <span className="font-semibold text-slate-200 block truncate">{alloc.request_id}</span>
                    <span className="text-slate-400 block truncate">&larr; {alloc.supply_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Consignment Quantities</span>
                    <span className="font-bold text-white text-sm">
                      {alloc.approved_quantity} {alloc.unit} Approved
                    </span>
                    <span className="text-slate-400 block text-[11px]">
                      Dispatched: {alloc.dispatched_quantity || 0} &bull; Received: {alloc.received_quantity || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Authorized Coordinator</span>
                    <span className="font-semibold text-slate-300 block">{alloc.approved_by}</span>
                    {alloc.override_reason && (
                      <span className="text-amber-400/90 text-[10px] block truncate">
                        Note: {alloc.override_reason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                  {alloc.allocation_status === "Reserved" && (
                    <>
                      <button
                        onClick={() => handleOpenAction(alloc, "CANCEL")}
                        className="px-3 py-1.5 rounded-lg border border-red-900/60 text-red-400 hover:bg-red-950/40 text-xs font-semibold"
                      >
                        Cancel & Release Stock
                      </button>
                      <button
                        onClick={() => handleOpenAction(alloc, "DISPATCH")}
                        className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Dispatch Aid
                      </button>
                    </>
                  )}

                  {alloc.allocation_status === "Dispatched" && (
                    <button
                      onClick={() => handleOpenAction(alloc, "CONFIRM")}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm Delivery / Report Discrepancy
                    </button>
                  )}

                  {isReceived && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Full Aid Delivered & Confirmed by Recipient</span>
                    </div>
                  )}

                  {isDisputed && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold">
                      <AlertOctagon className="w-4 h-4 text-red-400" />
                      <span>Delivery Discrepancy Under Coordinator Investigation</span>
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {actionType === "DISPATCH" && "Dispatch Emergency Consignment"}
                {actionType === "CONFIRM" && "Confirm Consignment Receipt"}
                {actionType === "CANCEL" && "Cancel Allocation & Release Stock"}
              </h3>
              <button
                onClick={() => {
                  setActiveAlloc(null);
                  setActionType(null);
                }}
                className="text-slate-400 hover:text-white font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Allocation Ref:</span>
                <span className="font-mono text-teal-400 font-bold">{activeAlloc.allocation_id}</span>
              </div>

              {actionType !== "CANCEL" && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {actionType === "DISPATCH" ? "Dispatched Quantity" : "Quantity Received"} ({activeAlloc.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={activeAlloc.approved_quantity}
                    value={actionQty}
                    onChange={(e) => setActionQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500 font-bold"
                  />
                  {actionType === "CONFIRM" && actionQty < activeAlloc.approved_quantity && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      Reporting less than {activeAlloc.approved_quantity} {activeAlloc.unit} will flag this allocation as a Discrepancy for audit investigation.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {actionType === "DISPATCH"
                    ? "Transit Vehicle / Driver Details"
                    : actionType === "CONFIRM"
                    ? "Recipient Notes & Verification"
                    : "Mandatory Cancellation Reason"}
                </label>
                <textarea
                  rows={2}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Details for transparent audit trail..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveAlloc(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteAction}
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-lg font-bold text-white ${
                    actionType === "CANCEL" ? "bg-red-600 hover:bg-red-500" : "bg-teal-600 hover:bg-teal-500"
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
