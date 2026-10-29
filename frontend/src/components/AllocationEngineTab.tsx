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
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  X,
  Sparkles,
  SlidersHorizontal,
  Check,
  Ban
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
      setApprovalSuccess(`Reserved ${customQty} ${selectedRec.unit} for ${selectedRec.requester_name}!`);
      setTimeout(() => {
        setSelectedRec(null);
        setApprovalSuccess(null);
      }, 1500);
    } catch (err: any) {
      alert(`Approval error: ${err.message || "Failed to commit allocation"}`);
    } finally {
      setIsApproving(false);
    }
  };

  const recommendations = matchingResult?.recommendations || [];
  const unfulfilled = matchingResult?.unfulfilled_demands || [];
  const duplicates = matchingResult?.duplicate_flags || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Allocation Engine Workspace Header */}
      <div className="resq-surface rounded-2xl p-5 sm:p-6 bg-[#FFFFFF] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#172033] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Cpu className="w-5 h-5 text-[#12B8A6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#172033] tracking-tight">
                  Algorithmic Allocation Engine
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                  Deterministic &bull; Explainable
                </span>
              </div>
              <p className="text-xs text-[#687386] mt-0.5">
                Matches urgent shelter demands with verified stock while preventing inventory deficits
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#687386]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#12B8A6]" />
              Active Demands: <strong className="text-[#172033]">{requests.length}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#172033]" />
              Depots: <strong className="text-[#172033]">{supplies.length}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F4AE42]" />
              Non-Negative Stock Guarantee
            </span>
          </div>
        </div>

        <button
          onClick={onRunEngine}
          disabled={isLoading}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#F04452] hover:bg-[#E02E3D] text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Cpu className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Computing Matches..." : "Run Allocation Engine"}</span>
        </button>
      </div>

      {/* 2. Suspected Duplicate Requests Warning Banner */}
      {duplicates.length > 0 && (
        <div className="resq-surface rounded-2xl p-4 sm:p-5 border-l-4 border-l-[#F4AE42] bg-[#FFFFFF]">
          <div className="flex items-center gap-2 text-[#B45309] font-bold text-xs sm:text-sm mb-1">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#F4AE42]" />
            <span>Human Verification Required: {duplicates.length} Potential Duplicate Request(s)</span>
          </div>
          <p className="text-xs text-[#687386] mb-3">
            Requests are never silently discarded. Highly similar entries are highlighted for human review to prevent allocating duplicate stock.
          </p>
          <div className="space-y-2">
            {duplicates.map((dup, i) => (
              <div
                key={i}
                className="text-xs bg-[#FAFBFD] border border-[#E7EAF0] p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-[#172033]">
                    Request <span className="font-mono text-[#0F766E]">{dup.primary_request_id}</span> matches <span className="font-mono text-[#B45309]">{dup.duplicate_request_id}</span>
                  </div>
                  <ul className="text-[11px] text-[#687386] mt-0.5 space-y-0.5">
                    {dup.reasons.map((r, ri) => (
                      <li key={ri}>&bull; {r}</li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
                    Similarity: {Math.round(dup.similarity_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Recommended Allocations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#172033] flex items-center gap-2">
            <span>Optimized Recommendations</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
              {recommendations.length} Matches Found
            </span>
          </h3>
          <span className="text-xs text-[#687386]">
            Prioritized by urgency, proximity, and depot stock levels
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="resq-surface rounded-2xl p-8 text-center bg-[#FFFFFF]">
            <Cpu className="w-8 h-8 text-[#8C9BAE] mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-[#172033]">No pending recommendations</h4>
            <p className="text-xs text-[#687386] mt-1 max-w-md mx-auto">
              Click &quot;Run Allocation Engine&quot; above to evaluate all pending aid demands against current depot inventory.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const isCritical = rec.request_urgency === "CRITICAL";

              return (
                <div
                  key={rec.recommendation_id}
                  className="resq-surface-hover rounded-2xl p-4 sm:p-5 bg-[#FFFFFF] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4"
                >
                  {/* Left: Matching Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#172033]">
                        {rec.request_id}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8C9BAE]" />
                      <span className="text-xs font-mono font-bold text-[#0F766E]">
                        {rec.supply_id}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isCritical
                            ? "bg-[#FEF2F2] text-[#F04452] border border-[#FEE2E2]"
                            : "bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]"
                        }`}
                      >
                        {rec.request_urgency}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#172033] text-white">
                        Match Score: {rec.priority_score}/100
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-[#172033]">
                      <div>
                        <span className="text-[#8C9BAE] block text-[10px]">Recipient Shelter</span>
                        <span className="font-semibold">{rec.requester_name}</span>
                      </div>

                      <div>
                        <span className="text-[#8C9BAE] block text-[10px]">Fulfilling Depot</span>
                        <span className="font-semibold text-[#0F766E]">{rec.donor_name}</span>
                      </div>

                      <div>
                        <span className="text-[#8C9BAE] block text-[10px]">Proposed Quantity</span>
                        <span className="font-bold text-[#172033]">
                          {rec.proposed_quantity} / {rec.requested_quantity} {rec.unit}
                        </span>
                      </div>

                      {rec.distance_km && (
                        <div>
                          <span className="text-[#8C9BAE] block text-[10px]">Transit Distance</span>
                          <span className="font-mono font-medium">{rec.distance_km} km</span>
                        </div>
                      )}
                    </div>

                    {/* Explainable reasons pills */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {rec.priority_reasons.map((reason, ri) => (
                        <span
                          key={ri}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#FAFBFD] text-[#687386] border border-[#E7EAF0]"
                        >
                          &bull; {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Stock Impact & Action */}
                  <div className="flex items-center lg:flex-col lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E7EAF0] shrink-0">
                    <div className="text-left lg:text-right text-[11px] text-[#687386]">
                      <span>Remaining in depot: </span>
                      <strong className="text-[#172033]">
                        {rec.remaining_stock_after} {rec.unit}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenApproveModal(rec)}
                        className="px-4 py-2 rounded-xl bg-[#12B8A6] hover:bg-[#0D9488] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Review &amp; Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Unfulfilled Demands Section */}
      {unfulfilled.length > 0 && (
        <div className="resq-surface rounded-2xl p-5 bg-[#FFFFFF] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#F04452] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Unfulfilled Demands ({unfulfilled.length})</span>
            </h4>
            <span className="text-xs text-[#687386]">
              Requires additional inventory registration or donor intake
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unfulfilled.map((uf, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#FEF2F2]/60 border border-[#FEE2E2] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#172033] font-mono">{uf.request_id}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FEF2F2] text-[#F04452]">
                    {uf.urgency}
                  </span>
                </div>
                <div className="font-medium text-[#172033]">
                  Shortfall: {uf.quantity_unfulfilled} {uf.unit} of {uf.item_category}
                </div>
                <p className="text-[11px] text-[#687386]">{uf.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Approval & Reservation Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7EAF0] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] text-[#12B8A6] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[#172033] text-base">Approve &amp; Lock Stock</h3>
              </div>
              <button
                onClick={() => setSelectedRec(null)}
                className="p-1 rounded-md text-[#8C9BAE] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {approvalSuccess ? (
              <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-center space-y-1 text-xs">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-1" />
                <span className="font-bold text-[#15803D] text-sm block">Allocation Confirmed!</span>
                <p className="text-[#687386]">{approvalSuccess}</p>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E7EAF0] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#8C9BAE]">Shelter:</span>
                    <span className="font-semibold text-[#172033]">{selectedRec.requester_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C9BAE]">Depot:</span>
                    <span className="font-semibold text-[#0F766E]">{selectedRec.donor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C9BAE]">Item:</span>
                    <span className="font-semibold text-[#172033]">{selectedRec.item_category}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#172033] font-semibold mb-1">
                    Confirmed Reservation Quantity ({selectedRec.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRec.requested_quantity}
                    value={customQty}
                    onChange={(e) => setCustomQty(Number(e.target.value))}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] font-bold text-sm focus:outline-none"
                  />
                  <span className="text-[11px] text-[#8C9BAE] block mt-1">
                    Safe maximum: {selectedRec.proposed_quantity} {selectedRec.unit} based on current available depot inventory
                  </span>
                </div>

                <div>
                  <label className="block text-[#172033] font-semibold mb-1">
                    Override / Verification Rationale (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified shelter priority via satellite phone"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl p-2.5 text-[#172033] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7EAF0]">
                  <button
                    type="button"
                    onClick={() => setSelectedRec(null)}
                    className="px-3.5 py-2 rounded-xl text-[#687386] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmApproval}
                    disabled={isApproving || customQty <= 0}
                    className="px-4 py-2 rounded-xl bg-[#12B8A6] hover:bg-[#0D9488] text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isApproving ? "Reserving..." : "Confirm & Reserve"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
