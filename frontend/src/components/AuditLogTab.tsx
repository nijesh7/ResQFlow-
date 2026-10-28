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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            Immutable Audit Trail & Chain of Custody
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Append-only tamper-evident logs recording every stock reservation, dispatch, delivery confirmation, and manual override.
          </p>
        </div>
        <span className="text-xs text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 font-mono font-semibold">
          {logs.length} Logged Transactions
        </span>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by action, actor, or entity ID..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Coordinator Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200 text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {log.actor_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      <span className="font-bold text-slate-800">{log.entity_type}</span>: {log.entity_id}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.previous_state && log.new_state ? (
                        <span className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-slate-500">
                            Avail: {JSON.stringify(log.previous_state.available_quantity ?? "")}
                          </span>
                          <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
                          <span className="text-teal-700 font-semibold">
                            {JSON.stringify(log.new_state.available_quantity ?? log.new_state.status ?? "")}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Record Initialized</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
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
