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
  ArrowRight,
  PieChart,
  Receipt,
  Wallet,
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

const formatStatusLabel = (status: string) => {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "registered":
      return "Registered";
    case "sold":
      return "Sold";
    case "closed":
      return "Completed";
    default:
      return "Active";
  }
};

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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by property, category, or notes..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
          {(
            [
              { id: "all", label: "All Time" },
              { id: "this_month", label: "This Month" },
              { id: "last_30_days", label: "30 Days" },
              { id: "fy_24_25", label: "FY 24-25" },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setDateFilter(chip.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                dateFilter === chip.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
          {(
            [
              { id: "all", label: "All" },
              { id: "Bank", label: "Bank" },
              { id: "Cash", label: "Cash" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModeFilter(m.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                modeFilter === m.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
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
    <div className="flex flex-col gap-5">
      {/* Sub Navigation Pills */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto pb-0.5 gap-3 scrollbar-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab("properties")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSubTab === "properties"
                ? "border-emerald-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>My Properties</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {metrics.properties.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab("outflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSubTab === "outflows"
                ? "border-emerald-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Payments Made</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {formatINRCompact(metrics.outflowsTotal)}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab("inflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSubTab === "inflows"
                ? "border-emerald-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Funds Added</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono">
              {formatINRCompact(metrics.inflowsTotal)}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSubTab === "categories"
                ? "border-emerald-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Spending Breakdown</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 pb-1.5">
          {activeSubTab === "outflows" && (
            <button
              onClick={() => onOpenEntryModal("outflow")}
              className="btn-action-primary px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Payment</span>
            </button>
          )}

          {activeSubTab === "inflows" && (
            <button
              onClick={() => onOpenEntryModal("inflow")}
              className="btn-action-brand px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Funds</span>
            </button>
          )}

          <button
            onClick={onOpenNewPropertyModal}
            className="btn-action-secondary px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* SubTab 1: My Properties */}
      {activeSubTab === "properties" && (
        <>
          {metrics.properties.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center flex flex-col items-center gap-3 shadow-soft">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No personal properties yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                Add your home, apartment, or personal plot to track builder milestones, installments, and payments in one place.
              </p>
              <button
                onClick={onOpenNewPropertyModal}
                className="btn-action-brand px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 mt-1"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Your First Property</span>
              </button>
            </div>
          ) : (
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
                  p.milestones?.filter((m) => m.status === "completed")
                    .length || 0;
                const totalMilestones = p.milestones?.length || 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProperty(pData)}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-emerald-300 shadow-card hover:shadow-card-hover transition-standard group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {p.name}
                          </span>
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {p.propertyCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                          {p.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {p.location}
                            </span>
                          )}
                          {p.acquisitionDate && (
                            <span>Booked {formatDateIN(p.acquisitionDate)}</span>
                          )}
                          {p.agreementDueDate && (
                            <span className="flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Due {formatDateIN(p.agreementDueDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openWhatsAppShare(
                              formatPersonalPropertyWhatsApp(pData)
                            );
                          }}
                          className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Share summary on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        {p.attachmentUrl && (
                          <a
                            href={p.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                            title="Open documents"
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
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit property details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-2.5 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/70">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          Total Cost
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
                          {formatINR(p.agreedPurchasePrice)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-emerald-700">
                          Paid So Far
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-emerald-700 mt-0.5">
                          {formatINR(pData.totalInvested)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-amber-700">
                          Balance Left
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-amber-700 mt-0.5">
                          {formatINR(pData.pendingCommitment)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          Milestones Done
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
                          {completedMilestones} / {totalMilestones}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span>Payment Progress</span>
                        <span className="font-mono text-slate-900 font-bold">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progress >= 100 ? "bg-emerald-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {formatStatusLabel(p.status)}
                      </span>
                      <span className="text-slate-400 group-hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors">
                        View Ledger <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* SubTab 2: Payments Made */}
      {activeSubTab === "outflows" && (
        <div className="flex flex-col gap-3">
          {renderFilterBar()}
          <div className="border border-slate-200/90 rounded-2xl overflow-x-auto bg-white shadow-card">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Paid Via</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOutflows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-400 text-sm font-medium"
                    >
                      No payments found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredOutflows.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDateIN(t.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {t.propertyCode || "-"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {t.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            t.mode === "Cash"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {t.mode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatINR(t.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <span>{t.remarks || "-"}</span>
                          {t.attachmentUrl && (
                            <a
                              href={t.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                              title="Open receipt proof"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {onEditTransaction && (
                          <button
                            onClick={() => onEditTransaction(t)}
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center justify-center transition-colors"
                            title="Edit entry"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900 text-sm">
                  <td colSpan={4} className="py-3.5 px-4">
                    Total Payments (Filtered)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                    {formatINR(
                      filteredOutflows.reduce((sum, x) => sum + x.amount, 0)
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Funds Added & Withdrawn */}
      {activeSubTab === "inflows" && (
        <div className="flex flex-col gap-3">
          {renderFilterBar()}
          <div className="border border-slate-200/90 rounded-2xl overflow-x-auto bg-white shadow-card">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Source / Purpose</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInflowsAndWithdrawals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-400 text-sm font-medium"
                    >
                      No funds added or withdrawn for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredInflowsAndWithdrawals.map((t) => {
                    const isInflow = t.transactionType === "capital_inflow";
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {formatDateIN(t.date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              isInflow
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {isInflow ? "Funds Added" : "Withdrawn"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {t.recipientOrSource || t.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                            {t.mode}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-bold ${
                            isInflow ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {isInflow ? "+" : "-"}
                          {formatINR(t.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>{t.remarks || "-"}</span>
                            {t.attachmentUrl && (
                              <a
                                href={t.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                title="Open receipt proof"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {onEditTransaction && (
                            <button
                              onClick={() => onEditTransaction(t)}
                              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center justify-center transition-colors"
                              title="Edit entry"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900 text-sm">
                  <td colSpan={4} className="py-3.5 px-4">
                    Net Personal Funds (Filtered)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                    {formatINR(
                      filteredInflowsAndWithdrawals.reduce((sum, x) => {
                        if (x.transactionType === "capital_inflow")
                          return sum + x.amount;
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

      {/* SubTab 4: Spending Breakdown */}
      {activeSubTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200/90 rounded-2xl p-6 bg-white shadow-card flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900">
              Where Your Money Went
            </h3>
            {metrics.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400">
                Record payments to see a category-by-category breakdown here.
              </p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {metrics.categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">
                        {cat.category}
                      </span>
                      <span className="font-mono text-slate-900 font-bold">
                        {formatINR(cat.amount)}{" "}
                        <span className="text-slate-400 font-normal">
                          ({cat.percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-slate-200/90 rounded-2xl p-6 bg-white shadow-card flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Available Balance Split
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your remaining personal funds across bank and cash.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3.5 my-auto">
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80">
                <div className="text-xs font-semibold text-emerald-700">
                  Bank Balance
                </div>
                <div className="text-xl md:text-2xl font-bold font-mono text-emerald-800 mt-1">
                  {formatINR(metrics.currentBankBalance)}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-semibold text-slate-600">
                  Cash in Hand
                </div>
                <div className="text-xl md:text-2xl font-bold font-mono text-slate-900 mt-1">
                  {formatINR(metrics.currentCashBalance)}
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Balances update automatically whenever you record a payment or add funds.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
