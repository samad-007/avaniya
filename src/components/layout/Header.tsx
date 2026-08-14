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
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-[#262626] px-4 py-3">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#383838] bg-[#0c120e] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Image
              src="/logo.jpg"
              alt="Avaniya"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div>
            <div className="text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Avaniya</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626]">
                Portfolio
              </span>
            </div>
            <div className="text-xs text-[#A1A1AA] font-medium">
              Indian Real Estate Liquidity &amp; Deal Tracking Engine
            </div>
          </div>
        </div>

        {/* Dual Mode Toggle Switcher */}
        <div className="flex items-center bg-[#111111] p-1 rounded-lg border border-[#262626]">
          <button
            onClick={() => onModeChange("commercial")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all duration-150 ${
              currentMode === "commercial"
                ? "bg-[#262626] text-white shadow-sm font-bold"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Commercial Land Business</span>
          </button>
          <button
            onClick={() => onModeChange("personal")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all duration-150 ${
              currentMode === "personal"
                ? "bg-[#262626] text-white shadow-sm font-bold"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Personal Asset Investment</span>
          </button>
        </div>

        {/* Action Buttons & Auth Profile */}
        <div className="flex items-center gap-2.5">
          {/* Super Admin Dataset Switcher (Only visible to Super Admin) */}
          {isSuperAdmin && onSwitchDataset && (
            <div className="hidden lg:flex items-center gap-1.5 bg-[#111111] px-2.5 py-1.5 rounded-lg border border-emerald-800/40 text-xs">
              <FolderLock className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={currentDatasetId || "ds_yousuf_portfolio"}
                onChange={(e) => onSwitchDataset(e.target.value)}
                className="bg-transparent text-emerald-400 font-mono text-xs font-semibold outline-none cursor-pointer"
                title="Super Admin Workspace Switcher"
              >
                <option value="ds_yousuf_portfolio" className="bg-[#111111] text-white">
                  Mohammed Yousuf Portfolio
                </option>
                <option value="all" className="bg-[#111111] text-white">
                  [All Platform Datasets]
                </option>
              </select>
            </div>
          )}

          {/* Super Admin Control Center Button */}
          {isSuperAdmin && onOpenSuperAdminModal && (
            <button
              onClick={onOpenSuperAdminModal}
              className="btn-action-primary flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm"
              title="Super Admin User & Dataset Management"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
          )}

          {/* Key Ingress Action: Record Outflow */}
          <button
            onClick={() => onOpenEntryModal("outflow")}
            className="btn-action-primary flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm"
            title="Log Outflow or Land Expense"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Outflow</span>
          </button>

          {/* Key Ingress Action: Add Inflow */}
          <button
            onClick={() => onOpenEntryModal("inflow")}
            className="btn-action-primary flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm"
            title="Log Buyer Receipt or Capital Inflow"
          >
            <ArrowUpRight className="w-4 h-4 text-[#22C55E]" />
            <span>Add Inflow</span>
          </button>

          {/* Key Ingress Action: New Property */}
          <button
            onClick={onOpenNewPropertyModal}
            className="btn-action-primary hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm"
            title="Create New Real Estate Asset"
          >
            <span>+ New Property</span>
          </button>

          {/* Key Egress Action: Export */}
          <button
            onClick={onOpenExportModal}
            className="btn-action-primary flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm"
            title="Export to Excel, PDF, or CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={onOpenCategoryModal}
            className="p-2 rounded-lg bg-[#111111] text-[#A1A1AA] border border-[#262626] hover:text-white hover:border-[#383838] transition-all duration-150"
            title="Dynamic Categories & Formulas"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* User Auth Status Pill */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#262626]">
              <div
                className="flex items-center gap-2 bg-[#111111] px-3 py-1.5 rounded-lg border border-[#262626] text-xs sm:text-sm text-[#E4E4E7]"
                title={`Signed in as ${user.email} (${user.role})`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSuperAdmin ? "bg-amber-400" : "bg-[#22C55E]"
                  }`}
                ></div>
                <span className="font-semibold max-w-[120px] truncate">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-[#111111] text-[#A1A1AA] border border-[#262626] hover:text-rose-400 hover:border-rose-900/50 transition-all duration-150"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn-action-primary flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
