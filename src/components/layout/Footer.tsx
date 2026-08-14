import React from "react";
import { ShieldCheck, Database, HardDrive, CheckCircle2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#222222] bg-[#050505] px-4 py-3 text-xs text-[#777777] mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#22C55E]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block animate-pulse"></span>
            <span className="font-mono text-[11px] text-white">System Active</span>
          </div>
          <div className="flex items-center gap-1 text-[#888888]">
            <Database className="w-3 h-3 text-[#3B82F6]" />
            <span>MongoDB Atlas (Mumbai ap-south-1)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[#888888]">
            <HardDrive className="w-3 h-3 text-[#F59E0B]" />
            <span>20+ Year Free Storage Capacity (&lt;1% quota used)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#666666]">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>OWASP Session Security Active</span>
          </div>
          <span>•</span>
          <span>Indian Numbering System (L / Cr)</span>
        </div>
      </div>
    </footer>
  );
};
