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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Emergency Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No new alerts. Critical emergency notifications will appear here in real-time.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <div className="flex items-center gap-1.5">
                    {item.type === "critical" && <Flame className="w-3.5 h-3.5 text-red-500" />}
                    {item.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                    {item.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {item.type === "info" && <Info className="w-3.5 h-3.5 text-teal-500" />}
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
