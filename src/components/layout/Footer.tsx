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
    <footer className="border-t border-slate-200 bg-white px-4 py-3.5 text-xs text-slate-500 mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Live Sync Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 font-semibold">Live Portfolio Sync</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">
            Amounts in Indian Rupees (₹)
          </span>
        </div>

        {/* Center: Live Snapshot Stats if available */}
        {(propertyCount !== undefined || totalLiquidity !== undefined) && (
          <div className="hidden md:flex items-center gap-3 font-mono text-xs text-slate-600">
            {propertyCount !== undefined && (
              <span className="font-medium">
                {propertyCount} {propertyCount === 1 ? "Property" : "Properties"}
              </span>
            )}
            {transactionCount !== undefined && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-medium">
                  {transactionCount} {transactionCount === 1 ? "Entry" : "Entries"}
                </span>
              </>
            )}
            {totalLiquidity !== undefined && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full font-semibold">
                  Available Funds: {formatINRCompact(totalLiquidity)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Right: Date & Brand */}
        <div className="flex items-center gap-2.5 text-slate-500 text-xs font-medium">
          <span>{currentDate}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-800 font-semibold">Avaniya</span>
        </div>
      </div>
    </footer>
  );
};
