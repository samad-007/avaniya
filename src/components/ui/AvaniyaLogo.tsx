"use client";

import React from "react";

interface AvaniyaLogoProps {
  className?: string;
  /**
   * "themed" adapts seamlessly to the active Material 3 Expressive palette & light/dark mode.
   * "brand" preserves the classic emerald & warm gold mark on a deep charcoal tile.
   */
  variant?: "themed" | "brand";
}

export const AvaniyaLogo: React.FC<AvaniyaLogoProps> = ({
  className = "w-10 h-10",
  variant = "themed",
}) => {
  const isThemed = variant === "themed";

  const bgFill = isThemed ? "var(--md-sys-color-primary-container)" : "#111915";
  const facetPrimary = isThemed ? "var(--md-sys-color-primary)" : "#158056";
  const facetSecondary = isThemed ? "var(--md-sys-color-tertiary)" : "#0F6E4A";
  const strokeColor = isThemed
    ? "var(--md-sys-color-on-primary-container)"
    : "#DFC07C";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Avaniya Logo"
    >
      <rect width="64" height="64" rx="16" fill={bgFill} />

      {/* Architectural facets */}
      <g fillOpacity={isThemed ? 0.28 : 1}>
        <path
          d="M27.5 21V13.8L36.5 9.5V22.5L32 19.6L27.5 21Z"
          fill={facetPrimary}
        />
        <path
          d="M19 38.5V24.5L27.5 19.5V31.5L21.5 38.5H19Z"
          fill={facetPrimary}
        />
        <path
          d="M36.5 21.5L45 26.2V38.5H36.5V21.5Z"
          fill={facetPrimary}
        />
        <path
          d="M15.5 43.2L25.5 49.5H15.5V43.2Z"
          fill={facetPrimary}
        />
        <path
          d="M48.5 43.2L38.5 49.5H48.5V43.2Z"
          fill={facetPrimary}
        />
      </g>

      <g fillOpacity={isThemed ? 0.42 : 1}>
        <path
          d="M24.5 38.5L32.5 29.8V38.5H24.5Z"
          fill={facetSecondary}
        />
        <path
          d="M32 45.8L40 41H24L32 45.8Z"
          fill={facetSecondary}
        />
      </g>

      {/* Minimalist geometric architectural linework */}
      <g
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M27.5 20V13.8L36.5 9.5V21.5" />
        <path d="M19 38.5V24.5L27.5 19.5" />
        <path d="M32 28.5V18.5L45 26.2V38.5" />
        <path d="M21.5 38.5L33 27.5V38.5" />
        <path d="M14.5 39.5H24.5L32 44.5L39.5 39.5H49.5" />
        <path d="M14.5 39.5L32 51L49.5 39.5" />
        <path d="M14.5 39.5V50.5H25.5" />
        <path d="M49.5 39.5V50.5H38.5" />
      </g>
    </svg>
  );
};
