"use client";

import React from "react";
import { AuditLogEntry } from "@/types";
import { History, Shield, CheckCircle2, ArrowRight } from "lucide-react";

interface AuditLogTabProps {
  logs: AuditLogEntry[];
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Immutable System Audit Trail</h3>
          <p className="text-xs text-slate-400">Append-only audit logs recording every stock reservation, dispatch, delivery, and override</p>
        </div>
        <span className="text-xs text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800 font-mono">
          {logs.length} Logged Transactions
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Coordinator Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log.audit_id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {log.actor_id}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {log.entity_type}: {log.entity_id}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.previous_state && log.new_state ? (
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <span>Avail: {JSON.stringify(log.previous_state.available_quantity ?? "")}</span>
                        <ArrowRight className="w-3 h-3 text-teal-400" />
                        <span className="text-teal-300">{JSON.stringify(log.new_state.available_quantity ?? log.new_state.status ?? "")}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">Record Created</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 italic">
                    {log.reason || "Standard protocol"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
