import React from "react";
import { formatINRCompact } from "@/lib/formatters";

interface FooterProps {
  propertyCount?: number;
  transactionCount?: number;
  totalLiquidity?: number;
}

export const Footer: React.FC<FooterProps> = ({
  propertyCount,
  transactionCount,
  totalLiquidity,
}) => {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <footer className="border-t border-md-outline-variant/70 bg-md-surface-low px-4 py-3.5 text-xs text-md-on-surface-variant mt-auto transition-standard">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Live Sync Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-md-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-md-primary"></span>
            </span>
            <span className="text-md-on-surface font-semibold">
              Live Portfolio Sync
            </span>
          </div>
          <span className="text-md-outline-variant">•</span>
          <span>Amounts in Indian Rupees (₹)</span>
        </div>

        {/* Center: Live Snapshot Stats */}
        {(propertyCount !== undefined || totalLiquidity !== undefined) && (
          <div className="hidden md:flex items-center gap-3 font-mono text-xs text-md-on-surface-variant">
            {propertyCount !== undefined && (
              <span className="font-medium">
                {propertyCount} {propertyCount === 1 ? "Property" : "Properties"}
              </span>
            )}
            {transactionCount !== undefined && (
              <>
                <span className="text-md-outline-variant">•</span>
                <span className="font-medium">
                  {transactionCount} {transactionCount === 1 ? "Entry" : "Entries"}
                </span>
              </>
            )}
            {totalLiquidity !== undefined && (
              <>
                <span className="text-md-outline-variant">•</span>
                <span className="bg-md-primary-container text-md-on-primary-container px-2.5 py-0.5 rounded-full font-semibold">
                  Available Funds: {formatINRCompact(totalLiquidity)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Right: Date & Brand */}
        <div className="flex items-center gap-2.5 text-xs font-medium">
          <span>{currentDate}</span>
          <span className="text-md-outline-variant">•</span>
          <span className="font-display text-md-on-surface font-bold">
            Avaniya
          </span>
        </div>
      </div>
    </footer>
  );
};
