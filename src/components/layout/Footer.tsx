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
    <footer className="border-t border-[#1a1a1a] bg-[#050505] px-4 py-2.5 text-xs text-[#777777] mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Financial Standard & Sync State */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            <span className="text-[#aaaaaa] font-medium">Real-time Portfolio Ledger</span>
          </div>
          <span className="text-[#333333]">•</span>
          <span className="text-[#666666]">
            Valuations in Indian Rupee (₹ Lakhs / Crores)
          </span>
        </div>

        {/* Center: Live Snapshot Stats if available */}
        {(propertyCount !== undefined || totalLiquidity !== undefined) && (
          <div className="hidden md:flex items-center gap-3 font-mono text-[11px] text-[#888888]">
            {propertyCount !== undefined && (
              <span>{propertyCount} Properties Tracked</span>
            )}
            {transactionCount !== undefined && (
              <>
                <span className="text-[#333333]">•</span>
                <span>{transactionCount} Ledger Entries</span>
              </>
            )}
            {totalLiquidity !== undefined && (
              <>
                <span className="text-[#333333]">•</span>
                <span className="text-[#22C55E]">
                  Net Liquid Capital: {formatINRCompact(totalLiquidity)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Right: Date & Brand */}
        <div className="flex items-center gap-3 text-[#666666] text-[11px]">
          <span>{currentDate}</span>
          <span className="text-[#333333]">•</span>
          <span className="text-[#888888]">Avaniya Asset Tracker</span>
        </div>
      </div>
    </footer>
  );
};
