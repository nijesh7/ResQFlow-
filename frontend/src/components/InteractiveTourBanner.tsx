"use client";

import React, { useState } from "react";
import { UserRole } from "@/types";
import {
  Play,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Cpu,
  Truck,
  RotateCcw,
  X,
  Zap,
  Info
} from "lucide-react";

interface InteractiveTourBannerProps {
  currentRole: UserRole;
  onNavigateTab: (tabId: string) => void;
  onRoleChange: (role: UserRole) => void;
  onRunAI: () => Promise<any>;
  onFastTrackDemo: () => Promise<void>;
}

export const InteractiveTourBanner: React.FC<InteractiveTourBannerProps> = ({
  currentRole,
  onNavigateTab,
  onRoleChange,
  onRunAI,
  onFastTrackDemo,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRunningAutoPlay, setIsRunningAutoPlay] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (isDismissed) return null;

  const steps = [
    {
      num: 1,
      title: "Shelter Asks for Aid",
      desc: "Evacuee camp posts urgent 400L drinking water demand",
      role: "REQUESTER" as UserRole,
      tab: "REQUESTS",
      actionText: "Step 1: View Demand",
      icon: HeartHandshake,
      color: "from-amber-500 to-amber-600",
      accentBg: "bg-amber-50 border-amber-200 text-amber-800",
    },
    {
      num: 2,
      title: "AI Finds Best Depot",
      desc: "Algorithm calculates shortest route from South Warehouse",
      role: "COORDINATOR" as UserRole,
      tab: "ALLOCATIONS",
      actionText: "Step 2: Run AI Match",
      icon: Cpu,
      color: "from-teal-500 to-teal-600",
      accentBg: "bg-teal-50 border-teal-200 text-teal-800",
    },
    {
      num: 3,
      title: "Dispatch & Track Truck",
      desc: "Driver transports supplies with real-time route telemetry",
      role: "COORDINATOR" as UserRole,
      tab: "FULFILMENT",
      actionText: "Step 3: Track Transit",
      icon: Truck,
      color: "from-indigo-500 to-indigo-600",
      accentBg: "bg-indigo-50 border-indigo-200 text-indigo-800",
    },
    {
      num: 4,
      title: "Shelter Sign-Off",
      desc: "Camp lead signs receipt confirming tamper-free delivery",
      role: "REQUESTER" as UserRole,
      tab: "FULFILMENT",
      actionText: "Step 4: Verify Handover",
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
      accentBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
    },
  ];

  const handleStepClick = async (stepNum: number) => {
    setCurrentStep(stepNum);
    const target = steps.find((s) => s.num === stepNum);
    if (!target) return;

    if (currentRole !== target.role) {
      onRoleChange(target.role);
    }
    onNavigateTab(target.tab);

    if (!completedSteps.includes(stepNum)) {
      setCompletedSteps((prev) => [...prev, stepNum]);
    }
  };

  const handleAutoPlay = async () => {
    setIsRunningAutoPlay(true);
    try {
      // Step 1: Requester demand
      setCurrentStep(1);
      onRoleChange("REQUESTER");
      onNavigateTab("REQUESTS");
      setCompletedSteps([1]);
      await new Promise((r) => setTimeout(r, 2000));

      // Step 2: AI Allocation
      setCurrentStep(2);
      onRoleChange("COORDINATOR");
      onNavigateTab("ALLOCATIONS");
      setCompletedSteps([1, 2]);
      await onRunAI();
      await new Promise((r) => setTimeout(r, 2200));

      // Step 3: Fulfilment
      setCurrentStep(3);
      onNavigateTab("FULFILMENT");
      setCompletedSteps([1, 2, 3]);
      await new Promise((r) => setTimeout(r, 2000));

      // Step 4: Verification
      setCurrentStep(4);
      onRoleChange("REQUESTER");
      setCompletedSteps([1, 2, 3, 4]);
      await new Promise((r) => setTimeout(r, 1500));
    } finally {
      setIsRunningAutoPlay(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#FFFFFF] via-[#FAFBFD] to-[#F0FDFA] border-2 border-[#CCFBF1] rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden transition-all">
      {/* Background subtle decorative gradient */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#CCFBF1]/20 to-transparent pointer-events-none" />

      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#12B8A6] to-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#172033] tracking-tight">
                Interactive Guided Tour: 4-Step Crisis Simulation
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#12B8A6]/10 text-[#0F766E] border border-[#12B8A6]/30">
                Easy Mode
              </span>
            </div>
            <p className="text-xs text-[#687386] mt-0.5">
              Experience the full disaster relief lifecycle in 30 seconds. Click any step below or press Auto-Play!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleAutoPlay}
            disabled={isRunningAutoPlay}
            className="px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            title="Automatically run through all 4 steps"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningAutoPlay ? "animate-spin" : ""}`} />
            <span>{isRunningAutoPlay ? "Running Tour..." : "▶ Auto-Play Tour (30s)"}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-xl text-[#8C9BAE] hover:text-[#172033] hover:bg-[#E7EAF0]/60 transition-colors cursor-pointer"
            title="Dismiss tour banner"
            aria-label="Dismiss guided tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Cards Progress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          const isCurrent = currentStep === s.num;
          const isCompleted = completedSteps.includes(s.num);

          return (
            <button
              key={s.num}
              onClick={() => handleStepClick(s.num)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group relative flex flex-col justify-between ${
                isCurrent
                  ? "bg-white border-[#12B8A6] shadow-sm ring-2 ring-[#12B8A6]/20"
                  : isCompleted
                  ? "bg-[#F0FDF4] border-[#DCFCE7]"
                  : "bg-white/80 border-[#E7EAF0] hover:border-[#CBD5E1]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-[#12B8A6] text-white"
                        : "bg-[#E7EAF0] text-[#687386]"
                    }`}
                  >
                    {isCompleted ? "✓" : s.num}
                  </span>
                  <span className="text-[10px] font-bold text-[#8C9BAE] uppercase">
                    {s.role}
                  </span>
                </div>

                <div className="font-bold text-xs text-[#172033] group-hover:text-[#12B8A6] transition-colors flex items-center gap-1">
                  <span>{s.title}</span>
                  <ArrowRight className="w-3 h-3 text-[#8C9BAE] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#687386] mt-1 leading-snug line-clamp-2">
                  {s.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E7EAF0]/80 flex items-center justify-between text-[10px] font-semibold">
                <span className={isCurrent ? "text-[#0F766E] font-bold" : "text-[#8C9BAE]"}>
                  {s.actionText}
                </span>
                {isCompleted && (
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    Completed ✓
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
