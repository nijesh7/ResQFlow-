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
  Layers,
  ShieldCheck,
  TrendingDown
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
  // 1. Urgency Counts & Pie Data
  const urgencyCounts = {
    CRITICAL: requests.filter((r) => r.urgency === "CRITICAL").length,
    HIGH: requests.filter((r) => r.urgency === "HIGH").length,
    NORMAL: requests.filter((r) => r.urgency === "NORMAL").length,
  };

  const urgencyData = [
    { name: "Critical Need", value: urgencyCounts.CRITICAL, color: "#F04452" },
    { name: "High Urgency", value: urgencyCounts.HIGH, color: "#F4AE42" },
    { name: "Normal Priority", value: urgencyCounts.NORMAL, color: "#12B8A6" },
  ];

  // 2. Category Demand vs Supply Data
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
    const unmet = Math.max(0, demand - (available + reserved));

    return {
      category: cat,
      Demand: demand,
      Available: available,
      Reserved: reserved,
      coveragePct,
      unmet,
    };
  });

  // Summary Metrics
  const totalRequests = requests.length;
  const totalNeededUnits = requests.reduce((acc, r) => acc + r.quantity_required, 0);
  const totalFulfilledUnits = requests.reduce((acc, r) => acc + (r.quantity_fulfilled || 0), 0);
  const totalAvailableStock = supplies.reduce((acc, s) => acc + s.available_quantity, 0);
  const totalReservedStock = supplies.reduce((acc, s) => acc + s.reserved_quantity, 0);
  const completedDeliveries = allocations.filter((a) => a.allocation_status === "Received").length;
  const overallCoverageRate =
    totalNeededUnits > 0
      ? Math.min(100, Math.round(((totalAvailableStock + totalReservedStock) / totalNeededUnits) * 100))
      : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Summary Strip */}
      <div className="resq-surface rounded-2xl p-5 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#172033] text-white flex items-center justify-center shrink-0 shadow-xs">
              <BarChart2 className="w-4 h-4 text-[#12B8A6]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033] tracking-tight">
                Operations Telemetry &amp; Demand Coverage
              </h2>
              <p className="text-xs text-[#687386]">
                Empirical resource analytics, fulfillment efficiency, and supply deficit diagnostics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] text-xs font-semibold text-[#0F766E] flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5" />
            <span>Overall Coverage: {overallCoverageRate}%</span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="resq-surface rounded-2xl p-4 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386] block mb-1">Total Shelter Demand</span>
          <div className="text-2xl font-black text-[#172033]">{totalNeededUnits.toLocaleString()}</div>
          <span className="text-[11px] text-[#F04452] font-semibold block mt-1">
            {urgencyCounts.CRITICAL} Critical Needs
          </span>
        </div>

        <div className="resq-surface rounded-2xl p-4 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386] block mb-1">Depot Stock Ready</span>
          <div className="text-2xl font-black text-[#172033]">{totalAvailableStock.toLocaleString()}</div>
          <span className="text-[11px] text-[#0F766E] font-semibold block mt-1">
            Available across depots
          </span>
        </div>

        <div className="resq-surface rounded-2xl p-4 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386] block mb-1">Committed / Transit</span>
          <div className="text-2xl font-black text-[#172033]">{totalReservedStock.toLocaleString()}</div>
          <span className="text-[11px] text-[#B45309] font-semibold block mt-1">
            Locked allocations
          </span>
        </div>

        <div className="resq-surface rounded-2xl p-4 bg-[#FFFFFF]">
          <span className="text-xs font-semibold text-[#687386] block mb-1">Verified Receipts</span>
          <div className="text-2xl font-black text-[#172033]">{completedDeliveries}</div>
          <span className="text-[11px] text-[#15803D] font-semibold block mt-1">
            Confirmed shelter deliveries
          </span>
        </div>
      </div>

      {/* 3. Recharts Section: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Resource Distribution BarChart (7 cols) */}
        <div className="lg:col-span-7 resq-surface rounded-2xl p-5 bg-[#FFFFFF] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
            <div>
              <h3 className="font-bold text-sm text-[#172033]">Resource Demand vs Available Stock</h3>
              <p className="text-[11px] text-[#687386]">Comparison of required units vs warehouse availability</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#687386]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#172033]" /> Demand
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#12B8A6]" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F4AE42]" /> Reserved
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F4F8" />
                <XAxis dataKey="category" tick={{ fill: "#687386", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#687386", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E7EAF0",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 12px rgba(16, 24, 40, 0.08)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="Demand" fill="#172033" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Available" fill="#12B8A6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Reserved" fill="#F4AE42" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Urgency Distribution Donut (5 cols) */}
        <div className="lg:col-span-5 resq-surface rounded-2xl p-5 bg-[#FFFFFF] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
            <div>
              <h3 className="font-bold text-sm text-[#172033]">Request Urgency Profile</h3>
              <p className="text-[11px] text-[#687386]">Triage severity proportion</p>
            </div>
          </div>

          <div className="h-48 sm:h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E7EAF0",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 12px rgba(16, 24, 40, 0.08)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E7EAF0] text-center text-xs">
            {urgencyData.map((item) => (
              <div key={item.name} className="p-2 rounded-xl bg-[#FAFBFD] border border-[#E7EAF0]">
                <span className="text-[10px] text-[#8C9BAE] block truncate">{item.name}</span>
                <span className="text-base font-bold text-[#172033]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Category Coverage & Unmet Demand Table */}
      <div className="resq-surface rounded-2xl overflow-hidden bg-[#FFFFFF]">
        <div className="p-4 sm:p-5 border-b border-[#E7EAF0]">
          <h3 className="font-bold text-sm text-[#172033]">Category Fulfillment &amp; Deficit Diagnostics</h3>
          <p className="text-xs text-[#687386]">Analysis of verified stock capacity vs outstanding shelter demand</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFBFD] border-b border-[#E7EAF0] text-[11px] font-semibold text-[#8C9BAE] uppercase">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total Demand</th>
                <th className="py-3 px-4">Available</th>
                <th className="py-3 px-4">Reserved</th>
                <th className="py-3 px-4">Coverage</th>
                <th className="py-3 px-4 text-right">Unmet Deficit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {categoryData.map((item) => (
                <tr key={item.category} className="hover:bg-[#FAFBFD] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#172033]">{item.category}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#172033]">{item.Demand} units</td>
                  <td className="py-3.5 px-4 text-[#12B8A6] font-semibold">{item.Available} units</td>
                  <td className="py-3.5 px-4 text-[#F4AE42] font-semibold">{item.Reserved} units</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[#E7EAF0] overflow-hidden">
                        <div
                          className={`h-full ${
                            item.coveragePct >= 80
                              ? "bg-[#12B8A6]"
                              : item.coveragePct >= 40
                              ? "bg-[#F4AE42]"
                              : "bg-[#F04452]"
                          }`}
                          style={{ width: `${item.coveragePct}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[#172033]">{item.coveragePct}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.unmet > 0 ? (
                      <span className="font-bold text-[#F04452]">-{item.unmet} units</span>
                    ) : (
                      <span className="text-[#16A34A] font-semibold">Fully Covered</span>
                    )}
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
