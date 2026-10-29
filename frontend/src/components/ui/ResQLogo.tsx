"use client";

import React from "react";

export type LogoVariant = "full" | "horizontal" | "stacked" | "icon" | "badge";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ResQLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  animated?: boolean;
  showTagline?: boolean;
  theme?: "light" | "dark" | "auto";
  badgeText?: string;
}

export const ResQLogo: React.FC<ResQLogoProps> = ({
  variant = "full",
  size = "md",
  className = "",
  animated = false,
  showTagline = false,
  theme = "auto",
  badgeText,
}) => {
  // Sizing matrix
  const sizeMap: Record<
    LogoSize,
    {
      iconSize: number;
      textSize: string;
      taglineSize: string;
      badgeSize: string;
      gap: string;
    }
  > = {
    xs: {
      iconSize: 22,
      textSize: "text-sm",
      taglineSize: "text-[9px]",
      badgeSize: "text-[9px] px-1 py-0.2",
      gap: "gap-1.5",
    },
    sm: {
      iconSize: 30,
      textSize: "text-base",
      taglineSize: "text-[10px]",
      badgeSize: "text-[9px] px-1.5 py-0.5",
      gap: "gap-2",
    },
    md: {
      iconSize: 38,
      textSize: "text-lg",
      taglineSize: "text-[11px]",
      badgeSize: "text-[10px] px-2 py-0.5",
      gap: "gap-2.5",
    },
    lg: {
      iconSize: 48,
      textSize: "text-2xl",
      taglineSize: "text-xs",
      badgeSize: "text-xs px-2.5 py-0.5",
      gap: "gap-3",
    },
    xl: {
      iconSize: 64,
      textSize: "text-3xl sm:text-4xl",
      taglineSize: "text-sm",
      badgeSize: "text-xs px-3 py-1",
      gap: "gap-4",
    },
  };

  const config = sizeMap[size];

  // SVG Emblem - Unique Emergency Cross + Dynamic Flow Waves
  const renderEmblem = () => (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-2xl ${
        animated ? "transition-transform hover:scale-105" : ""
      }`}
      style={{
        width: config.iconSize,
        height: config.iconSize,
      }}
    >
      <svg
        width={config.iconSize}
        height={config.iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm select-none"
      >
        <defs>
          {/* Primary Coral Emergency Red Gradient */}
          <linearGradient id="resqBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F04452" />
            <stop offset="50%" stopColor="#E02E3D" />
            <stop offset="100%" stopColor="#C91C2B" />
          </linearGradient>

          {/* Accent Flow Ribbon Gradient (Cyan / Teal) */}
          <linearGradient id="flowStreamGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="50%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#5EEAD4" />
          </linearGradient>

          {/* Highlight Gradient for Cross Bevel */}
          <linearGradient id="crossGleam" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.82" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hex-Shield Container with Smooth Curves */}
        <path
          d="M24 3.5C31.5 3.5 40 7.5 42.5 14C45 20.5 44 32.5 37 39.5C31 45.5 24 46.5 24 46.5C24 46.5 17 45.5 11 39.5C4 32.5 3 20.5 5.5 14C8 7.5 16.5 3.5 24 3.5Z"
          fill="url(#resqBgGrad)"
        />

        {/* Subtle Inner Border Glow */}
        <path
          d="M24 5C30.5 5 38.5 8.7 40.8 14.5C43 20.3 42 31.2 35.8 37.8C30.5 43.2 24 44.5 24 44.5C24 44.5 17.5 43.2 12.2 37.8C6 31.2 5 20.3 7.2 14.5C9.5 8.7 17.5 5 24 5Z"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.3"
          fill="none"
        />

        {/* The Bold Emergency Cross Body (Crisp Rounded Cross) */}
        <path
          d="M21 11.5C21 10.12 22.12 9 23.5 9H24.5C25.88 9 27 10.12 27 11.5V19.5H35C36.38 19.5 37.5 20.62 37.5 22V23C37.5 24.38 36.38 25.5 35 25.5H27V33.5C27 34.88 25.88 36 24.5 36H23.5C22.12 36 21 34.88 21 33.5V25.5H13C11.62 25.5 10.5 24.38 10.5 23V22C10.5 20.62 11.62 19.5 13 19.5H21V11.5Z"
          fill="url(#crossGleam)"
        />

        {/* Dynamic Forward "Flow" S-Curve Wave (Teal-Cyan Resource Stream piercing the center) */}
        <path
          d="M8 29.5C12 29.5 16 26.5 20 22C24 17.5 28 15.5 34 16C37.5 16.3 40.5 18 42 20.5"
          stroke="url(#flowStreamGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
        />

        {/* Forward Stream Arrow Indicator (Signifying rapid dispatch) */}
        <path
          d="M39 16L42.5 19.5L39 23"
          stroke="#5EEAD4"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Pulse Node (Coordinates & Heartbeat) */}
        <circle cx="24" cy="22.5" r="3.2" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.6" />
        <circle cx="24" cy="22.5" r="1.3" fill="#5EEAD4" />
      </svg>

      {/* Optional Animated Pulse Ring around the emblem */}
      {animated && (
        <span className="absolute -inset-1 rounded-2xl bg-[#F04452]/20 animate-ping -z-10 pointer-events-none" />
      )}
    </div>
  );

  // Variant: Icon Only
  if (variant === "icon") {
    return <div className={`inline-flex items-center ${className}`}>{renderEmblem()}</div>;
  }

  // Variant: Stacked (Emblem on top, typography below)
  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {renderEmblem()}
        <div className="mt-2.5">
          <div className={`font-black ${config.textSize} tracking-tight leading-none text-[#172033]`}>
            ResQ
            <span className="bg-gradient-to-r from-[#F04452] via-[#FF5A67] to-[#E02E3D] bg-clip-text text-transparent">
              Flow
            </span>
          </div>
          {showTagline && (
            <p className={`${config.taglineSize} font-bold text-[#687386] tracking-wider uppercase mt-1`}>
              Disaster Resource Engine
            </p>
          )}
        </div>
      </div>
    );
  }

  // Variant: Badge (compact pill with icon and label)
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E7EAF0] shadow-2xs hover:shadow-xs transition-all ${className}`}
      >
        {renderEmblem()}
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xs tracking-tight text-[#172033]">
            ResQ<span className="text-[#F04452]">Flow</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-[#687386]">
            {badgeText || "Live Relief"}
          </span>
        </div>
      </div>
    );
  }

  // Variant: Full / Horizontal (Default)
  return (
    <div className={`inline-flex items-center ${config.gap} ${className}`}>
      {renderEmblem()}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold ${config.textSize} tracking-tight text-[#172033]`}>
            ResQ
            <span className="bg-gradient-to-r from-[#F04452] via-[#FF5A67] to-[#E02E3D] bg-clip-text text-transparent">
              Flow
            </span>
          </span>
          {badgeText ? (
            <span
              className={`${config.badgeSize} font-bold rounded-md bg-[#FEF2F2] border border-[#FEE2E2] text-[#F04452] tracking-wide uppercase`}
            >
              {badgeText}
            </span>
          ) : (
            <span
              className={`${config.badgeSize} font-bold rounded-md bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E] tracking-wide uppercase`}
            >
              Command
            </span>
          )}
        </div>
        {showTagline && (
          <p className={`${config.taglineSize} font-medium text-[#687386] mt-0.5 leading-tight`}>
            Disaster Resource Allocation
          </p>
        )}
      </div>
    </div>
  );
};
