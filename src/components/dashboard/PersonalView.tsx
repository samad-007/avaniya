"use client";

import React, { useState, useMemo } from "react";
import { formatINR, formatINRCompact, formatDateIN } from "@/lib/formatters";
import { PersonalDashboardMetrics } from "@/lib/formulaEngine";
import { SeedProperty, SeedTransaction } from "@/lib/seedData";
import {
  formatPersonalPropertyWhatsApp,
  openWhatsAppShare,
} from "@/lib/whatsappSummary";
import {
  Home,
  Plus,
  MapPin,
  Pencil,
  Share2,
  Link2,
  Search,
  Clock,
} from "lucide-react";

interface PersonalViewProps {
  metrics: PersonalDashboardMetrics;
  transactions: SeedTransaction[];
  onSelectProperty: (personalPropertyData: {
    property: SeedProperty;
    totalInvested: number;
    pendingCommitment: number;
    transactions: SeedTransaction[];
  }) => void;
  onOpenNewPropertyModal: () => void;
  onOpenEntryModal: (
    type: "outflow" | "inflow" | "transfer" | "withdrawal",
    propertyCode?: string
  ) => void;
  onEditProperty?: (property: SeedProperty) => void;
  onEditTransaction?: (transaction: SeedTransaction) => void;
}

