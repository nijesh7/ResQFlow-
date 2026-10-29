"use client";

import React from "react";
import { NotificationItem } from "@/types";
import { Bell, CheckCircle2, AlertTriangle, Info, AlertCircle, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#172033]/30 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-[#FFFFFF] border-l border-[#E7EAF0] shadow-2xl flex flex-col z-10 animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E7EAF0] flex items-center justify-center text-[#172033]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#172033] text-sm leading-tight">Notifications</h3>
              <span className="text-[10px] text-[#687386]">Operational Alerts &amp; Telemetry</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#12B8A6] hover:underline font-semibold cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#8C9BAE] hover:text-[#172033] hover:bg-[#F7F8FA] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8C9BAE]">
              No new alerts. Critical emergency notifications will appear here in real-time.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-[#E7EAF0] bg-[#FAFBFD] hover:bg-[#F7F8FA] transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-[#172033]">
                  <div className="flex items-center gap-1.5">
                    {item.type === "critical" && <AlertCircle className="w-3.5 h-3.5 text-[#F04452]" />}
                    {item.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-[#F4AE42]" />}
                    {item.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                    {item.type === "info" && <Info className="w-3.5 h-3.5 text-[#12B8A6]" />}
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] text-[#8C9BAE] font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-[#687386]">{item.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
