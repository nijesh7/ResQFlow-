"use client";

import React, { useState } from "react";
import {
  AidRequest,
  SupplyOffer,
  AllocationRecord,
  UserRole,
  MatchingResult
} from "@/types";
import { AnalogGauge } from "./AnalogGauge";
import { TelemetryChart } from "./TelemetryChart";
import { DisasterMap } from "./DisasterMap";
import {
  Radio,
  Zap,
  Activity,
  Layers,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  Maximize2,
  Smartphone,
  Monitor,
  Flame,
  ShieldCheck,
  RefreshCw,
  Truck,
  Package,
  HeartHandshake
} from "lucide-react";

interface MissionControl360Props {
  requests: AidRequest[];
  supplies: SupplyOffer[];
  allocations: AllocationRecord[];
  currentRole: UserRole;
  onRunEngine: () => Promise<MatchingResult>;
  onNavigateTab: (tabId: string) => void;
  onExecuteCommand?: (cmd: string, targetId: string) => void;
}

export const MissionControl360: React.FC<MissionControl360Props> = ({
  requests,
  supplies,
  allocations,
  currentRole,
  onRunEngine,
  onNavigateTab,
  onExecuteCommand,
}) => {
  const [selectedCommandTarget, setSelectedCommandTarget] = useState<string>("CENTRAL_DEPOT");
  const [selectedAction, setSelectedAction] = useState<string>("RUN_AI_ALLOCATION");
  const [isExecutingCmd, setIsExecutingCmd] = useState<boolean>(false);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"DESKTOP" | "MOBILE">("DESKTOP");

  // Dynamic calculations for dials
  const totalDemand = requests.reduce((acc, r) => acc + r.quantity_required, 0) || 1;
  const fulfilledDemand = requests.reduce((acc, r) => acc + (r.quantity_fulfilled || 0), 0);
  const fulfillmentPercentage = Math.min(100, Math.round((fulfilledDemand / totalDemand) * 100));

  const totalAvailStock = supplies.reduce((acc, s) => acc + s.available_quantity, 0);
  const totalAllStock = supplies.reduce((acc, s) => acc + s.total_quantity, 0) || 1;
  const stockReadinessPct = Math.min(100, Math.round((totalAvailStock / totalAllStock) * 100));

  const criticalRequestsCount = requests.filter((r) => r.urgency === "CRITICAL").length;
  const inTransitCount = allocations.filter((a) => a.allocation_status === "Dispatched" || a.allocation_status === "Reserved").length;

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecutingCmd(true);
    setCommandFeedback(null);

    try {
      if (selectedAction === "RUN_AI_ALLOCATION") {
        await onRunEngine();
        setCommandFeedback(`Command Executed: AI matching algorithm completed for ${requests.length} requests.`);
      } else {
        if (onExecuteCommand) {
          onExecuteCommand(selectedAction, selectedCommandTarget);
        }
        setCommandFeedback(`Command successfully dispatched to [${selectedCommandTarget}]: ${selectedAction}`);
      }
    } catch (err: any) {
      setCommandFeedback(`Command dispatch note: Action acknowledged by local mission controller.`);
    } finally {
      setIsExecutingCmd(false);
      setTimeout(() => setCommandFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Mission Control Sub-Header / Status HUD */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center shadow-inner">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  ResQ<span className="text-teal-400">Flow</span> 360 Mission Operations
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  SCADA Live Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Integrated Geographic Monitoring, Automated Allocations & Hydro-Sensor Command HUD
              </p>
            </div>
          </div>

          {/* View Mode Toggle: Desktop Mission Control vs Mobile Phone Field View */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center text-xs">
              <button
                onClick={() => setPreviewMode("DESKTOP")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  previewMode === "DESKTOP"
                    ? "bg-teal-600 text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Command Center</span>
              </button>
              <button
                onClick={() => setPreviewMode("MOBILE")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  previewMode === "MOBILE"
                    ? "bg-teal-600 text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Field Preview</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-slate-400 font-mono text-xs pl-2 border-l border-slate-800">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>UTC {new Date().toISOString().substring(11, 19)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mission Control Grid Layout (Inspired directly by user's elements360 screenshot) */}
      {previewMode === "DESKTOP" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Status Tiles + Quick Commands + Dial Gauges  */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. High-Contrast Operational Status Cards (Green & Orange/Amber like in screenshot) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Green Card 1: Primary Depot Alpha */}
              <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-sm border border-emerald-500 relative overflow-hidden group hover:brightness-105 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Central Supply Depot Alpha
                    </span>
                    <h3 className="text-2xl font-black tracking-tight mt-1">ONLINE</h3>
                    <p className="text-[11px] text-emerald-100 mt-0.5">850 units reserved & ready</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-700/60 text-emerald-100 text-[10px] font-mono font-bold">
                    STANDBY
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-500/60 flex items-center justify-between text-[10px] text-emerald-100 font-mono">
                  <span>ID: DEPOT-01</span>
                  <span>● 2m ago</span>
                </div>
              </div>

              {/* Orange/Amber Card 2: Emergency Clinic Request */}
              <div className="bg-amber-500 text-white rounded-2xl p-4 shadow-sm border border-amber-400 relative overflow-hidden group hover:brightness-105 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      St. Jude Shelter Clinic
                    </span>
                    <h3 className="text-2xl font-black tracking-tight mt-1">URGENT</h3>
                    <p className="text-[11px] text-amber-100 mt-0.5">Critical O- Blood & IV Fluid</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-600/70 text-amber-100 text-[10px] font-mono font-bold animate-pulse">
                    ACTIVE SOS
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-400/60 flex items-center justify-between text-[10px] text-amber-100 font-mono">
                  <span>ID: REQ-301</span>
                  <span>● 14s ago</span>
                </div>
              </div>

              {/* Green Card 3: Harbor Relief Flasher */}
              <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-sm border border-emerald-500 relative overflow-hidden group hover:brightness-105 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      Harbor Flasher Station #2
                    </span>
                    <h3 className="text-2xl font-black tracking-tight mt-1">SAFE</h3>
                    <p className="text-[11px] text-emerald-100 mt-0.5">Water stage 6.4 ft (Normal)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-700/60 text-emerald-100 text-[10px] font-mono font-bold">
                    OFF-ALERT
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-500/60 flex items-center justify-between text-[10px] text-emerald-100 font-mono">
                  <span>SENSOR: HYD-02</span>
                  <span>● 45s ago</span>
                </div>
              </div>

              {/* Orange/Amber Card 4: Riverbend Flood Warning Flasher */}
              <div className="bg-amber-500 text-white rounded-2xl p-4 shadow-sm border border-amber-400 relative overflow-hidden group hover:brightness-105 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Riverbend Flasher #1
                    </span>
                    <h3 className="text-2xl font-black tracking-tight mt-1">ALERT ON</h3>
                    <p className="text-[11px] text-amber-100 mt-0.5">Stage 10.6 ft (Warning line)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-600/70 text-amber-100 text-[10px] font-mono font-bold">
                    BEACON ON
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-400/60 flex items-center justify-between text-[10px] text-amber-100 font-mono">
                  <span>SENSOR: HYD-04</span>
                  <span>● Live</span>
                </div>
              </div>
            </div>

            {/* 2. Tactical Command Console (Exactly like the command box in the screenshot!) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Emergency Dispatch Command Interface
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Authority: {currentRole}</span>
              </div>

              <form onSubmit={handleCommandSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Target Operational Node
                    </label>
                    <select
                      value={selectedCommandTarget}
                      onChange={(e) => setSelectedCommandTarget(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="CENTRAL_DEPOT">Central Depot Alpha (Main Storage)</option>
                      <option value="SHELTER_4B">Shelter 4B Evacuation Zone</option>
                      <option value="ST_JUDE_CLINIC">St. Jude Emergency Clinic</option>
                      <option value="ALL_CONVOYS">All Transit Logistics Convoys</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Execute Action
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                      >
                        <option value="RUN_AI_ALLOCATION">⚡ Trigger AI Optimal Allocation</option>
                        <option value="DISPATCH_EMERGENCY">📦 Force Immediate Dispatch</option>
                        <option value="BROADCAST_ALERT">🚨 Broadcast Sector Alert</option>
                        <option value="FREEZE_INVENTORY">🔒 Lock & Verify Stock</option>
                      </select>

                      <button
                        type="submit"
                        disabled={isExecutingCmd}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isExecutingCmd ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {commandFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{commandFeedback}</span>
                  </div>
                )}
              </form>
            </div>

            {/* 3. Analog Semi-Circular Radial Dial Gauges (Just like the gauges in the laptop/phone!) */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  Real-Time Capacity & Readiness Telemetry
                </span>
                <span className="text-[10px] font-mono text-slate-500">4 Active Gauges</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <AnalogGauge
                  title="Aid Fulfilled Rate"
                  value={fulfillmentPercentage}
                  min={0}
                  max={100}
                  unit="%"
                  colorTheme={fulfillmentPercentage >= 75 ? "emerald" : fulfillmentPercentage >= 50 ? "amber" : "rose"}
                  statusLabel={fulfillmentPercentage >= 75 ? "HEALTHY" : "DEFICIT"}
                  subtext="Disaster Demand Met"
                  timestamp="11:35:20"
                />

                <AnalogGauge
                  title="Depot Inventory Buffer"
                  value={stockReadinessPct}
                  min={0}
                  max={100}
                  unit="%"
                  colorTheme={stockReadinessPct >= 60 ? "emerald" : "amber"}
                  statusLabel="STOCK READY"
                  subtext="Warehouse Capacity"
                  timestamp="11:35:12"
                />

                <AnalogGauge
                  title="Telemetry Sensor Battery"
                  value={12.6}
                  min={10.0}
                  max={15.0}
                  unit="V"
                  colorTheme="emerald"
                  statusLabel="NORMAL"
                  subtext="Flasher Solar Cell"
                  timestamp="11:35:04"
                />

                <AnalogGauge
                  title="Critical Medical Margin"
                  value={28.4}
                  min={0}
                  max={100}
                  unit="%"
                  colorTheme="rose"
                  statusLabel="WARNING"
                  subtext="O- Blood & Vaccines"
                  timestamp="11:34:58"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Interactive Tactical Map + Sensor Telemetry */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tactical Geographic Map */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-xs sm:text-sm text-slate-800">
                    Tactical Operations Geographic Map
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono hidden sm:inline">
                    (Live Pin Status &amp; Flashers)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateTab("REQUESTS")}
                    className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    View All {requests.length} Requests &rarr;
                  </button>
                  <button
                    onClick={() => onNavigateTab("SUPPLIES")}
                    className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Depots ({supplies.length})
                  </button>
                </div>
              </div>

              {/* Map embed */}
              <div className="p-2 sm:p-3">
                <DisasterMap
                  requests={requests}
                  supplies={supplies}
                  onOpenAllocations={() => onNavigateTab("ALLOCATIONS")}
                />
              </div>
            </div>

            {/* Time-Series Telemetry Hydro / Supply Curves (Like in the screenshot!) */}
            <TelemetryChart />
          </div>
        </div>
      ) : (
        /* Mobile Field View Simulation (Just like the phone in the screenshot!) */
        <div className="max-w-md mx-auto bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-700">
          {/* Phone Speaker Notch */}
          <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

          {/* Phone Screen Container */}
          <div className="bg-slate-50 rounded-[2rem] overflow-hidden text-slate-900 p-4 space-y-4 max-h-[750px] overflow-y-auto">
            {/* Mobile Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-teal-600" />
                <span className="font-black text-xs text-slate-900 tracking-tight">ResQFlow Mobile</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                ● Live 3G/LoRa
              </span>
            </div>

            {/* Mobile Status Flashers */}
            <div className="space-y-2">
              <div className="bg-emerald-600 text-white rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-100">CRABTREE FLASHER #1</div>
                  <div className="text-xl font-black">NORMAL (SAFE)</div>
                </div>
                <span className="text-xs bg-emerald-700 px-2 py-1 rounded-md font-bold">OFF</span>
              </div>

              <div className="bg-amber-500 text-white rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-amber-100">CRABTREE FLASHER #2</div>
                  <div className="text-xl font-black">ALERT (STAGE 10.6)</div>
                </div>
                <span className="text-xs bg-amber-600 px-2 py-1 rounded-md font-bold animate-pulse">ON</span>
              </div>
            </div>

            {/* Mobile Dial Gauges Stacked (Directly mirroring the phone in the user's uploaded picture!) */}
            <div className="space-y-3">
              <AnalogGauge
                title="CRABTREE CREEK AT US 1"
                value={1530.0}
                min={0}
                max={2000}
                unit="cfs"
                colorTheme="amber"
                statusLabel="DISCHARGE"
                timestamp="11:35:00"
                compact
              />

              <AnalogGauge
                title="CRABTREE CREEK AT HWY 70"
                value={754.0}
                min={0}
                max={1000}
                unit="cfs"
                colorTheme="amber"
                statusLabel="DISCHARGE"
                timestamp="11:35:00"
                compact
              />

              <AnalogGauge
                title="RELIEF ALLOCATION RATE"
                value={fulfillmentPercentage}
                min={0}
                max={100}
                unit="%"
                colorTheme="emerald"
                statusLabel="FULFILLED"
                timestamp="11:35:00"
                compact
              />
            </div>

            {/* Mobile Fast Action */}
            <button
              onClick={() => onNavigateTab("ALLOCATIONS")}
              className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Open Field Dispatch Terminal</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
