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
  pillColor?: string;
}

export interface CyclingKpiCardProps {
  panelA: KpiPanelConfig;
  panelB: KpiPanelConfig;
  cardAccentColor?: string;
  activePanel?: "A" | "B";
  isFlipping?: boolean;
  cycleIntervalMs?: number;
  initialPanel?: "A" | "B";
  className?: string;
  onClick?: () => void;
  onSelectPanel?: (panel: "A" | "B") => void;
  onSwipe?: (direction: "left" | "right") => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const COLOR_CLASSES: Record<
  string,
  { activePill: string; text: string; badge: string }
> = {
  blue: {
    activePill: "bg-[#3B82F6]",
    text: "text-blue-400",
    badge: "bg-blue-950/60 text-blue-400 border border-blue-800/40",
  },
  emerald: {
    activePill: "bg-[#22C55E]",
    text: "text-emerald-400",
    badge: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
  },
  cyan: {
    activePill: "bg-[#06B6D4]",
    text: "text-cyan-400",
    badge: "bg-cyan-950/60 text-cyan-400 border border-cyan-800/40",
  },
  amber: {
    activePill: "bg-[#F59E0B]",
    text: "text-amber-400",
    badge: "bg-amber-950/60 text-amber-400 border border-amber-800/40",
  },
  rose: {
    activePill: "bg-[#F43F5E]",
    text: "text-rose-400",
    badge: "bg-rose-950/60 text-rose-400 border border-rose-800/40",
  },
  purple: {
    activePill: "bg-[#A855F7]",
    text: "text-purple-400",
    badge: "bg-purple-950/60 text-purple-400 border border-purple-800/40",
  },
  yellow: {
    activePill: "bg-[#EAB308]",
    text: "text-yellow-400",
    badge: "bg-yellow-950/60 text-yellow-400 border border-yellow-800/40",
  },
  white: {
    activePill: "bg-white",
    text: "text-white",
    badge: "bg-zinc-800 text-zinc-300 border border-zinc-700/50",
  },
};

const resolveActivePillBg = (
  panel: KpiPanelConfig,
  cardAccent?: string
): string => {
  if (panel.pillColor) return panel.pillColor;

  if (cardAccent) {
    const key = cardAccent.toLowerCase();
    if (COLOR_CLASSES[key]) return COLOR_CLASSES[key].activePill;
    if (cardAccent.startsWith("bg-")) return cardAccent;
  }

  const combined = `${panel.titleColor || ""} ${panel.badgeColor || ""} ${
    panel.iconColor || ""
  }`.toLowerCase();
  for (const [k, v] of Object.entries(COLOR_CLASSES)) {
    if (combined.includes(k)) return v.activePill;
  }

  return "bg-white";
};

export const CyclingKpiCard: React.FC<CyclingKpiCardProps> = ({
  panelA,
  panelB,
  cardAccentColor,
  activePanel: activePanelProp,
  isFlipping: isFlippingProp,
  cycleIntervalMs = 7000,
  initialPanel = "A",
  className = "",
  onClick,
  onSelectPanel,
  onSwipe,
  onHoverStart,
  onHoverEnd,
}) => {
  // Internal state used when not controlled by parent
  const [internalPanel, setInternalPanel] = useState<"A" | "B">(initialPanel);
  const [internalFlipping, setInternalFlipping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const isControlled = activePanelProp !== undefined;
  const currentPanelKey = isControlled ? activePanelProp : internalPanel;
  const isFlipping =
    isFlippingProp !== undefined ? isFlippingProp : internalFlipping;

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Standalone switch function with smooth 200ms transition
  const executeLocalSwitch = useCallback((target?: "A" | "B") => {
    setInternalFlipping(true);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = setTimeout(() => {
      setInternalPanel((prev) => target ?? (prev === "A" ? "B" : "A"));
      setInternalFlipping(false);
    }, 200);
  }, []);

  // Standalone 7-second auto-cycle (only active when uncontrolled)
  useEffect(() => {
    if (isControlled || isPaused) return;

    const intervalId = setInterval(() => {
      executeLocalSwitch();
    }, cycleIntervalMs);

    return () => {
      clearInterval(intervalId);
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, [isControlled, isPaused, executeLocalSwitch, cycleIntervalMs]);

  const resumeAfterDelay = () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      if (onHoverEnd) onHoverEnd();
    }, 4000);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsPaused(true);
    if (onHoverStart) onHoverStart();
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

    // Minimum swipe threshold (35px) and verify horizontal vector dominance
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped left -> show Panel B
        if (onSwipe) {
          onSwipe("left");
        } else if (onSelectPanel) {
          onSelectPanel("B");
        } else {
          executeLocalSwitch("B");
        }
      } else {
        // Swiped right -> show Panel A
        if (onSwipe) {
          onSwipe("right");
        } else if (onSelectPanel) {
          onSelectPanel("A");
        } else {
          executeLocalSwitch("A");
        }
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    resumeAfterDelay();
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (onSelectPanel) {
      onSelectPanel(currentPanelKey === "A" ? "B" : "A");
    } else {
      executeLocalSwitch();
    }
    resumeAfterDelay();
  };

  const handlePillClick = (panelKey: "A" | "B") => {
    if (onSelectPanel) {
      onSelectPanel(panelKey);
    } else {
      executeLocalSwitch(panelKey);
    }
    resumeAfterDelay();
  };

  const currentPanel = currentPanelKey === "A" ? panelA : panelB;
  const IconComponent = currentPanel.icon;

  // Resolve accent color for both points (same color matching the card)
  const pillAActiveBg = resolveActivePillBg(panelA, cardAccentColor);
  const pillBActiveBg = resolveActivePillBg(panelB, cardAccentColor);

  const cardAccentText = cardAccentColor
    ? COLOR_CLASSES[cardAccentColor.toLowerCase()]?.text
    : undefined;

  return (
    <div
      onMouseEnter={() => {
        setIsPaused(true);
        if (onHoverStart) onHoverStart();
      }}
      onMouseLeave={() => {
        resumeAfterDelay();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardClick}
      className={`bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm relative overflow-hidden select-none min-h-[118px] cursor-pointer ${className}`}
      title="Click or swipe to switch views (auto-cycles every 7s)"
    >
      {/* Row 1: Status Badge + Dual-Pill Switcher */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tracking-normal shrink-0 transition-all duration-200 ease-out ${
            isFlipping ? "opacity-0 scale-95" : "opacity-100 scale-100"
          } ${
            currentPanel.badgeColor ||
            (cardAccentColor && COLOR_CLASSES[cardAccentColor.toLowerCase()]
              ? COLOR_CLASSES[cardAccentColor.toLowerCase()].badge
              : currentPanelKey === "A"
              ? "bg-zinc-800 text-zinc-300 border border-zinc-700/50"
              : "bg-zinc-800 text-zinc-300 border border-zinc-700/50")
          }`}
        >
          {currentPanel.badge}
        </span>

        {/* Dual-Pill Visual Switcher Controls with Synchronized Expanding Accent Colors */}
        <div
          className="flex items-center gap-1 bg-[#141414] px-1.5 py-1 rounded border border-[#2a2a2a] shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Show ${panelA.title}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePillClick("A");
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
              currentPanelKey === "A"
                ? `w-4 ${pillAActiveBg}`
                : "w-1.5 bg-[#444444] hover:bg-[#666666]"
            }`}
          />
          <button
            type="button"
            aria-label={`Show ${panelB.title}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePillClick("B");
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
              currentPanelKey === "B"
                ? `w-4 ${pillBActiveBg}`
                : "w-1.5 bg-[#444444] hover:bg-[#666666]"
            }`}
          />
          <div className="ml-1 pl-1 border-l border-[#2a2a2a]">
            <IconComponent
              className={`w-3.5 h-3.5 transition-all duration-200 ease-out ${
                isFlipping ? "opacity-0 scale-90" : "opacity-100 scale-100"
              } ${currentPanel.iconColor || cardAccentText || "text-white"}`}
            />
          </div>
        </div>
      </div>

      {/* Rows 2, 3, 4: Content Container with Smooth Crossfade & Micro-Translation */}
      <div
        className={`flex flex-col justify-between flex-1 transition-all duration-200 ease-out transform ${
          isFlipping ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Row 2: Full Width Topic Title */}
        <div
          className={`text-xs font-semibold uppercase tracking-wider truncate transition-colors duration-200 ${
            currentPanel.titleColor ||
            cardAccentText ||
            (currentPanelKey === "A" ? "text-[#A1A1AA]" : "text-white")
          }`}
          title={currentPanel.title}
        >
          {currentPanel.title}
        </div>

        {/* Row 3: Main KPI Value */}
        <div
          className={`text-xl md:text-2xl font-bold font-mono tracking-tight my-0.5 ${
            currentPanel.valueColor || cardAccentText || "text-white"
          }`}
        >
          {currentPanel.value}
        </div>

        {/* Row 4: Subtitle Details */}
        <div className="text-xs text-[#A1A1AA] font-medium mt-1.5 truncate">
          {currentPanel.subtitle}
        </div>
      </div>
    </div>
  );
};
