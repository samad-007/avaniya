"use client";

import React, { useState, useRef, useCallback } from "react";
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

const COLOR_STYLES: Record<
  string,
  {
    activePill: string;
    iconBg: string;
    iconText: string;
    badge: string;
    accentBorder: string;
  }
> = {
  blue: {
    activePill: "bg-blue-600",
    iconBg: "bg-blue-50 border-blue-100",
    iconText: "text-blue-600",
    badge: "bg-blue-50 text-blue-700 border border-blue-200/70",
    accentBorder: "hover:border-blue-300",
  },
  emerald: {
    activePill: "bg-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-100",
    iconText: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
    accentBorder: "hover:border-emerald-300",
  },
  cyan: {
    activePill: "bg-teal-600",
    iconBg: "bg-teal-50 border-teal-100",
    iconText: "text-teal-600",
    badge: "bg-teal-50 text-teal-700 border border-teal-200/70",
    accentBorder: "hover:border-teal-300",
  },
  amber: {
    activePill: "bg-amber-500",
    iconBg: "bg-amber-50 border-amber-100",
    iconText: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 border border-amber-200/70",
    accentBorder: "hover:border-amber-300",
  },
  rose: {
    activePill: "bg-rose-600",
    iconBg: "bg-rose-50 border-rose-100",
    iconText: "text-rose-600",
    badge: "bg-rose-50 text-rose-700 border border-rose-200/70",
    accentBorder: "hover:border-rose-300",
  },
  purple: {
    activePill: "bg-violet-600",
    iconBg: "bg-violet-50 border-violet-100",
    iconText: "text-violet-600",
    badge: "bg-violet-50 text-violet-700 border border-violet-200/70",
    accentBorder: "hover:border-violet-300",
  },
  slate: {
    activePill: "bg-slate-700",
    iconBg: "bg-slate-100 border-slate-200",
    iconText: "text-slate-700",
    badge: "bg-slate-100 text-slate-700 border border-slate-200",
    accentBorder: "hover:border-slate-300",
  },
};

export const CyclingKpiCard: React.FC<CyclingKpiCardProps> = ({
  panelA,
  panelB,
  cardAccentColor = "slate",
  activePanel: activePanelProp,
  isFlipping: isFlippingProp,
  initialPanel = "A",
  className = "",
  onClick,
  onSelectPanel,
  onSwipe,
}) => {
  const [internalPanel, setInternalPanel] = useState<"A" | "B">(initialPanel);
  const [internalFlipping, setInternalFlipping] = useState(false);

  const isControlled = activePanelProp !== undefined;
  const currentPanelKey = isControlled ? activePanelProp : internalPanel;
  const isFlipping =
    isFlippingProp !== undefined ? isFlippingProp : internalFlipping;

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executeLocalSwitch = useCallback((target?: "A" | "B") => {
    setInternalFlipping(true);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = setTimeout(() => {
      setInternalPanel((prev) => target ?? (prev === "A" ? "B" : "A"));
      setInternalFlipping(false);
    }, 140);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }

    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        if (onSwipe) onSwipe("left");
        else if (onSelectPanel) onSelectPanel("B");
        else executeLocalSwitch("B");
      } else {
        if (onSwipe) onSwipe("right");
        else if (onSelectPanel) onSelectPanel("A");
        else executeLocalSwitch("A");
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleCardClick = () => {
    if (onClick) onClick();
    else if (onSelectPanel) onSelectPanel(currentPanelKey === "A" ? "B" : "A");
    else executeLocalSwitch();
  };

  const handlePillClick = (panelKey: "A" | "B") => {
    if (onSelectPanel) onSelectPanel(panelKey);
    else executeLocalSwitch(panelKey);
  };

  const currentPanel = currentPanelKey === "A" ? panelA : panelB;
  const IconComponent = currentPanel.icon;
  const theme =
    COLOR_STYLES[cardAccentColor.toLowerCase()] || COLOR_STYLES.slate;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardClick}
      className={`bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between shadow-card hover:shadow-card-hover ${theme.accentBorder} transition-standard relative overflow-hidden select-none min-h-[132px] cursor-pointer group ${className}`}
      title="Tap to switch between overview and detail view"
    >
      {/* Top Row: Icon + Title Pill & Switcher Dots */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div
          className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${theme.iconBg}`}
        >
          <IconComponent className={`w-4 h-4 ${theme.iconText}`} />
        </div>

        {/* Calm 2-dot View Indicator */}
        <div
          className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-200/80 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Show ${panelA.title}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePillClick("A");
            }}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              currentPanelKey === "A"
                ? `w-4 ${theme.activePill}`
                : "w-1.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
          <button
            type="button"
            aria-label={`Show ${panelB.title}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePillClick("B");
            }}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              currentPanelKey === "B"
                ? `w-4 ${theme.activePill}`
                : "w-1.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        </div>
      </div>

      {/* Main Content with Smooth Crossfade */}
      <div
        className={`flex flex-col justify-between flex-1 transition-all duration-150 ease-out transform ${
          isFlipping ? "opacity-0 -translate-y-0.5" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between gap-1.5">
          <div
            className="text-xs font-semibold text-slate-500 truncate"
            title={currentPanel.title}
          >
            {currentPanel.title}
          </div>
        </div>

        <div
          className={`text-xl md:text-2xl font-bold font-mono tracking-tight my-1 ${
            currentPanel.valueColor || "text-slate-900"
          }`}
        >
          {currentPanel.value}
        </div>

        <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
          {currentPanel.subtitle}
        </div>
      </div>
    </div>
  );
};
