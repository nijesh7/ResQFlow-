"use client";

import React from "react";
import { NotificationItem } from "@/types";
import { Bell, CheckCircle2, AlertTriangle, Info, Flame, X } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white text-sm">Emergency Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
            >
              Clear All
            </button>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-800/80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No new notifications. Alerts will appear automatically as events occur.
            </div>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    {item.type === "critical" && <Flame className="w-3.5 h-3.5 text-red-400" />}
                    {item.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    {item.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {item.type === "info" && <Info className="w-3.5 h-3.5 text-teal-400" />}
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-400">{item.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
