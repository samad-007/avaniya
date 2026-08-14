"use client";

import React from "react";
import Image from "next/image";
import {
  Building2,
  Home,
  Plus,
  ArrowUpRight,
  Download,
  Settings2,
  LogOut,
  User as UserIcon,
} from "lucide-react";

interface HeaderProps {
  currentMode: "commercial" | "personal";
  onModeChange: (mode: "commercial" | "personal") => void;
  onOpenEntryModal: (type: "outflow" | "inflow" | "transfer") => void;
  onOpenNewPropertyModal: () => void;
  onOpenExportModal: () => void;
  onOpenCategoryModal: () => void;
  user?: { name: string; email: string; role: string } | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  onOpenEntryModal,
  onOpenNewPropertyModal,
  onOpenExportModal,
  onOpenCategoryModal,
  user,
  onOpenAuthModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-[#222222] px-4 py-3">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Generated Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[#333333] bg-[#0c120e] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Image
              src="/logo.jpg"
              alt="Avaniya Real Estate Portfolio"
              width={36}
              height={36}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div>
            <div className="text-sm md:text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Avaniya Land & Asset Portfolio</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161616] text-[#888888] border border-[#222222]">
                v1.0
              </span>
            </div>
            <div className="text-xs text-[#888888]">
              Indian Real Estate Liquidity & Deal Tracking Engine
            </div>
          </div>
        </div>

        {/* Dual Mode Toggle Switcher */}
        <div className="flex items-center bg-[#111111] p-1 rounded-md border border-[#222222]">
          <button
            onClick={() => onModeChange("commercial")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-standard ${
              currentMode === "commercial"
                ? "bg-[#222222] text-white font-semibold shadow-sm"
                : "text-[#888888] hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Commercial Land Business</span>
          </button>
          <button
            onClick={() => onModeChange("personal")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-standard ${
              currentMode === "personal"
                ? "bg-[#222222] text-white font-semibold shadow-sm"
                : "text-[#888888] hover:text-white"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Personal Asset Investment</span>
          </button>
        </div>

        {/* Action Buttons & Auth Profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenEntryModal("outflow")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black text-xs font-semibold hover:bg-[#e0e0e0] transition-standard"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Record Outflow</span>
          </button>

          <button
            onClick={() => onOpenEntryModal("inflow")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111111] text-white border border-[#222222] text-xs font-medium hover:bg-[#1a1a1a] hover:border-[#333333] transition-standard"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Add Inflow</span>
          </button>

          <button
            onClick={onOpenNewPropertyModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111111] text-white border border-[#222222] text-xs font-medium hover:bg-[#1a1a1a] hover:border-[#333333] transition-standard"
          >
            <span>+ New Property</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111111] text-white border border-[#222222] text-xs font-medium hover:bg-[#1a1a1a] hover:border-[#333333] transition-standard"
            title="Export to Excel, PDF, or CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={onOpenCategoryModal}
            className="p-1.5 rounded bg-[#111111] text-[#888888] border border-[#222222] hover:text-white hover:border-[#333333] transition-standard"
            title="Dynamic Categories & Formulas"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* User Auth Status Pill */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#222222]">
              <div
                className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded border border-[#222222] text-xs text-[#cccccc]"
                title={`Signed in as ${user.email}`}
              >
                <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                <span className="font-medium max-w-[100px] truncate">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded bg-[#111111] text-[#888888] border border-[#222222] hover:text-rose-400 hover:border-rose-900/50 transition-standard"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#161616] text-white border border-[#333333] text-xs font-medium hover:bg-[#222222] transition-standard"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
