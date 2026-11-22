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

const ACCENT_ROLES: Record<
  string,
  {
    iconBg: string;
    iconText: string;
    activePill: string;
  }
> = {
  primary: {
    iconBg: "bg-md-primary-container",
    iconText: "text-md-on-primary-container",
    activePill: "bg-md-primary",
  },
  secondary: {
    iconBg: "bg-md-secondary-container",
    iconText: "text-md-on-secondary-container",
    activePill: "bg-md-secondary",
  },
  tertiary: {
    iconBg: "bg-md-tertiary-container",
    iconText: "text-md-on-tertiary-container",
    activePill: "bg-md-tertiary",
  },
  positive: {
    iconBg: "bg-md-positive-container",
    iconText: "text-md-on-positive-container",
    activePill: "bg-md-positive",
  },
  warning: {
    iconBg: "bg-md-warning-container",
    iconText: "text-md-on-warning-container",
    activePill: "bg-md-warning",
  },
  error: {
    iconBg: "bg-md-error-container",
    iconText: "text-md-on-error-container",
    activePill: "bg-md-error",
  },
};

function resolveAccent(color?: string) {
  const key = (color || "primary").toLowerCase();
  if (key === "emerald" || key === "green" || key === "positive")
    return ACCENT_ROLES.positive;
  if (key === "amber" || key === "yellow" || key === "warning")
    return ACCENT_ROLES.warning;
  if (key === "rose" || key === "red" || key === "error")
    return ACCENT_ROLES.error;
  if (key === "blue" || key === "purple" || key === "tertiary")
    return ACCENT_ROLES.tertiary;
  if (key === "cyan" || key === "secondary") return ACCENT_ROLES.secondary;
  return ACCENT_ROLES.primary;
}

export const CyclingKpiCard: React.FC<CyclingKpiCardProps> = ({
  panelA,
  panelB,
  cardAccentColor = "primary",
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
  const theme = resolveAccent(cardAccentColor);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardClick}
      className={`m3-card p-4 flex flex-col justify-between relative overflow-hidden select-none min-h-[136px] cursor-pointer active:scale-[0.985] ${className}`}
      title="Tap to switch between overview and details"
    >
      {/* Top Row: Expressive Squircle Icon + M3 View Dots */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          className={`w-9 h-9 rounded-[14px] flex items-center justify-center flex-shrink-0 ${theme.iconBg} ${theme.iconText}`}
        >
          <IconComponent className="w-4 h-4" />
        </div>

        <div
          className="flex items-center gap-1.5 bg-md-surface-container px-2 py-1 rounded-full shrink-0"
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
                : "w-1.5 bg-md-outline-variant hover:bg-md-outline"
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
                : "w-1.5 bg-md-outline-variant hover:bg-md-outline"
            }`}
          />
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col justify-between flex-1 transition-all duration-150 ease-out transform ${
          isFlipping ? "opacity-0 -translate-y-0.5" : "opacity-100 translate-y-0"
        }`}
      >
        <div
          className="text-xs font-semibold text-md-on-surface-variant truncate"
          title={currentPanel.title}
        >
          {currentPanel.title}
        </div>

        <div
          className={`font-display text-xl md:text-2xl font-bold font-mono tracking-tight my-1 ${
            currentPanel.valueColor || "text-md-on-surface"
          }`}
        >
          {currentPanel.value}
        </div>

        <div className="text-[11px] text-md-on-surface-variant font-medium mt-0.5 truncate">
          {currentPanel.subtitle}
        </div>
      </div>
    </div>
  );
};
