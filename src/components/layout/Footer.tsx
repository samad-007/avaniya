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
    <footer className="border-t border-[#262626] bg-[#050505] px-4 py-3 text-xs text-[#A1A1AA] mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Financial Standard & Sync State */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
            <span className="text-[#E4E4E7] font-semibold">Real-time Portfolio Ledger</span>
          </div>
          <span className="text-[#3F3F46]">•</span>
          <span className="text-[#A1A1AA]">
            Valuations in Indian Rupee (₹ Lakhs / Crores)
          </span>
        </div>

        {/* Center: Live Snapshot Stats if available */}
        {(propertyCount !== undefined || totalLiquidity !== undefined) && (
          <div className="hidden md:flex items-center gap-3 font-mono text-xs text-[#D4D4D8]">
            {propertyCount !== undefined && (
              <span className="font-semibold">{propertyCount} Properties Tracked</span>
            )}
            {transactionCount !== undefined && (
              <>
                <span className="text-[#3F3F46]">•</span>
                <span className="font-semibold">{transactionCount} Ledger Entries</span>
              </>
            )}
            {totalLiquidity !== undefined && (
              <>
                <span className="text-[#3F3F46]">•</span>
                <span className="text-[#22C55E] font-bold">
                  Net Liquid Capital: {formatINRCompact(totalLiquidity)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Right: Date & Brand */}
        <div className="flex items-center gap-3 text-[#A1A1AA] text-xs font-medium">
          <span>{currentDate}</span>
          <span className="text-[#3F3F46]">•</span>
          <span className="text-white font-semibold">Avaniya Asset Tracker</span>
        </div>
      </div>
    </footer>
  );
};
