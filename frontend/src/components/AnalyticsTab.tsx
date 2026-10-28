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
  Legend,
  CartesianGrid
} from "recharts";
import {
  Activity,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PieChart as PieIcon,
  BarChart2,
  TrendingUp,
  Percent,
  Layers
} from "lucide-react";

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
    { name: "High Urgency", value: urgencyCounts.HIGH, color: "#f59e0b" },
    { name: "Normal Urgency", value: urgencyCounts.NORMAL, color: "#0d9488" },
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

    const coveragePct = demand > 0 ? Math.min(100, Math.round(((available + reserved) / demand) * 100)) : 100;

    return {
      category: cat,
      Demand: demand,
      Available: available,
      Reserved: reserved,
      coveragePct,
    };
  });

  // Summary Metrics
  const totalRequests = requests.length;
  const totalNeededUnits = requests.reduce((acc, r) => acc + r.quantity_required, 0);
  const totalFulfilledUnits = requests.reduce((acc, r) => acc + (r.quantity_fulfilled || 0), 0);
  const totalAvailableStock = supplies.reduce((acc, s) => acc + s.available_quantity, 0);
  const totalReservedStock = supplies.reduce((acc, s) => acc + s.reserved_quantity, 0);
  const completedDeliveries = allocations.filter((a) => a.allocation_status === "Received").length;
  const overallCoverageRate = totalNeededUnits > 0
    ? Math.min(100, Math.round(((totalAvailableStock + totalReservedStock) / totalNeededUnits) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* Tab Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-teal-600" />
            Operations Analytics & Demand Coverage
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time disaster resource balance, fulfillment rate analytics, and supply gap diagnostics.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-800">
          <Percent className="w-3.5 h-3.5 text-teal-600" />
          Overall Supply Coverage: {overallCoverageRate}%
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
            <span>Total Demand</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRequests} Requests</div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">
            {urgencyCounts.CRITICAL} Critical Urgent Needs
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
            <span>Available Stock</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalAvailableStock} Units</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ready for instant allocation
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
            <span>Reserved & In Transit</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">{totalReservedStock} Units</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Locked in active transit
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
            <span>Verified Fulfilled</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{completedDeliveries} Deliveries</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Confirmed recipient receipts
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgency Distribution */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Aid Requests by Urgency Priority</h4>
              <p className="text-xs text-slate-500">Urgency weight drives the deterministic matching score</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {totalRequests}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    color: "#0f172a"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Demand vs Available Stock */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Category Demand vs Available & Reserved Stock</h4>
              <p className="text-xs text-slate-500">Monitoring stock adequacy to prevent inventory starvation</p>
            </div>
            <span className="text-xs font-mono text-slate-400">4 Categories</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    color: "#0f172a"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
                <Bar dataKey="Demand" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Available" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Reserved" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Fulfillment Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">Detailed Category Supply & Demand Balance</h4>
          </div>
          <span className="text-xs text-slate-500">Live operational stock coverage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Resource Category</th>
                <th className="py-3 px-4">Total Demand</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Reserved Stock</th>
                <th className="py-3 px-4">Coverage Rate</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryData.map((cat) => {
                const isShortage = cat.coveragePct < 50;
                return (
                  <tr key={cat.category} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      {cat.category}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{cat.Demand} units</td>
                    <td className="py-3 px-4 text-teal-700 font-semibold">{cat.Available} units</td>
                    <td className="py-3 px-4 text-amber-700 font-semibold">{cat.Reserved} units</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cat.coveragePct >= 80
                                ? "bg-emerald-500"
                                : cat.coveragePct >= 40
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(100, cat.coveragePct)}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-700 font-semibold">{cat.coveragePct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          cat.coveragePct >= 80
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : cat.coveragePct >= 40
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {cat.coveragePct >= 80 ? "Well Stocked" : cat.coveragePct >= 40 ? "Moderate" : "Severe Deficit"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
