"use client";

import React from "react";

export type M3Tone = "primary" | "positive" | "warning" | "error" | "tertiary" | "secondary";

const TONE_MAP: Record<
  M3Tone,
  { fill: string; track: string; stopDot: string }
> = {
  primary: {
    fill: "bg-md-primary",
    track: "bg-md-primary-container/60 dark:bg-md-surface-highest",
    stopDot: "bg-md-primary",
  },
  positive: {
    fill: "bg-md-positive",
    track: "bg-md-positive-container/60 dark:bg-md-surface-highest",
    stopDot: "bg-md-positive",
  },
  warning: {
    fill: "bg-md-warning",
    track: "bg-md-warning-container/70 dark:bg-md-surface-highest",
    stopDot: "bg-md-warning",
  },
  error: {
    fill: "bg-md-error",
    track: "bg-md-error-container/60 dark:bg-md-surface-highest",
    stopDot: "bg-md-error",
  },
  tertiary: {
    fill: "bg-md-tertiary",
    track: "bg-md-tertiary-container/60 dark:bg-md-surface-highest",
    stopDot: "bg-md-tertiary",
  },
  secondary: {
    fill: "bg-md-secondary",
    track: "bg-md-secondary-container/70 dark:bg-md-surface-highest",
    stopDot: "bg-md-secondary",
  },
};

interface M3ProgressBarProps {
  value: number; // 0 to 100
  tone?: M3Tone;
  height?: "sm" | "md";
  className?: string;
}

/**
 * Material 3 Expressive Segmented Linear Progress Indicator:
 * - Thick pill active indicator with spring transition
 * - Signature 4px gap between active indicator and remaining tonal track
 * - Trailing stop-indicator dot anchored at the end of the track when < 100%
 */
export const M3ProgressBar: React.FC<M3ProgressBarProps> = ({
  value,
  tone = "primary",
  height = "md",
  className = "",
}) => {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const palette = TONE_MAP[tone];
  const barHeight = height === "sm" ? "h-2" : "h-2.5";
  const isComplete = clamped >= 99.5;
  const isEmpty = clamped <= 0.5;

  return (
    <div
      className={`w-full flex items-center gap-1 ${barHeight} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {!isEmpty && (
        <div
          className={`h-full rounded-full ${palette.fill} transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex-shrink-0`}
          style={{ width: `${clamped}%` }}
        />
      )}
      {!isComplete && (
        <div
          className={`relative flex-1 h-full rounded-full ${palette.track} overflow-hidden min-w-[10px]`}
        >
          <span
            className={`absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${palette.stopDot} opacity-85`}
          />
        </div>
      )}
    </div>
  );
};

interface M3LoadingIndicatorProps {
  size?: "xs" | "sm" | "md" | "lg";
  contained?: boolean;
  className?: string;
  label?: string;
}

const LOADER_SIZES = {
  xs: { outer: "w-4 h-4", svg: "w-3.5 h-3.5" },
  sm: { outer: "w-7 h-7", svg: "w-4 h-4" },
  md: { outer: "w-11 h-11", svg: "w-6 h-6" },
  lg: { outer: "w-16 h-16", svg: "w-9 h-9" },
};

/**
 * Material 3 Expressive Morphing Shape Loading Indicator:
 * Organic scalloped soft-burst / cookie geometry rotating smoothly
 * inside an optional tonal container, matching Android 16 / M3 Expressive.
 */
export const M3LoadingIndicator: React.FC<M3LoadingIndicatorProps> = ({
  size = "md",
  contained = false,
  className = "",
  label = "Loading",
}) => {
  const dims = LOADER_SIZES[size];

  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center flex-shrink-0 ${
        contained
          ? `${dims.outer} rounded-full bg-md-primary-container text-md-on-primary-container shadow-m3-1`
          : `${dims.svg} text-current`
      } ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="currentColor"
        className={`${contained ? dims.svg : "w-full h-full"} m3-expressive-loader`}
      >
        {/* 8-lobed Material 3 Expressive Soft Scalloped Star / Cookie */}
        <path d="M20 2.5C22.4 2.5 23.6 5.2 25.8 6.1C28 7 30.8 5.6 32.5 7.3C34.2 9 32.8 11.8 33.7 14C34.6 16.2 37.3 17.4 37.3 19.8C37.3 22.2 34.6 23.4 33.7 25.6C32.8 27.8 34.2 30.6 32.5 32.3C30.8 34 28 32.6 25.8 33.5C23.6 34.4 22.4 37.1 20 37.1C17.6 37.1 16.4 34.4 14.2 33.5C12 32.6 9.2 34 7.5 32.3C5.8 30.6 7.2 27.8 6.3 25.6C5.4 23.4 2.7 22.2 2.7 19.8C2.7 17.4 5.4 16.2 6.3 14C7.2 11.8 5.8 9 7.5 7.3C9.2 5.6 12 7 14.2 6.1C16.4 5.2 17.6 2.5 20 2.5Z" />
      </svg>
    </span>
  );
};

interface M3LinearLoadingBarProps {
  className?: string;
}

/**
 * Material 3 Expressive Indeterminate Linear Progress Bar
 */
export const M3LinearLoadingBar: React.FC<M3LinearLoadingBarProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`relative w-full h-2 rounded-full bg-md-primary-container/60 dark:bg-md-surface-highest overflow-hidden ${className}`}
      role="progressbar"
      aria-label="Loading"
    >
      <div className="absolute inset-y-0 w-2/5 rounded-full bg-md-primary m3-indeterminate-bar" />
    </div>
  );
};
