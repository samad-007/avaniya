"use client";

import React from "react";
import Image from "next/image";
import {
  Building2,
  Home,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Download,
  Settings2,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  FolderLock,
  HandCoins,
  Wallet,
} from "lucide-react";

interface HeaderProps {
  currentMode: "commercial" | "personal";
  onModeChange: (mode: "commercial" | "personal") => void;
  onOpenEntryModal: (
    type: "outflow" | "inflow" | "transfer" | "withdrawal" | "loan"
  ) => void;
  onOpenNewPropertyModal: () => void;
  onOpenNewLoanModal?: () => void;
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
  onOpenNewLoanModal,
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-5 py-3 w-full max-w-[100vw] overflow-x-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-3">
        {/* Row 1: Brand, Mode Switcher, and User Profile */}
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-slate-200 bg-emerald-50 flex items-center justify-center flex-shrink-0 shadow-sm">
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
              <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="truncate">Avaniya</span>
                {currentDatasetId === "ds_demo_sandbox" ? (
                  <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap flex-shrink-0">
                    Demo Mode
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap flex-shrink-0">
                    Portfolio
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-medium hidden sm:block truncate">
                Simple Property, Payment &amp; Profit Tracker
              </div>
            </div>
          </div>

          {/* Desktop Mode Switcher */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => onModeChange("commercial")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                currentMode === "commercial"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2
                className={`w-3.5 h-3.5 ${
                  currentMode === "commercial"
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              />
              <span>Business Deals</span>
            </button>
            <button
              onClick={() => onModeChange("personal")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                currentMode === "personal"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home
                className={`w-3.5 h-3.5 ${
                  currentMode === "personal"
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              />
              <span>Personal Homes</span>
            </button>
          </div>

          {/* Top Right: User Profile & Logout */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {user ? (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 flex-shrink-0"
                  title={`Signed in as ${user.email}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isSuperAdmin ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <span className="font-semibold text-xs whitespace-nowrap text-slate-800">
                    {user.name}
                  </span>
                  {isSuperAdmin && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-white text-slate-500 border border-slate-200 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all duration-150 flex-shrink-0"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="btn-action-brand flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs flex-shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Desktop Quick Actions Bar */}
        <div className="hidden md:flex items-center justify-between gap-3 pt-2.5 border-t border-slate-100 w-full">
          {/* Primary Everyday Actions (Plain English) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenEntryModal("outflow")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100/80 hover:border-rose-300 transition-all shadow-soft"
              title="Record money you paid for land, construction, or expenses"
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => onOpenEntryModal("inflow")}
              className="btn-action-brand flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs"
              title="Record money received from buyers, savings, or partners"
            >
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Receipt</span>
            </button>

            <button
              onClick={onOpenNewPropertyModal}
              className="btn-action-primary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs"
              title="Add a new land deal or personal property"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Property</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            <button
              onClick={() => onOpenEntryModal("withdrawal")}
              className="btn-action-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-700"
              title="Record profit taken out or capital returned"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-600" />
              <span>Withdraw</span>
            </button>

            {onOpenNewLoanModal && currentMode === "commercial" && (
              <button
                onClick={onOpenNewLoanModal}
                className="btn-action-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-700"
                title="Track a bank loan or borrowed funds"
              >
                <HandCoins className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Loan</span>
              </button>
            )}

            <button
              onClick={onOpenExportModal}
              className="btn-action-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-700"
              title="Download Excel, PDF, or CSV report"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export</span>
            </button>

            <button
              onClick={onOpenCategoryModal}
              className="p-2 rounded-xl bg-white text-slate-500 border border-slate-200 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all"
              title="Manage Expense & Income Categories"
              aria-label="Categories & Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          {/* Right Side of Toolbar: Admin Controls or Live Status */}
          {isSuperAdmin ? (
            <div className="flex items-center gap-2">
              {onSwitchDataset && (
                <div className="flex items-center gap-1.5 bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
                  <FolderLock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] text-slate-500 hidden lg:inline font-medium">
                    Workspace:
                  </span>
                  <select
                    value={currentDatasetId || "ds_yousuf_portfolio"}
                    onChange={(e) => onSwitchDataset(e.target.value)}
                    className="bg-transparent text-emerald-800 font-semibold text-xs outline-none cursor-pointer"
                    title="Switch Active Portfolio"
                  >
                    <option value="ds_yousuf_portfolio">
                      Mohammed Yousuf Portfolio
                    </option>
                    <option value="ds_demo_sandbox">
                      Sandbox Demo Dataset
                    </option>
                    <option value="all">[All Datasets Consolidated]</option>
                  </select>
                </div>
              )}

              {onOpenSuperAdminModal && (
                <button
                  onClick={onOpenSuperAdminModal}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Open Admin Console"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {currentMode === "commercial"
                  ? "Commercial Land Portfolio"
                  : "Personal Property Tracker"}
              </span>
            </div>
          )}
        </div>

        {/* Mobile Mode Switcher (< md) */}
        <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full">
          <button
            onClick={() => onModeChange("commercial")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              currentMode === "commercial"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
            <span className="truncate">Business Deals</span>
          </button>
          <button
            onClick={() => onModeChange("personal")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              currentMode === "personal"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            <Home className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
            <span className="truncate">Personal Homes</span>
          </button>
        </div>

        {/* Mobile Super Admin Controls (< md) */}
        {isSuperAdmin && (
          <div className="flex md:hidden items-center justify-between bg-emerald-50/70 border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs w-full gap-2">
            {onSwitchDataset && (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <FolderLock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  value={currentDatasetId || "ds_yousuf_portfolio"}
                  onChange={(e) => onSwitchDataset(e.target.value)}
                  className="bg-transparent text-emerald-900 text-xs font-semibold outline-none cursor-pointer w-full"
                >
                  <option value="ds_yousuf_portfolio">Mohammed Yousuf</option>
                  <option value="ds_demo_sandbox">Demo Sandbox</option>
                  <option value="all">[All Datasets]</option>
                </select>
              </div>
            )}

            {onOpenSuperAdminModal && (
              <button
                onClick={onOpenSuperAdminModal}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin</span>
              </button>
            )}
          </div>
        )}

        {/* Mobile Quick Actions Row (< md) */}
        <div className="flex md:hidden items-center gap-1.5 w-full overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => onOpenEntryModal("outflow")}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap flex-shrink-0"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Payment</span>
          </button>

          <button
            onClick={() => onOpenEntryModal("inflow")}
            className="btn-action-brand flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs whitespace-nowrap flex-shrink-0"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Receipt</span>
          </button>

          <button
            onClick={onOpenNewPropertyModal}
            className="btn-action-primary flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Property</span>
          </button>

          <button
            onClick={() => onOpenEntryModal("withdrawal")}
            className="btn-action-secondary flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs whitespace-nowrap flex-shrink-0"
          >
            <span>Withdraw</span>
          </button>

          {onOpenNewLoanModal && currentMode === "commercial" && (
            <button
              onClick={onOpenNewLoanModal}
              className="btn-action-secondary flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs whitespace-nowrap flex-shrink-0"
            >
              <span>+ Loan</span>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            className="btn-action-secondary flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs whitespace-nowrap flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={onOpenCategoryModal}
            className="p-2 rounded-xl bg-white text-slate-500 border border-slate-200 flex-shrink-0"
            title="Categories & Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
