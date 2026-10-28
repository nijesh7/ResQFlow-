"use client";

import React, { useState } from "react";
import {
  AidRequest,
  SupplyOffer,
  MatchingResult,
  AllocationRecommendation,
  UnfulfilledDemand,
  DuplicateFlag
} from "@/types";
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  X
} from "lucide-react";

interface AllocationEngineTabProps {
  requests: AidRequest[];
  supplies: SupplyOffer[];
  onRunEngine: () => Promise<MatchingResult>;
  onApproveAllocation: (rec: AllocationRecommendation, approvedQty: number, overrideReason?: string) => Promise<void>;
  matchingResult: MatchingResult | null;
  isLoading: boolean;
}

export const AllocationEngineTab: React.FC<AllocationEngineTabProps> = ({
  requests,
  supplies,
  onRunEngine,
  onApproveAllocation,
  matchingResult,
  isLoading,
}) => {
  const [selectedRec, setSelectedRec] = useState<AllocationRecommendation | null>(null);
  const [customQty, setCustomQty] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [approvalSuccess, setApprovalSuccess] = useState<string | null>(null);

  const handleOpenApproveModal = (rec: AllocationRecommendation) => {
    setSelectedRec(rec);
    setCustomQty(rec.proposed_quantity);
    setOverrideReason("");
    setApprovalSuccess(null);
  };

  const handleConfirmApproval = async () => {
    if (!selectedRec) return;
    setIsApproving(true);
    try {
      await onApproveAllocation(selectedRec, customQty, overrideReason || undefined);
      setApprovalSuccess(`Successfully reserved ${customQty} ${selectedRec.unit} for ${selectedRec.requester_name}!`);
      setTimeout(() => {
        setSelectedRec(null);
        setApprovalSuccess(null);
      }, 1800);
    } catch (err: any) {
      alert(`Approval error: ${err.message || "Failed to commit allocation"}`);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Engine Action Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Intelligent Allocation Engine</h3>
              <p className="text-xs text-slate-500">Deterministic rules-based emergency resource matching with explainable priority scores</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              Active Demands: <strong>{requests.length}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              Verified Depots: <strong>{supplies.length}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Guaranteed Non-Negative Inventory
            </span>
          </div>
        </div>

        <button
          onClick={onRunEngine}
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <BrainCircuit className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Running Matching Rules..." : "Execute Allocation Engine"}
        </button>
      </div>

      {/* Suspected Duplicate Requests Warning Banner */}
      {matchingResult && matchingResult.duplicate_flags.length > 0 && (
        <div className="border border-amber-200 bg-amber-50/70 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Human Verification Required: {matchingResult.duplicate_flags.length} Potential Duplicate Request(s)</span>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Requests are never silently discarded. Highly similar entries are highlighted for human review to prevent allocating duplicate stock.
          </p>
          <div className="space-y-2">
            {matchingResult.duplicate_flags.map((dup, i) => (
              <div key={i} className="text-xs bg-white border border-amber-200/80 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div>
                  <div className="font-semibold text-slate-900">
                    Request <span className="font-mono text-teal-700">{dup.primary_request_id}</span> &bull; Similar to <span className="font-mono text-amber-700">{dup.duplicate_request_id}</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-500 mt-1 space-y-0.5">
                    {dup.reasons.map((r, ri) => (
                      <li key={ri}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Similarity: {Math.round(dup.similarity_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations List */}
      {matchingResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm tracking-tight">Algorithmic Allocation Proposals</h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                {matchingResult.recommendations.length} Matches Found
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Evaluated at: {new Date(matchingResult.generated_at).toLocaleTimeString()}
            </span>
          </div>

          {matchingResult.recommendations.length === 0 ? (
            <div className="text-center p-8 border border-slate-200 rounded-2xl bg-white text-slate-500 text-xs shadow-xs">
              No compatible supply offers currently match open aid requests. Check unfulfilled demands below.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {matchingResult.recommendations.map((rec) => (
                <div
                  key={rec.recommendation_id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left Details */}
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          rec.request_urgency === "CRITICAL"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : rec.request_urgency === "HIGH"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-teal-50 text-teal-700 border-teal-200"
                        }`}>
                          {rec.request_urgency} Priority
                        </span>

                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {rec.item_category}
                        </span>

                        {rec.is_partial && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-amber-600" />
                            Partial Allocation ({rec.proposed_quantity}/{rec.requested_quantity} {rec.unit})
                          </span>
                        )}

                        <span className="text-xs font-mono text-slate-500">
                          Priority Score: <strong className="text-teal-700">{rec.priority_score} pts</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                        <span>{rec.requester_name}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span className="text-teal-700">{rec.donor_name}</span>
                      </div>

                      {/* Reasons */}
                      <div className="space-y-1 mt-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                          Validation & Decision Factors:
                        </span>
                        <ul className="text-xs space-y-1 text-slate-600">
                          {rec.priority_reasons.map((r, ri) => (
                            <li key={ri} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Numbers and Approve Action */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <div className="text-xs text-slate-500 font-medium">Proposed Allocation</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight">
                          {rec.proposed_quantity} <span className="text-sm font-normal text-slate-500">{rec.unit}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Residual Depot Stock: <strong className="text-slate-800">{rec.remaining_stock_after} {rec.unit}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenApproveModal(rec)}
                        className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Review & Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Unfulfilled Demand Shortages */}
          {matchingResult.unfulfilled_demands.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs mt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-sm">Unfulfilled Emergency Demand</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  {matchingResult.unfulfilled_demands.length} Shortages
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Critical relief requests that could not be satisfied due to lack of compatible stock in donor depots.
              </p>

              <div className="divide-y divide-slate-100">
                {matchingResult.unfulfilled_demands.map((u, ui) => (
                  <div key={ui} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-teal-700 font-semibold">{u.request_id}</span>
                        <span className="font-bold text-slate-800">{u.item_category}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          u.urgency === "CRITICAL" ? "bg-red-50 text-red-700 border border-red-200" : "bg-orange-50 text-orange-700 border border-orange-200"
                        }`}>
                          {u.urgency}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{u.reason}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="font-bold text-amber-700 text-sm">{u.quantity_unfulfilled} {u.unit}</span>
                      <span className="text-slate-400 block text-[10px]">Unmet Shortage</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approval & Reservation Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Approve & Reserve Allocation</h3>
              </div>
              <button
                onClick={() => setSelectedRec(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {approvalSuccess ? (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
                <p className="font-bold text-sm text-slate-900">Stock Reserved Safely</p>
                <p>{approvalSuccess}</p>
              </div>
            ) : (
              <>
                <div className="text-xs space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Request:</span>
                    <span className="font-semibold text-slate-900">{selectedRec.requester_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Donor Depot:</span>
                    <span className="font-semibold text-slate-900">{selectedRec.donor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category & Unit:</span>
                    <span className="font-semibold text-teal-700">{selectedRec.item_category} ({selectedRec.unit})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recommended Quantity:</span>
                    <span className="font-bold text-slate-900">{selectedRec.proposed_quantity} {selectedRec.unit}</span>
                  </div>
                </div>

                {/* Quantity Modifier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Approved Quantity ({selectedRec.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRec.proposed_quantity}
                    value={customQty}
                    onChange={(e) => setCustomQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Transactional reservation locks this stock on the server to prevent concurrent coordinators from double-allocating.
                  </p>
                </div>

                {/* Override Reason */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Coordinator Override Reason (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g., Priority verified by direct radio contact with shelter..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedRec(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmApproval}
                    disabled={isApproving || customQty <= 0}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isApproving ? "Reserving Stock..." : "Confirm & Reserve Stock"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
