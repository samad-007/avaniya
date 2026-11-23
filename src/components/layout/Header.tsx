"use client";

import React from "react";
import { AvaniyaLogo } from "@/components/ui/AvaniyaLogo";
import {
  Building2,
  Home,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Download,
  Palette,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  FolderLock,
  HandCoins,
  Wallet,
  ArrowRightLeft,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface HeaderProps {
  currentMode: "commercial" | "personal";
  onModeChange: (mode: "commercial" | "personal") => void;
  onOpenEntryModal: (
    type: "outflow" | "inflow" | "transfer" | "withdrawal" | "loan" | "shift_profit"
  ) => void;
  onOpenNewPropertyModal: () => void;
  onOpenNewLoanModal?: () => void;
  onOpenExportModal: () => void;
  onOpenCategoryModal: () => void;
  onOpenThemeSettingsModal?: () => void;
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
  onOpenThemeSettingsModal,
  user,
  onOpenAuthModal,
  onLogout,
  onOpenSuperAdminModal,
  currentDatasetId,
  onSwitchDataset,
}) => {
  const isSuperAdmin = user?.role === "super_admin";
  const { mode, toggleMode, palette } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-md-surface-lowest/90 dark:bg-md-surface-low/90 backdrop-blur-xl px-3 sm:px-5 py-2.5 sm:py-3 w-full max-w-[100vw] overflow-x-clip shadow-m3-1 transition-standard">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-2.5 sm:gap-3 min-w-0">
        {/* Row 1: Brand, M3 Connected Mode Switcher, Theme & User Controls */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full min-w-0">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 md:flex-initial">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
              <AvaniyaLogo className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm sm:text-lg font-extrabold text-md-on-surface tracking-tight flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="truncate">Avaniya</span>
                {currentDatasetId === "ds_demo_sandbox" ? (
                  <span className="hidden sm:inline-flex text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-md-warning-container text-md-on-warning-container whitespace-nowrap flex-shrink-0">
                    Demo
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-md-primary-container text-md-on-primary-container whitespace-nowrap flex-shrink-0">
                    Portfolio
                  </span>
                )}
              </div>
              <div className="text-xs text-md-on-surface-variant font-medium hidden sm:block truncate">
                Simple Property, Payment &amp; Profit Tracker
              </div>
            </div>
          </div>

          {/* Desktop M3 Expressive Connected Mode Switcher */}
          <div className="hidden md:flex items-center bg-md-surface-container p-1 rounded-full shrink-0 gap-1">
            <button
              onClick={() => onModeChange("commercial")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${ currentMode === "commercial" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high" }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Business Deals</span>
            </button>
            <button
              onClick={() => onModeChange("personal")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${ currentMode === "personal" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high" }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Personal Homes</span>
            </button>
          </div>

          {/* Top Right: Quick Light/Dark Toggle, Settings/Themes & User Profile */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Quick Light/Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleMode}
              className="p-2 rounded-full bg-md-surface-container text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high transition-all flex-shrink-0"
              title={
                mode === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
              aria-label="Toggle light or dark theme"
            >
              {mode === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            {/* Theme & Settings Button */}
            {onOpenThemeSettingsModal && (
              <button
                type="button"
                onClick={onOpenThemeSettingsModal}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full bg-md-secondary-container text-md-on-secondary-container hover:brightness-95 dark:hover:brightness-110 transition-all text-xs font-semibold flex-shrink-0"
                title={`Theme & Settings (${palette.name})`}
                aria-label="Appearance and theme settings"
              >
                <Palette className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden lg:inline">Themes</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <div
                  className="flex items-center gap-1.5 bg-md-surface-container px-2.5 sm:px-3 py-1.5 rounded-full text-xs text-md-on-surface max-w-[92px] sm:max-w-[200px] min-w-0"
                  title={`Signed in as ${user.name} (${user.email})`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${ isSuperAdmin ? "bg-md-warning" : "bg-md-primary" }`}
                  />
                  <span className="font-semibold text-xs truncate">
                    {user.name}
                  </span>
                  {isSuperAdmin && (
                    <span className="hidden sm:inline-flex text-[10px] font-bold bg-md-tertiary-container text-md-on-tertiary-container px-1.5 py-0.5 rounded-full flex-shrink-0">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-full bg-md-surface-container text-md-on-surface-variant hover:text-md-on-error-container hover:bg-md-error-container transition-all flex-shrink-0"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="m3-btn-filled flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs flex-shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Desktop M3 Expressive Action Toolbar */}
        <div className="hidden md:flex items-center justify-between gap-3 pt-1 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenEntryModal("outflow")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-md-error-container text-md-on-error-container hover:brightness-95 dark:hover:brightness-110 active:rounded-[14px] transition-all"
              title="Record money you paid for land, construction, or expenses"
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => onOpenEntryModal("inflow")}
              className="m3-btn-filled flex items-center gap-1.5 px-4 py-2 text-xs"
              title="Record money received from buyers, savings, or partners"
            >
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Receipt</span>
            </button>

            <button
              onClick={onOpenNewPropertyModal}
              className="m3-btn-primary-tonal flex items-center gap-1.5 px-4 py-2 text-xs"
              title="Add a new land deal or personal property"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Property</span>
            </button>

            {currentMode === "commercial" && (
              <button
                onClick={() => onOpenEntryModal("shift_profit")}
                className="m3-btn-tonal flex items-center gap-1.5 px-3.5 py-2 text-xs"
                title="Shift profits from Business (Bank/Cash) to Personal (Bank/Cash)"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Shift Profit</span>
              </button>
            )}

            <button
              onClick={() => onOpenEntryModal("withdrawal")}
              className="m3-btn-outlined flex items-center gap-1.5 px-3.5 py-2 text-xs"
              title="Record profit taken out or capital returned"
            >
              <Wallet className="w-3.5 h-3.5 text-md-tertiary" />
              <span>Withdraw</span>
            </button>

            {onOpenNewLoanModal && currentMode === "commercial" && (
              <button
                onClick={onOpenNewLoanModal}
                className="m3-btn-outlined flex items-center gap-1.5 px-3.5 py-2 text-xs"
                title="Track a bank loan or borrowed funds"
              >
                <HandCoins className="w-3.5 h-3.5 text-md-primary" />
                <span>Add Loan</span>
              </button>
            )}

            <button
              onClick={onOpenExportModal}
              className="m3-btn-outlined flex items-center gap-1.5 px-3.5 py-2 text-xs"
              title="Download Excel, PDF, or CSV report"
            >
              <Download className="w-3.5 h-3.5 text-md-secondary" />
              <span>Export</span>
            </button>
          </div>

          {/* Right Side of Toolbar: Admin Controls or Status */}
          {isSuperAdmin ? (
            <div className="flex items-center gap-2">
              {onSwitchDataset && (
                <div className="flex items-center gap-1.5 bg-md-primary-container/75 px-3 py-1.5 rounded-full text-xs">
                  <FolderLock className="w-3.5 h-3.5 text-md-on-primary-container shrink-0" />
                  <select
                    value={currentDatasetId || "ds_yousuf_portfolio"}
                    onChange={(e) => onSwitchDataset(e.target.value)}
                    className="bg-transparent text-md-on-primary-container font-semibold text-xs outline-none cursor-pointer"
                    title="Switch Active Portfolio"
                  >
                    <option
                      value="ds_yousuf_portfolio"
                      className="bg-md-surface-lowest text-md-on-surface"
                    >
                      Mohammed Yousuf Portfolio
                    </option>
                    <option
                      value="ds_demo_sandbox"
                      className="bg-md-surface-lowest text-md-on-surface"
                    >
                      Sandbox Demo Dataset
                    </option>
                    <option
                      value="all"
                      className="bg-md-surface-lowest text-md-on-surface"
                    >
                      [All Datasets Consolidated]
                    </option>
                  </select>
                </div>
              )}

              {onOpenSuperAdminModal && (
                <button
                  onClick={onOpenSuperAdminModal}
                  className="m3-btn-tonal px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                  title="Open Admin Console"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs text-md-on-surface-variant font-medium">
              <span className="w-2 h-2 rounded-full bg-md-primary" />
              <span>
                {currentMode === "commercial"
                  ? "Commercial Land Portfolio"
                  : "Personal Property Tracker"}
              </span>
            </div>
          )}
        </div>

        {/* Mobile Mode Switcher (< md) */}
        <div className="flex md:hidden items-center bg-md-surface-container p-1 rounded-full w-full gap-1">
          <button
            onClick={() => onModeChange("commercial")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all ${ currentMode === "commercial" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant" }`}
          >
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Business Deals</span>
          </button>
          <button
            onClick={() => onModeChange("personal")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all ${ currentMode === "personal" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant" }`}
          >
            <Home className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Personal Homes</span>
          </button>
        </div>

        {/* Mobile Super Admin Controls (< md) */}
        {isSuperAdmin && (
          <div className="flex md:hidden items-center justify-between bg-md-primary-container/75 rounded-full px-3 py-1.5 text-xs w-full gap-2">
            {onSwitchDataset && (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <FolderLock className="w-3.5 h-3.5 text-md-on-primary-container shrink-0" />
                <select
                  value={currentDatasetId || "ds_yousuf_portfolio"}
                  onChange={(e) => onSwitchDataset(e.target.value)}
                  className="bg-transparent text-md-on-primary-container text-xs font-semibold outline-none cursor-pointer w-full"
                >
                  <option
                    value="ds_yousuf_portfolio"
                    className="bg-md-surface-lowest text-md-on-surface"
                  >
                    Mohammed Yousuf
                  </option>
                  <option
                    value="ds_demo_sandbox"
                    className="bg-md-surface-lowest text-md-on-surface"
                  >
                    Demo Sandbox
                  </option>
                  <option
                    value="all"
                    className="bg-md-surface-lowest text-md-on-surface"
                  >
                    [All Datasets]
                  </option>
                </select>
              </div>
            )}

            {onOpenSuperAdminModal && (
              <button
                onClick={onOpenSuperAdminModal}
                className="m3-btn-filled px-3 py-1 text-xs flex items-center gap-1 shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </div>
        )}

        {/* Mobile Quick Actions Row (< md) */}
        <div className="flex md:hidden items-center gap-1.5 w-full overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => onOpenEntryModal("outflow")}
            className="flex items-center justify-center gap-1 py-2 px-3.5 rounded-full text-xs font-semibold bg-md-error-container text-md-on-error-container whitespace-nowrap flex-shrink-0"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Payment</span>
          </button>

          <button
            onClick={() => onOpenEntryModal("inflow")}
            className="m3-btn-filled flex items-center justify-center gap-1 py-2 px-3.5 text-xs whitespace-nowrap flex-shrink-0"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Receipt</span>
          </button>

          <button
            onClick={onOpenNewPropertyModal}
            className="m3-btn-primary-tonal flex items-center justify-center gap-1 py-2 px-3.5 text-xs whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Property</span>
          </button>

          {currentMode === "commercial" && (
            <button
              onClick={() => onOpenEntryModal("shift_profit")}
              className="m3-btn-tonal flex items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap flex-shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Shift Profit</span>
            </button>
          )}

          <button
            onClick={() => onOpenEntryModal("withdrawal")}
            className="m3-btn-outlined flex items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap flex-shrink-0"
          >
            <span>Withdraw</span>
          </button>

          {onOpenNewLoanModal && currentMode === "commercial" && (
            <button
              onClick={onOpenNewLoanModal}
              className="m3-btn-outlined flex items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap flex-shrink-0"
            >
              <span>+ Loan</span>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            className="m3-btn-outlined flex items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
