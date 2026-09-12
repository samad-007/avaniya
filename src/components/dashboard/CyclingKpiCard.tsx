"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { LucideIcon } from "lucide-react";

export interface KpiPanelConfig {
  title: string;
  badge: string;
  badgeColor?: string;
  titleColor?: string;
  value: string;
  subtitle: string | React.ReactNode;
  icon: LucideIcon;
  iconColor?: string;
  valueColor?: string;
}

export interface CyclingKpiCardProps {
  panelA: KpiPanelConfig;
  panelB: KpiPanelConfig;
  cycleIntervalMs?: number;
  initialPanel?: "A" | "B";
  staggerDelayMs?: number;
  className?: string;
  onClick?: () => void;
}

export const CyclingKpiCard: React.FC<CyclingKpiCardProps> = ({
  panelA,
  panelB,
  cycleIntervalMs = 7000,
  initialPanel = "A",
  staggerDelayMs = 0,
  className = "",
  onClick,
}) => {
  const [activePanel, setActivePanel] = useState<"A" | "B">(initialPanel);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialDelayFiredRef = useRef(false);

  const togglePanel = useCallback(() => {
    setActivePanel((prev) => (prev === "A" ? "B" : "A"));
  }, []);

  // 7-second auto-cycle interval with optional staggered start
  useEffect(() => {
    if (isPaused) return;

    let intervalId: NodeJS.Timeout;
    let initialTimeoutId: NodeJS.Timeout | null = null;

    if (staggerDelayMs > 0 && !initialDelayFiredRef.current) {
      initialTimeoutId = setTimeout(() => {
        initialDelayFiredRef.current = true;
        togglePanel();
        intervalId = setInterval(togglePanel, cycleIntervalMs);
      }, staggerDelayMs);
    } else {
      intervalId = setInterval(togglePanel, cycleIntervalMs);
    }

    return () => {
      if (initialTimeoutId) clearTimeout(initialTimeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPaused, togglePanel, cycleIntervalMs, staggerDelayMs]);

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

    // Minimum swipe threshold (35px) and verify mostly horizontal motion
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped left -> show Panel B
        setActivePanel("B");
      } else {
        // Swiped right -> show Panel A
        setActivePanel("A");
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

  const currentPanel = activePanel === "A" ? panelA : panelB;
  const IconComponent = currentPanel.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        togglePanel();
        resumeAfterDelay();
        if (onClick) onClick();
      }}
      className={`bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm relative overflow-hidden select-none min-h-[118px] cursor-pointer ${className}`}
      title="Click or swipe to switch views (auto-cycles every 7s)"
    >
      {/* Row 1: Status Badge + Pill Switcher */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tracking-normal shrink-0 ${
            currentPanel.badgeColor ||
            (activePanel === "A"
              ? "bg-zinc-800 text-zinc-300 border border-zinc-700/50"
              : "bg-purple-950/60 text-purple-400 border border-purple-800/40")
          }`}
        >
          {currentPanel.badge}
        </span>

        {/* Dual-Pill Visual Switcher Controls */}
        <div
          className="flex items-center gap-1 bg-[#141414] px-1.5 py-1 rounded border border-[#2a2a2a] shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Show ${panelA.title}`}
            onClick={(e) => {
              e.stopPropagation();
              setActivePanel("A");
              resumeAfterDelay();
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activePanel === "A"
                ? "w-4 bg-white"
                : "w-1.5 bg-[#444444] hover:bg-[#666666]"
            }`}
          />
          <button
            type="button"
            aria-label={`Show ${panelB.title}`}
            onClick={(e) => {
              e.stopPropagation();
              setActivePanel("B");
              resumeAfterDelay();
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activePanel === "B"
                ? "w-4 bg-purple-400"
                : "w-1.5 bg-[#444444] hover:bg-[#666666]"
            }`}
          />
          <div className="ml-1 pl-1 border-l border-[#2a2a2a]">
            <IconComponent
              className={`w-3.5 h-3.5 ${
                currentPanel.iconColor || "text-white"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Full Width Topic Title */}
      <div
        className={`text-xs font-semibold uppercase tracking-wider truncate transition-colors duration-200 ${
          currentPanel.titleColor ||
          (activePanel === "A" ? "text-[#A1A1AA]" : "text-purple-400")
        }`}
        title={currentPanel.title}
      >
        {currentPanel.title}
      </div>

      {/* Row 3: Main KPI Value */}
      <div
        className={`text-xl md:text-2xl font-bold font-mono tracking-tight my-0.5 ${
          currentPanel.valueColor || "text-white"
        }`}
      >
        {currentPanel.value}
      </div>

      {/* Subtitle Details */}
      <div className="text-xs text-[#A1A1AA] font-medium mt-1.5 truncate">
        {currentPanel.subtitle}
      </div>
    </div>
  );
};
