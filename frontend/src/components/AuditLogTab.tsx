"use client";

import React, { useState } from "react";
import { AuditLogEntry } from "@/types";
import { History, Shield, CheckCircle2, ArrowRight, Search, ShieldCheck } from "lucide-react";

interface AuditLogTabProps {
  logs: AuditLogEntry[];
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor_id.toLowerCase().includes(q) ||
      log.entity_id.toLowerCase().includes(q) ||
      (log.reason && log.reason.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Controls */}
      <div className="resq-surface rounded-2xl p-5 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#172033] text-white flex items-center justify-center shrink-0 shadow-xs">
              <History className="w-4 h-4 text-[#12B8A6]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033] tracking-tight">
                Immutable Audit Trail &amp; Chain of Custody
              </h2>
              <p className="text-xs text-[#687386]">
                Append-only cryptographic ledger of stock reservations, dispatches, handoffs, and coordinator overrides
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C9BAE]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, actor, or entity..."
              className="w-full bg-[#F7F8FA] border border-[#E7EAF0] text-[#172033] text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#CBD5E1]"
            />
          </div>

          <span className="text-xs text-[#0F766E] bg-[#F0FDFA] px-2.5 py-1.5 rounded-xl border border-[#CCFBF1] font-mono font-semibold whitespace-nowrap">
            {logs.length} Transactions
          </span>
        </div>
      </div>

      {/* 2. Audit Trail Table */}
      <div className="resq-surface rounded-2xl overflow-hidden bg-[#FFFFFF]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#172033]">
            <thead className="bg-[#FAFBFD] text-[#8C9BAE] font-semibold uppercase tracking-wider text-[11px] border-b border-[#E7EAF0]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Coordinator Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8C9BAE]">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-[#FAFBFD] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#687386] whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#172033] bg-[#F7F8FA] px-2 py-0.5 rounded-md border border-[#E7EAF0] text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#172033]">
                      {log.actor_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#687386] text-[11px]">
                      <span className="font-bold text-[#172033]">{log.entity_type}</span>: {log.entity_id}
                    </td>
                    <td className="py-3.5 px-4 text-[#687386]">
                      {log.previous_state && log.new_state ? (
                        <span className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span>
                            Avail: {JSON.stringify(log.previous_state.available_quantity ?? "")}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#12B8A6] shrink-0" />
                          <span className="text-[#0F766E] font-semibold">
                            {JSON.stringify(log.new_state.available_quantity ?? log.new_state.status ?? "")}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#8C9BAE] italic">Record Initialized</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#687386] italic max-w-xs truncate">
                      {log.reason || "Standard automated protocol"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
