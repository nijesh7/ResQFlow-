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
  ArrowRight
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
      {/* Engine Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Intelligent Allocation Engine</h3>
              <p className="text-xs text-slate-400">Rules-based deterministic matching with unfulfilled demand & explainability</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              Active Requests: <strong>{requests.length}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Verified Supply Depots: <strong>{supplies.length}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Prevents Over-allocation & Negatives
            </span>
          </div>
        </div>

        <button
          onClick={onRunEngine}
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <BrainCircuit className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Executing Matching Rules..." : "Run Allocation Engine"}
        </button>
      </div>

      {/* Suspected Duplicate Requests Warning Banner */}
      {matchingResult && matchingResult.duplicate_flags.length > 0 && (
        <div className="border border-amber-900/50 bg-amber-950/20 rounded-xl p-4">
          <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Human Review Required: {matchingResult.duplicate_flags.length} Potential Duplicate Request(s) Flagged</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            The system does NOT silently discard requests. Highly similar requests are flagged for coordinator verification to prevent double-counting supplies.
          </p>
          <div className="space-y-2">
            {matchingResult.duplicate_flags.map((dup, i) => (
              <div key={i} className="text-xs bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-200">
                    Request <span className="font-mono text-teal-400">{dup.primary_request_id}</span> &bull; Similar to <span className="font-mono text-amber-400">{dup.duplicate_request_id}</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-400 mt-1 space-y-0.5">
                    {dup.reasons.map((r, ri) => (
                      <li key={ri}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Similarity: {Math.round(dup.similarity_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proposed Recommendations */}
      {matchingResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-100 text-sm tracking-tight">Generated Allocation Recommendations</h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 font-semibold">
                {matchingResult.recommendations.length} Matches Found
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Generated: {new Date(matchingResult.generated_at).toLocaleTimeString()}
            </span>
          </div>

          {matchingResult.recommendations.length === 0 ? (
            <div className="text-center p-8 border border-slate-800 rounded-xl bg-slate-900/50 text-slate-400 text-xs">
              No matching compatible supply offers currently found for open requests. Check unfulfilled demands below.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {matchingResult.recommendations.map((rec) => (
                <div
                  key={rec.recommendation_id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Request & Matched Supply Overview */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          rec.request_urgency === "CRITICAL"
                            ? "bg-red-950 text-red-400 border border-red-800"
                            : rec.request_urgency === "HIGH"
                            ? "bg-orange-950 text-orange-400 border border-orange-800"
                            : "bg-teal-950 text-teal-400 border border-teal-800"
                        }`}>
                          {rec.request_urgency} Urgency
                        </span>

                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {rec.item_category}
                        </span>

                        {rec.is_partial && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            Partial Allocation ({rec.proposed_quantity}/{rec.requested_quantity} {rec.unit})
                          </span>
                        )}

                        <span className="text-xs font-mono text-slate-400">
                          Priority Score: <strong className="text-teal-400">{rec.priority_score} pts</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                        <span>{rec.requester_name}</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <span className="text-teal-300">{rec.donor_name}</span>
                      </div>

                      {/* Explainability reasons list */}
                      <div className="space-y-1 mt-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Reasoning & Algorithm Validation:
                        </span>
                        <ul className="text-xs space-y-1 text-slate-300">
                          {rec.priority_reasons.map((r, ri) => (
                            <li key={ri} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right: Quantity Metrics and Action */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      <div className="text-left lg:text-right">
                        <div className="text-xs text-slate-400">Proposed Stock Allocation</div>
                        <div className="text-2xl font-black text-white tracking-tight">
                          {rec.proposed_quantity} <span className="text-sm font-normal text-slate-400">{rec.unit}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Depot Stock Remaining: <strong className="text-slate-200">{rec.remaining_stock_after} {rec.unit}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenApproveModal(rec)}
                        className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
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
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg mt-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-slate-100 text-sm">Unfulfilled Emergency Demand</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  {matchingResult.unfulfilled_demands.length} Shortages
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Critical relief needs that could not be satisfied due to lack of compatible stock in donor depots. Requires donor outreach or coordinator escalation.
              </p>

              <div className="divide-y divide-slate-800">
                {matchingResult.unfulfilled_demands.map((u, ui) => (
                  <div key={ui} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-teal-400 font-semibold">{u.request_id}</span>
                        <span className="font-bold text-slate-200">{u.item_category}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          u.urgency === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" : "bg-orange-950 text-orange-400 border border-orange-800"
                        }`}>
                          {u.urgency}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-0.5">{u.reason}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="font-bold text-amber-400 text-sm">{u.quantity_unfulfilled} {u.unit}</span>
                      <span className="text-slate-500 block text-[10px]">Unmet Shortage</span>
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">Approve & Reserve Allocation</h3>
              </div>
              <button
                onClick={() => setSelectedRec(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {approvalSuccess ? (
              <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-300 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                <p className="font-bold text-sm text-white">Stock Reserved Safely</p>
                <p>{approvalSuccess}</p>
              </div>
            ) : (
              <>
                <div className="text-xs space-y-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Request:</span>
                    <span className="font-semibold text-slate-200">{selectedRec.requester_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Donor Depot:</span>
                    <span className="font-semibold text-slate-200">{selectedRec.donor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category & Unit:</span>
                    <span className="font-semibold text-teal-300">{selectedRec.item_category} ({selectedRec.unit})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended Quantity:</span>
                    <span className="font-semibold text-white">{selectedRec.proposed_quantity} {selectedRec.unit}</span>
                  </div>
                </div>

                {/* Quantity Modifier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Approved Quantity ({selectedRec.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRec.proposed_quantity}
                    value={customQty}
                    onChange={(e) => setCustomQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Transactional reservation locks this stock on the server to prevent concurrent coordinators from double-allocating.
                  </p>
                </div>

                {/* Override Reason */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Coordinator Override Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g., Expedited priority verified with shelter lead"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedRec(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmApproval}
                    disabled={isApproving || customQty <= 0}
                    className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
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
