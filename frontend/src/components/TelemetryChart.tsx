"use client";

import React, { useState } from "react";
import { Activity, TrendingUp, AlertTriangle, Droplets, ShieldAlert, Clock, RefreshCw } from "lucide-react";

interface TelemetryPoint {
  time: string;
  inflow: number;     // e.g. Aid Requests incoming
  dispatch: number;   // e.g. Convoys dispatched
  waterLevel?: number;// e.g. River stage level (ft / cfs)
  criticalLimit: number;
}

const DEFAULT_SERIES: TelemetryPoint[] = [
  { time: "00:00", inflow: 140, dispatch: 120, waterLevel: 6.2, criticalLimit: 250 },
  { time: "03:00", inflow: 210, dispatch: 180, waterLevel: 6.8, criticalLimit: 250 },
  { time: "06:00", inflow: 380, dispatch: 310, waterLevel: 7.9, criticalLimit: 250 },
  { time: "09:00", inflow: 520, dispatch: 460, waterLevel: 9.4, criticalLimit: 250 },
  { time: "12:00", inflow: 690, dispatch: 580, waterLevel: 10.6, criticalLimit: 250 },
  { time: "15:00", inflow: 610, dispatch: 620, waterLevel: 10.2, criticalLimit: 250 },
  { time: "18:00", inflow: 490, dispatch: 540, waterLevel: 9.1, criticalLimit: 250 },
  { time: "21:00", inflow: 420, dispatch: 450, waterLevel: 8.5, criticalLimit: 250 },
];

export const TelemetryChart: React.FC = () => {
  const [selectedSensor, setSelectedSensor] = useState<"FLOW" | "HYDRO">("FLOW");
  const [hoveredPoint, setHoveredPoint] = useState<TelemetryPoint | null>(null);

  // SVG Chart bounds
  const width = 640;
  const height = 150;
  const paddingX = 40;
  const paddingY = 24;

  const maxVal = selectedSensor === "FLOW" ? 800 : 14;
  const getY = (val: number) => {
    const ratio = (val || 0) / maxVal;
    return height - paddingY - ratio * (height - 2 * paddingY);
  };
  const getX = (idx: number) => {
    const step = (width - 2 * paddingX) / (DEFAULT_SERIES.length - 1);
    return paddingX + idx * step;
  };

  // Build SVG Path
  const inflowPoints = DEFAULT_SERIES.map((d, i) => `${getX(i)},${getY(selectedSensor === "FLOW" ? d.inflow : d.waterLevel || 0)}`).join(" ");
  const dispatchPoints = DEFAULT_SERIES.map((d, i) => `${getX(i)},${getY(selectedSensor === "FLOW" ? d.dispatch : (d.waterLevel || 0) * 0.85)}`).join(" ");

  // Fill area under inflow
  const areaInflow = `M ${getX(0)},${height - paddingY} ${DEFAULT_SERIES.map((d, i) => `L ${getX(i)},${getY(selectedSensor === "FLOW" ? d.inflow : d.waterLevel || 0)}`).join(" ")} L ${getX(DEFAULT_SERIES.length - 1)},${height - paddingY} Z`;

  const criticalY = getY(selectedSensor === "FLOW" ? 650 : 11.5);
  const warningY = getY(selectedSensor === "FLOW" ? 480 : 8.8);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
      {/* Chart Top Bar with SCADA / Operations Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                {selectedSensor === "FLOW"
                  ? "EMERGENCY AID FLOW & DISPATCH RATE (UNITS / HR)"
                  : "CRABTREE SECTOR HYDROLOGICAL FLOOD GAUGE (STAGE FT)"}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sensor Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Real-time multi-variable telemetry stream synced across emergency response sectors
            </p>
          </div>
        </div>

        {/* Sensor selector toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setSelectedSensor("FLOW")}
            className={`px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
              selectedSensor === "FLOW"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Supply & Demand Flow
          </button>
          <button
            onClick={() => setSelectedSensor("HYDRO")}
            className={`px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
              selectedSensor === "HYDRO"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Disaster Flood Hydro-Stage
          </button>
        </div>
      </div>

      {/* SVG Multi-Line Chart Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 drop-shadow-xs select-none"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines horizontal */}
          {[0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Threshold Lines (Red Alert & Amber Warning - just like in elements360 screenshot) */}
          <line
            x1={paddingX}
            y1={criticalY}
            x2={width - paddingX}
            y2={criticalY}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text
            x={width - paddingX}
            y={criticalY - 4}
            textAnchor="end"
            fontSize="9"
            fill="#ef4444"
            fontWeight="bold"
          >
            CRITICAL THRESHOLD
          </text>

          <line
            x1={paddingX}
            y1={warningY}
            x2={width - paddingX}
            y2={warningY}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          <text
            x={width - paddingX}
            y={warningY - 4}
            textAnchor="end"
            fontSize="9"
            fill="#d97706"
            fontWeight="bold"
          >
            WARNING BASELINE
          </text>

          {/* Shaded Area */}
          <path d={areaInflow} fill="url(#areaGrad)" />

          {/* Inflow / Primary Curve (Teal / Cyan) */}
          <polyline
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={inflowPoints}
          />

          {/* Secondary Curve (Dispatch Throughput / Orange Amber) */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 2"
            points={dispatchPoints}
          />

          {/* Data Points / Dots */}
          {DEFAULT_SERIES.map((d, i) => {
            const x = getX(i);
            const y1 = getY(selectedSensor === "FLOW" ? d.inflow : d.waterLevel || 0);
            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(d)}>
                <circle cx={x} cy={y1} r="4.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                <text
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#64748b"
                  fontWeight="600"
                >
                  {d.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered / Active Tooltip Pill */}
        {hoveredPoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-3 z-10 animate-fade-in pointer-events-none">
            <div className="font-bold text-teal-400">{hoveredPoint.time}</div>
            <div className="text-slate-300">
              {selectedSensor === "FLOW" ? (
                <>
                  Inflow: <span className="font-bold text-white">{hoveredPoint.inflow} u</span> | Dispatched: <span className="font-bold text-amber-300">{hoveredPoint.dispatch} u</span>
                </>
              ) : (
                <>
                  Stage Level: <span className="font-bold text-teal-300">{hoveredPoint.waterLevel} ft</span> (Alert @ 11.5 ft)
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Telemetry Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 pt-3 mt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-teal-600 rounded-full" />
            <span className="text-slate-600 font-medium">
              {selectedSensor === "FLOW" ? "Relief Inflow Demand" : "Live Hydro-Stage Reading"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-full border-dashed" />
            <span className="text-slate-600 font-medium">
              {selectedSensor === "FLOW" ? "Dispatch Fulfilled" : "3-Hour Projected Level"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500" />
            <span className="text-red-600 font-bold">Critical Alert Limit</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Polling frequency: 5s &bull; Transmit: LoRa / Satellite Ready</span>
        </div>
      </div>
    </div>
  );
};
