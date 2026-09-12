"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { formatINR } from "@/lib/formatters";
import { TrendingUp, Target } from "lucide-react";

interface ProfitKpiCardProps {
  totalRealizedProfit: number;
  totalProjectedProfit: number;
  totalPendingProfit: number;
  profitWithdrawalsTotal: number;
  activeDealsCount: number;
  soldDealsCount: number;
}

export const ProfitKpiCard: React.FC<ProfitKpiCardProps> = ({
  totalRealizedProfit,
  totalProjectedProfit,
  totalPendingProfit,
  profitWithdrawalsTotal,
  activeDealsCount,
  soldDealsCount,
}) => {
  const [activePanel, setActivePanel] = useState<"actual" | "projected">(
    "actual"
  );
  const [isPaused, setIsPaused] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const togglePanel = useCallback(() => {
    setActivePanel((prev) => (prev === "actual" ? "projected" : "actual"));
  }, []);

  // 7-second auto-cycle interval
  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      togglePanel();
    }, 7000);

    return () => clearInterval(intervalId);
  }, [isPaused, togglePanel]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      resumeAfterDelay();
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    // Minimum swipe distance threshold (35px) and verify mostly horizontal motion
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped left -> show projected
        setActivePanel("projected");
      } else {
        // Swiped right -> show actual
        setActivePanel("actual");
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    resumeAfterDelay();
  };

  const resumeAfterDelay = () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm relative overflow-hidden select-none min-h-[108px] cursor-pointer"
      onClick={() => {
        togglePanel();
        resumeAfterDelay();
      }}
      title="Click or swipe to switch between Actual Profit and Projected Profit (auto-cycles every 7s)"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className={
              activePanel === "actual" ? "text-white" : "text-purple-400"
            }
          >
            {activePanel === "actual" ? "Actual Profit" : "Projected Profit"}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold tracking-normal ${
              activePanel === "actual"
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                : "bg-purple-950/60 text-purple-400 border border-purple-800/40"
            }`}
          >
            {activePanel === "actual" ? "REALIZED" : "PIPELINE"}
          </span>
        </div>

        {/* Dual-Pill Visual Switcher Controls */}
        <div
          className="flex items-center gap-1 bg-[#141414] px-1.5 py-1 rounded border border-[#2a2a2a]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Show Actual Profit"
            onClick={(e) => {
              e.stopPropagation();
              setActivePanel("actual");
              resumeAfterDelay();
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activePanel === "actual"
                ? "w-4 bg-white"
                : "w-1.5 bg-[#444444] hover:bg-[#666666]"
            }`}
          />
          <button
            type="button"
            aria-label="Show Projected Profit"
            onClick={(e) => {
              e.stopPropagation();
              setActivePanel("projected");
              resumeAfterDelay();
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activePanel === "projected"
                ? "w-4 bg-purple-400"
                : "w-1.5 bg-[#444444] hover:bg-[#666666]"
            }`}
          />
          <div className="ml-1 pl-1 border-l border-[#2a2a2a]">
            {activePanel === "actual" ? (
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            ) : (
              <Target className="w-3.5 h-3.5 text-purple-400" />
            )}
          </div>
        </div>
      </div>

      {/* Main KPI Value */}
      <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
        {activePanel === "actual"
          ? formatINR(totalRealizedProfit)
          : formatINR(totalProjectedProfit)}
      </div>

      {/* Subtitle Details */}
      <div className="text-xs text-[#A1A1AA] font-medium mt-1.5 truncate">
        {activePanel === "actual" ? (
          totalPendingProfit > 0 ? (
            <span className="text-amber-400/90">
              Pending: {formatINR(totalPendingProfit)} to collect
            </span>
          ) : profitWithdrawalsTotal > 0 ? (
            <span>Drawings: -{formatINR(profitWithdrawalsTotal)}</span>
          ) : (
            <span>
              Settled Gains ({soldDealsCount} {soldDealsCount === 1 ? "Deal" : "Deals"} Sold)
            </span>
          )
        ) : (
          <span>
            Across {activeDealsCount} Active {activeDealsCount === 1 ? "Deal" : "Deals"} (Unsold)
          </span>
        )}
      </div>
    </div>
  );
};
