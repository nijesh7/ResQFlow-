"use client";

import React from "react";
import { AidRequest, SupplyOffer, AllocationRecord } from "@/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Activity, ShieldAlert, Package, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface AnalyticsTabProps {
  requests: AidRequest[];
  supplies: SupplyOffer[];
  allocations: AllocationRecord[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  requests,
  supplies,
  allocations,
}) => {
  // 1. Requests by Urgency
  const urgencyCounts = {
    CRITICAL: requests.filter((r) => r.urgency === "CRITICAL").length,
    HIGH: requests.filter((r) => r.urgency === "HIGH").length,
    NORMAL: requests.filter((r) => r.urgency === "NORMAL").length,
  };

  const urgencyData = [
    { name: "Critical Urgency", value: urgencyCounts.CRITICAL, color: "#ef4444" },
    { name: "High Urgency", value: urgencyCounts.HIGH, color: "#f97316" },
    { name: "Normal Urgency", value: urgencyCounts.NORMAL, color: "#14b8a6" },
  ];

  // 2. Category Demand vs Supply
  const categories = ["WATER", "FOOD", "MEDICINE", "SHELTER"];
  const categoryData = categories.map((cat) => {
    const demand = requests
      .filter((r) => r.item_category.toUpperCase() === cat)
      .reduce((acc, cur) => acc + cur.quantity_required, 0);

    const available = supplies
      .filter((s) => s.item_category.toUpperCase() === cat)
      .reduce((acc, cur) => acc + cur.available_quantity, 0);

    const reserved = supplies
      .filter((s) => s.item_category.toUpperCase() === cat)
      .reduce((acc, cur) => acc + cur.reserved_quantity, 0);

    return {
      category: cat,
      Demand: demand,
      Available: available,
      Reserved: reserved,
    };
  });

  // Summary Metrics
  const totalRequests = requests.length;
  const totalNeededUnits = requests.reduce((acc, r) => acc + r.quantity_required, 0);
  const totalFulfilledUnits = requests.reduce((acc, r) => acc + (r.quantity_fulfilled || 0), 0);
  const totalAvailableStock = supplies.reduce((acc, s) => acc + s.available_quantity, 0);
  const totalReservedStock = supplies.reduce((acc, s) => acc + s.reserved_quantity, 0);
  const completedDeliveries = allocations.filter((a) => a.allocation_status === "Received").length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Requests</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalRequests}</div>
          <div className="text-[11px] text-teal-400 mt-0.5">
            {urgencyCounts.CRITICAL} Critical Urgent
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Available Inventory</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalAvailableStock}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Active verified donor stock
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Reserved Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{totalReservedStock}</div>
          <div className="text-[11px] text-amber-400/80 mt-0.5">
            Locked in approved transit
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Fulfilled Receipts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{completedDeliveries}</div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">
            Verified recipient deliveries
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgency Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <h4 className="font-bold text-white text-sm mb-1">Aid Requests by Urgency Priority</h4>
          <p className="text-xs text-slate-400 mb-4">Urgency weight guides deterministic allocation ranking</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Demand vs Available Stock */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <h4 className="font-bold text-white text-sm mb-1">Category Demand vs Available & Reserved Stock</h4>
          <p className="text-xs text-slate-400 mb-4">Stock safety monitoring to avoid inventory starvation</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Demand" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Reserved" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