export const PersonalView: React.FC<PersonalViewProps> = ({
  metrics,
  transactions,
  onSelectProperty,
  onOpenNewPropertyModal,
  onOpenEntryModal,
  onEditProperty,
  onEditTransaction,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "properties" | "outflows" | "inflows" | "categories"
  >("properties");

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<
    "all" | "this_month" | "last_30_days" | "fy_24_25"
  >("all");
  const [modeFilter, setModeFilter] = useState<"all" | "Bank" | "Cash">("all");

  const personalOutflows = useMemo(
    () =>
      transactions.filter(
        (t) => t.scope === "personal" && t.transactionType === "outflow"
      ),
    [transactions]
  );

  const personalInflowsAndWithdrawals = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.scope === "personal" &&
          (t.transactionType === "capital_inflow" ||
            t.transactionType === "profit_withdrawal" ||
            t.transactionType === "capital_withdrawal")
      ),
    [transactions]
  );

  const filterTransactions = (txs: SeedTransaction[]) => {
    return txs.filter((t) => {
      if (modeFilter !== "all" && t.mode !== modeFilter) return false;
      if (dateFilter !== "all" && t.date) {
        const tDate = new Date(t.date);
        const now = new Date();
        if (dateFilter === "this_month") {
          if (
            tDate.getMonth() !== now.getMonth() ||
            tDate.getFullYear() !== now.getFullYear()
          )
            return false;
        } else if (dateFilter === "last_30_days") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (tDate < thirtyDaysAgo) return false;
        } else if (dateFilter === "fy_24_25") {
          const fyStart = new Date(2024, 3, 1);
          const fyEnd = new Date(2025, 2, 31, 23, 59, 59);
          if (tDate < fyStart || tDate > fyEnd) return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (t.transCode && t.transCode.toLowerCase().includes(q)) ||
          (t.propertyCode && t.propertyCode.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.recipientOrSource &&
            t.recipientOrSource.toLowerCase().includes(q)) ||
          (t.remarks && t.remarks.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  };

  const filteredOutflows = useMemo(
    () => filterTransactions(personalOutflows),
    [personalOutflows, searchQuery, dateFilter, modeFilter]
  );

  const filteredInflowsAndWithdrawals = useMemo(
    () => filterTransactions(personalInflowsAndWithdrawals),
    [personalInflowsAndWithdrawals, searchQuery, dateFilter, modeFilter]
  );

  const renderFilterBar = () => (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#0e0e0e] p-2.5 rounded-xl border border-[#262626]">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter personal entries by ID, property, category, remarks..."
          className="w-full bg-[#161616] border border-[#282828] rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-white outline-none focus:border-[#555555]"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-[#262626]">
          {(
            [
              { id: "all", label: "All" },
              { id: "this_month", label: "This Month" },
              { id: "last_30_days", label: "30 Days" },
              { id: "fy_24_25", label: "FY 24-25" },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setDateFilter(chip.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                dateFilter === chip.id
                  ? "bg-[#282828] text-white font-bold"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-[#262626]">
          {(
            [
              { id: "all", label: "All Modes" },
              { id: "Bank", label: "Bank" },
              { id: "Cash", label: "Cash" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModeFilter(m.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                modeFilter === m.id
                  ? "bg-[#282828] text-white font-bold"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Sub Navigation */}
      <div className="flex items-center justify-between border-b border-[#262626] overflow-x-auto pb-0.5 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab("properties")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeSubTab === "properties"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            1. My Properties &amp; Assets ({metrics.properties.length})
          </button>
          <button
            onClick={() => setActiveSubTab("outflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeSubTab === "outflows"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            2. Milestone Outflows ({formatINRCompact(metrics.outflowsTotal)})
          </button>
          <button
            onClick={() => setActiveSubTab("inflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeSubTab === "inflows"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            3. Personal Inflow Sources ({formatINRCompact(metrics.inflowsTotal)})
          </button>
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeSubTab === "categories"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            4. Category Spending Breakdown
          </button>
        </div>

        {/* Actions Button Group */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {activeSubTab === "outflows" && (
            <button
              onClick={() => onOpenEntryModal("outflow")}
              className="btn-action-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Outflow</span>
            </button>
          )}

          {activeSubTab === "inflows" && (
            <button
              onClick={() => onOpenEntryModal("inflow")}
              className="btn-action-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-[#22C55E]" />
              <span>Log Inflow Source</span>
            </button>
          )}

          <button
            onClick={onOpenNewPropertyModal}
            className="btn-action-primary px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Property</span>
          </button>
        </div>
      </div>

      {/* SubTab 1: My Properties & Assets */}
      {activeSubTab === "properties" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.properties.map((pData) => {
            const p = pData.property;
            const progress =
              p.agreedPurchasePrice > 0
                ? Math.min(
                    100,
                    Math.round(
                      (pData.totalInvested / p.agreedPurchasePrice) * 100
                    )
                  )
                : 0;

            const completedMilestones =
              p.milestones?.filter((m) => m.status === "completed").length || 0;
            const totalMilestones = p.milestones?.length || 0;

            return (
              <div
                key={p.id}
                onClick={() => onSelectProperty(pData)}
                className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-[#444444] hover:bg-[#0e0e0e] transition-all duration-150 group shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-white group-hover:text-[#22C55E] transition-colors">
                        {p.name}
                      </span>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626]">
                        {p.propertyCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mt-1 flex-wrap">
                      {p.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#71717A]" />
                          {p.location}
                        </span>
                      )}
                      {p.acquisitionDate && (
                        <span>Acquired {formatDateIN(p.acquisitionDate)}</span>
                      )}
                      {p.agreementDueDate && (
                        <span className="flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-[#181818] text-[#A1A1AA] border border-[#2a2a2a]">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Due: {formatDateIN(p.agreementDueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsAppShare(formatPersonalPropertyWhatsApp(pData));
                      }}
                      className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/60 transition-all duration-150"
                      title="Share Property Snapshot on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {p.attachmentUrl && (
                      <a
                        href={p.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-400 hover:bg-blue-900/60 transition-all duration-150"
                        title="Open Cloud Proof Documents"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {onEditProperty && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProperty(p);
                        }}
                        className="btn-action-primary p-2 rounded-lg"
                        title="Edit Property Data Points"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#22C55E]" />
                      </button>
                    )}
                    <span className="text-xs px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-800/40">
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2.5 bg-[#050505] p-3 rounded-lg border border-[#1a1a1a]">
                  <div>
                    <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                      Agreed Asset Price
                    </div>
                    <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                      {formatINR(p.agreedPurchasePrice)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
                      Invested So Far
                    </div>
                    <div className="text-sm sm:text-base font-bold font-mono text-[#22C55E] mt-0.5">
                      {formatINR(pData.totalInvested)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
                      Pending Commitment
                    </div>
                    <div className="text-sm sm:text-base font-bold font-mono text-[#F59E0B] mt-0.5">
                      {formatINR(pData.pendingCommitment)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#D4D4D8]">
                      Stages Done
                    </div>
                    <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                      {completedMilestones} / {totalMilestones}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-[#A1A1AA] font-medium">
                    <span>Payment Progress</span>
                    <span className="font-mono text-white font-bold">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SubTab 2: Outflows */}
      {activeSubTab === "outflows" && (
        <div className="flex flex-col gap-3">
          {renderFilterBar()}
          <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Property</th>
                  <th className="py-3 px-3.5">Expense Category</th>
                  <th className="py-3 px-3.5">Mode</th>
                  <th className="py-3 px-3.5 text-right">Amount (INR)</th>
                  <th className="py-3 px-3.5">Remarks</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {filteredOutflows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-[#71717A] text-sm font-medium"
                    >
                      No personal outflows match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredOutflows.map((t) => (
                    <tr key={t.id} className="hover:bg-[#141414] transition-colors">
                      <td className="py-3 px-3.5 text-[#D4D4D8]">
                        {formatDateIN(t.date)}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-white">
                        {t.propertyCode || "-"}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-white">
                        {t.category}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border bg-blue-950/20 text-blue-400 border-blue-800/30">
                          {t.mode}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                        {formatINR(t.amount)}
                      </td>
                      <td className="py-3 px-3.5 text-[#A1A1AA]">
                        <div className="flex items-center gap-2">
                          <span>{t.remarks || "-"}</span>
                          {t.attachmentUrl && (
                            <a
                              href={t.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                              title="Open Attachment Proof"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        {onEditTransaction && (
                          <button
                            onClick={() => onEditTransaction(t)}
                            className="btn-action-primary p-1.5 rounded-md inline-flex items-center justify-center"
                            title="Edit Transaction"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#22C55E]" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#0e0e0e] border-t-2 border-[#262626] font-bold text-white text-sm">
                  <td colSpan={4} className="py-3.5 px-3.5">
                    Total Personal Outflows (Filtered)
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono text-[#22C55E]">
                    {formatINR(filteredOutflows.reduce((sum, x) => sum + x.amount, 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Inflows & Withdrawals */}
      {activeSubTab === "inflows" && (
        <div className="flex flex-col gap-3">
          {renderFilterBar()}
          <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Type</th>
                  <th className="py-3 px-3.5">Source / Purpose</th>
                  <th className="py-3 px-3.5">Payment Mode</th>
                  <th className="py-3 px-3.5 text-right">Amount (INR)</th>
                  <th className="py-3 px-3.5">Remarks</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {filteredInflowsAndWithdrawals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-[#71717A] text-sm font-medium"
                    >
                      No personal inflows or withdrawals match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredInflowsAndWithdrawals.map((t) => {
                    const isInflow = t.transactionType === "capital_inflow";
                    return (
                      <tr key={t.id} className="hover:bg-[#141414] transition-colors">
                        <td className="py-3 px-3.5 text-[#D4D4D8]">
                          {formatDateIN(t.date)}
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                              isInflow
                                ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/30"
                                : "bg-rose-950/30 text-rose-400 border-rose-800/30"
                            }`}
                          >
                            {isInflow ? "Inflow" : "Withdrawal"}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-white">
                          {t.recipientOrSource || t.category}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border bg-blue-950/20 text-blue-400 border-blue-800/30">
                            {t.mode}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-3.5 text-right font-mono font-bold ${
                            isInflow ? "text-[#22C55E]" : "text-rose-400"
                          }`}
                        >
                          {isInflow ? "+" : "-"}
                          {formatINR(t.amount)}
                        </td>
                        <td className="py-3 px-3.5 text-[#A1A1AA]">
                          <div className="flex items-center gap-2">
                            <span>{t.remarks || "-"}</span>
                            {t.attachmentUrl && (
                              <a
                                href={t.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                                title="Open Attachment Proof"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          {onEditTransaction && (
                            <button
                              onClick={() => onEditTransaction(t)}
                              className="btn-action-primary p-1.5 rounded-md inline-flex items-center justify-center"
                              title="Edit Transaction"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#22C55E]" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#0e0e0e] border-t-2 border-[#262626] font-bold text-white text-sm">
                  <td colSpan={4} className="py-3.5 px-3.5">
                    Net Personal Cash Flow (Filtered)
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono text-[#22C55E]">
                    {formatINR(
                      filteredInflowsAndWithdrawals.reduce((sum, x) => {
                        if (x.transactionType === "capital_inflow") return sum + x.amount;
                        return sum - x.amount;
                      }, 0)
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 4: Category Spending Breakdown */}
      {activeSubTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-[#262626] rounded-xl p-5 bg-[#0a0a0a] flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Expense Distribution by Category
            </h3>
            <div className="flex flex-col gap-3">
              {metrics.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-medium">{cat.category}</span>
                    <span className="font-mono text-[#22C55E] font-bold">
                      {formatINR(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#262626] rounded-xl p-5 bg-[#0a0a0a] flex flex-col justify-between gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Personal Cash vs Bank Reconciliation
            </h3>
            <div className="grid grid-cols-2 gap-3.5 my-auto">
              <div className="bg-[#050505] p-4 rounded-lg border border-[#1a1a1a]">
                <div className="text-xs font-semibold uppercase text-[#A1A1AA]">
                  Bank Balance
                </div>
                <div className="text-xl md:text-2xl font-bold font-mono text-[#22C55E] mt-1">
                  {formatINR(metrics.currentBankBalance)}
                </div>
              </div>
              <div className="bg-[#050505] p-4 rounded-lg border border-[#1a1a1a]">
                <div className="text-xs font-semibold uppercase text-[#A1A1AA]">
                  Cash in Hand
                </div>
                <div className="text-xl md:text-2xl font-bold font-mono text-white mt-1">
                  {formatINR(metrics.currentCashBalance)}
                </div>
              </div>
            </div>
            <div className="text-xs text-[#A1A1AA]">
              All calculations match the formula logic in New Apartment Expense
              Tracker.xlsx
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
