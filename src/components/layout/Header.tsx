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
  ShieldCheck,
  FolderLock,
} from "lucide-react";

interface HeaderProps {
  currentMode: "commercial" | "personal";
  onModeChange: (mode: "commercial" | "personal") => void;
  onOpenEntryModal: (type: "outflow" | "inflow" | "transfer") => void;
  onOpenNewPropertyModal: () => void;
  onOpenExportModal: () => void;
  onOpenCategoryModal: () => void;
  user?: { name: string; email: string; role: string; datasetId?: string } | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenSuperAdminModal?: () => void;
  currentDatasetId?: string;
  onSwitchDataset?: (datasetId: string) => void;
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
  onOpenSuperAdminModal,
  currentDatasetId,
  onSwitchDataset,
}) => {
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-[#262626] px-3 sm:px-4 py-2.5 sm:py-3 w-full max-w-[100vw] overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-2.5">
        {/* Main Row: Brand on Left, Auth & Admin on Top-Right Corner */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 min-w-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-[#383838] bg-[#0c120e] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Image
                src="/logo.jpg"
                alt="Avaniya"
                width={40}
                height={40}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
                <span className="truncate">Avaniya</span>
                {currentDatasetId === "ds_demo_sandbox" ? (
                  <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded bg-amber-950/50 text-amber-400 border border-amber-800/40 whitespace-nowrap flex-shrink-0">
                    SANDBOX
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs font-mono font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626] whitespace-nowrap flex-shrink-0">
                    Portfolio
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#71717A] font-medium hidden sm:block truncate">
                Indian Real Estate Liquidity &amp; Deal Tracking Engine
              </div>
            </div>
          </div>

          {/* Desktop Inline Mode Switcher */}
          <div className="hidden lg:flex items-center bg-[#111111] p-1 rounded-lg border border-[#262626]">
            <button
              onClick={() => onModeChange("commercial")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                currentMode === "commercial"
                  ? "bg-[#262626] text-white shadow-sm font-bold"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Commercial Land Business</span>
            </button>
            <button
              onClick={() => onModeChange("personal")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                currentMode === "personal"
                  ? "bg-[#262626] text-white shadow-sm font-bold"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Personal Asset Investment</span>
            </button>
          </div>

          {/* Top Right Corner Profile & Quick Egress */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Super Admin Dataset Switcher (Desktop) */}
            {isSuperAdmin && onSwitchDataset && (
              <div className="hidden xl:flex items-center gap-1.5 bg-[#111111] px-2.5 py-1.5 rounded-lg border border-emerald-800/40 text-xs">
                <FolderLock className="w-3.5 h-3.5 text-emerald-400" />
                <select
                  value={currentDatasetId || "ds_yousuf_portfolio"}
                  onChange={(e) => onSwitchDataset(e.target.value)}
                  className="bg-transparent text-emerald-400 font-mono text-xs font-semibold outline-none cursor-pointer"
                  title="Super Admin Workspace Switcher"
                >
                  <option value="ds_yousuf_portfolio" className="bg-[#111111] text-white">
                    Mohammed Yousuf
                  </option>
                  <option value="all" className="bg-[#111111] text-white">
                    [All Datasets]
                  </option>
                </select>
              </div>
            )}

            {/* Super Admin Panel Button */}
            {isSuperAdmin && onOpenSuperAdminModal && (
              <button
                onClick={onOpenSuperAdminModal}
                className="btn-action-primary p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs flex items-center gap-1"
                title="Super Admin Panel"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* Desktop Action Buttons Group */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => onOpenEntryModal("outflow")}
                className="btn-action-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                title="Log Outflow or Land Expense"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Outflow</span>
              </button>

              <button
                onClick={() => onOpenEntryModal("inflow")}
                className="btn-action-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                title="Log Buyer Receipt or Capital Inflow"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Inflow</span>
              </button>

              <button
                onClick={onOpenNewPropertyModal}
                className="btn-action-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                title="Create New Real Estate Asset"
              >
                <span>+ Property</span>
              </button>

              <button
                onClick={onOpenExportModal}
                className="btn-action-primary flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                title="Export Excel / PDF / CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <button
                onClick={onOpenCategoryModal}
                className="p-1.5 rounded-lg bg-[#111111] text-[#A1A1AA] border border-[#262626] hover:text-white hover:border-[#383838] transition-all duration-150"
                title="Categories & Formulas"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Auth Pill & Logout (Positioned cleanly on Top Right) */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 border-l border-[#262626]">
                <div
                  className="flex items-center gap-1.5 bg-[#111111] px-2 sm:px-2.5 py-1.5 rounded-lg border border-[#262626] text-xs text-[#E4E4E7] max-w-[130px] sm:max-w-[160px]"
                  title={`Signed in as ${user.email} (${user.role})`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isSuperAdmin ? "bg-amber-400" : "bg-[#22C55E]"
                    }`}
                  ></div>
                  <span className="font-semibold truncate text-[11px] sm:text-xs">{user.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 rounded-lg bg-[#111111] text-[#A1A1AA] border border-[#262626] hover:text-rose-400 hover:border-rose-900/50 transition-all duration-150 flex-shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="btn-action-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Row: Full-Width Mode Switcher */}
        <div className="flex lg:hidden items-center bg-[#111111] p-1 rounded-lg border border-[#262626] w-full">
          <button
            onClick={() => onModeChange("commercial")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all duration-150 ${
              currentMode === "commercial"
                ? "bg-[#262626] text-white shadow-sm font-bold"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Commercial Land</span>
          </button>
          <button
            onClick={() => onModeChange("personal")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all duration-150 ${
              currentMode === "personal"
                ? "bg-[#262626] text-white shadow-sm font-bold"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            <Home className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Personal Assets</span>
          </button>
        </div>

        {/* Mobile Sub-Row: Action Buttons Row (Touch Friendly & Strictly Contained) */}
        <div className="flex md:hidden items-center justify-between gap-1.5 w-full overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
          <button
            onClick={() => onOpenEntryModal("outflow")}
            className="btn-action-primary flex-1 min-w-[85px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>Outflow</span>
          </button>

          <button
            onClick={() => onOpenEntryModal("inflow")}
            className="btn-action-primary flex-1 min-w-[80px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold"
          >
            <ArrowUpRight className="w-3 h-3 text-[#22C55E]" />
            <span>Inflow</span>
          </button>

          <button
            onClick={onOpenNewPropertyModal}
            className="btn-action-primary flex-1 min-w-[80px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold"
          >
            <span>+ Deal</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="btn-action-primary flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold flex-shrink-0"
            title="Export Excel / PDF"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>

          <button
            onClick={onOpenCategoryModal}
            className="p-1.5 rounded-lg bg-[#111111] text-[#A1A1AA] border border-[#262626] hover:text-white flex-shrink-0"
            title="Categories & Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
