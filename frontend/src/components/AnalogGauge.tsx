"use client";

import React from "react";

interface AnalogGaugeProps {
  title: string;
  value: number; // 0 to 100 or custom range
  min?: number;
  max?: number;
  unit?: string;
  colorTheme?: "emerald" | "amber" | "rose" | "cyan" | "indigo";
  timestamp?: string;
  statusLabel?: string;
  subtext?: string;
  compact?: boolean;
}

export const AnalogGauge: React.FC<AnalogGaugeProps> = ({
  title,
  value,
  min = 0,
  max = 100,
  unit = "%",
  colorTheme = "emerald",
  timestamp = "2026-10-28 11:35:00",
  statusLabel,
  subtext,
  compact = false,
}) => {
  // Clamp value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);

  // SVG Gauge parameters
  // Semi-circle from 180 degrees (left) to 0 degrees (right)
  // Angle in degrees: 180 - (percentage * 180)
  const angle = 180 - percentage * 180;
  const radians = (angle * Math.PI) / 180;

  // Arc center & radius
  const cx = 100;
  const cy = 88;
  const r = 68;
  const strokeWidth = 14;

  // Needle endpoint
  const needleLength = 54;
  const nx = cx + needleLength * Math.cos(radians);
  const ny = cy - needleLength * Math.sin(radians);

  // Color schemes
  const colorMap = {
    emerald: {
      arcGradient: ["#10b981", "#059669"],
      glow: "rgba(16, 185, 129, 0.25)",
      textColor: "text-emerald-700",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      needleColor: "#047857",
    },
    amber: {
      arcGradient: ["#f59e0b", "#d97706"],
      glow: "rgba(245, 158, 11, 0.25)",
      textColor: "text-amber-700",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
      needleColor: "#b45309",
    },
    rose: {
      arcGradient: ["#f43f5e", "#e11d48"],
      glow: "rgba(244, 63, 94, 0.25)",
      textColor: "text-rose-700",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
      needleColor: "#be123c",
    },
    cyan: {
      arcGradient: ["#06b6d4", "#0891b2"],
      glow: "rgba(6, 182, 212, 0.25)",
      textColor: "text-cyan-700",
      badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
      needleColor: "#0e7490",
    },
    indigo: {
      arcGradient: ["#6366f1", "#4f46e5"],
      glow: "rgba(99, 102, 241, 0.25)",
      textColor: "text-indigo-700",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      needleColor: "#4338ca",
    },
  };

  const scheme = colorMap[colorTheme] || colorMap.emerald;

  // Background arc path: (from 180 to 0)
  // Left point: (cx - r, cy) = (32, 88)
  // Right point: (cx + r, cy) = (168, 88)
  const bgArc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  // Active arc path (from 180 deg to angle deg)
  // End of active arc:
  const activeEndX = cx + r * Math.cos(radians);
  const activeEndY = cy - r * Math.sin(radians);
  const largeArcFlag = percentage > 0.5 ? 0 : 0; // for semi-circle, sweeps less than 180
  const activeArc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${activeEndX} ${activeEndY}`;

  const uniqueId = `gauge-grad-${title.replace(/[^a-zA-Z0-9]/g, "")}-${colorTheme}`;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden group ${compact ? "py-3" : ""}`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: scheme.arcGradient[0] }} />
          <h4 className="font-bold text-xs text-slate-800 truncate leading-snug" title={title}>
            {title}
          </h4>
        </div>
        {statusLabel && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${scheme.badgeBg}`}>
            {statusLabel}
          </span>
        )}
      </div>

      {/* SVG Radial Gauge */}
      <div className="relative flex items-center justify-center my-0.5">
        <svg
          viewBox="15 15 170 85"
          className="w-full max-w-[190px] h-auto drop-shadow-xs overflow-visible"
        >
          <defs>
            <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={scheme.arcGradient[0]} />
              <stop offset="100%" stopColor={scheme.arcGradient[1]} />
            </linearGradient>
            <filter id={`glow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={bgArc}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Subtle Tick Marks */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const tickAngle = (180 - pct * 180) * (Math.PI / 180);
            const innerR = r - 12;
            const outerR = r + 12;
            const x1 = cx + innerR * Math.cos(tickAngle);
            const y1 = cy - innerR * Math.sin(tickAngle);
            const x2 = cx + outerR * Math.cos(tickAngle);
            const y2 = cy - outerR * Math.sin(tickAngle);
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Active Gradient Arc */}
          {percentage > 0.01 && (
            <path
              d={activeArc}
              fill="none"
              stroke={`url(#${uniqueId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter={`url(#glow-${uniqueId})`}
            />
          )}

          {/* Needle Indicator */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke={scheme.needleColor}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Pivot Center Cap */}
          <circle cx={cx} cy={cy} r="6" fill="#0f172a" />
          <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />
        </svg>

        {/* Numeric Center Overlay */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {typeof value === "number" ? (value % 1 === 0 ? value : value.toFixed(1)) : value}
            </span>
            <span className="text-xs font-bold text-slate-500">{unit}</span>
          </div>
          {subtext && (
            <span className="text-[10px] text-slate-400 font-medium -mt-0.5">{subtext}</span>
          )}
        </div>
      </div>

      {/* Footer Range and Timestamp */}
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium border-t border-slate-100 pt-1.5">
        <span className="font-mono">{min}{unit}</span>
        <span className="flex items-center gap-1 font-mono text-[9px] text-slate-500 truncate">
          🕒 {timestamp}
        </span>
        <span className="font-mono">{max}{unit}</span>
      </div>
    </div>
  );
};
