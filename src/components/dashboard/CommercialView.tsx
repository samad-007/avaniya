"use client";

import React, { useState, useMemo } from "react";
import { formatINR, formatINRCompact, formatDateIN } from "@/lib/formatters";
import {
  CommercialDashboardMetrics,
  PropertyFinancialMetrics,
} from "@/lib/formulaEngine";
import { SeedProperty, SeedTransaction, SeedLoan } from "@/lib/seedData";
import {
  formatPropertyWhatsApp,
  formatLoanWhatsApp,
  formatPortfolioWhatsApp,
  openWhatsAppShare,
} from "@/lib/whatsappSummary";
import {
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Clock,
  Search,
  Pencil,
  Plus,
  HandCoins,
  Share2,
  AlertTriangle,
  Link2,
  ArrowRight,
  Building2,
  Receipt,
  ArrowDownRight,
  Wallet,
  ArrowLeftRight,
} from "lucide-react";

interface CommercialViewProps {
  metrics: CommercialDashboardMetrics;
  transactions: SeedTransaction[];
  loans?: SeedLoan[];
  onSelectProperty: (propertyMetric: PropertyFinancialMetrics) => void;
  onOpenNewDealModal: () => void;
  onOpenNewLoanModal?: () => void;
  onOpenEntryModal?: (
    type: "outflow" | "inflow" | "transfer" | "withdrawal" | "loan",
    propertyCode?: string,
    loanCode?: string
  ) => void;
  onEditProperty?: (property: SeedProperty) => void;
  onEditLoan?: (loan: SeedLoan) => void;
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
      return "Closed";
    default:
      return "Open";
  }
};

export const CommercialView: React.FC<CommercialViewProps> = ({
  metrics,
  transactions,
  loans = [],
  onSelectProperty,
  onOpenNewDealModal,
  onOpenNewLoanModal,
  onOpenEntryModal,
  onEditProperty,
  onEditLoan,
  onEditTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<
    "deals" | "outflows" | "inflows" | "capital" | "loans" | "transfers" | "accounts"
  >("deals");
  const [layoutVariant, setLayoutVariant] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<
    "all" | "this_month" | "last_30_days" | "fy_24_25"
  >("all");
  const [modeFilter, setModeFilter] = useState<"all" | "Bank" | "Cash">("all");

  const filteredMetrics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return metrics.propertyMetrics;
    return metrics.propertyMetrics.filter(
      (pm) =>
        pm.property.name.toLowerCase().includes(q) ||
        pm.property.propertyCode.toLowerCase().includes(q) ||
        (pm.property.location &&
          pm.property.location.toLowerCase().includes(q))
    );
  }, [metrics.propertyMetrics, searchQuery]);

  const outflows = useMemo(
    () =>
      transactions.filter(
        (t) => t.scope === "commercial" && t.transactionType === "outflow"
      ),
    [transactions]
  );

  const dealInflows = useMemo(
    () =>
      transactions.filter(
        (t) => t.scope === "commercial" && t.transactionType === "deal_inflow"
      ),
    [transactions]
  );

  const capitalAndWithdrawals = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.scope === "commercial" &&
          (t.transactionType === "capital_inflow" ||
            t.transactionType === "capital_withdrawal" ||
            t.transactionType === "profit_withdrawal")
      ),
    [transactions]
  );

  const transfers = useMemo(
    () =>
      transactions.filter(
        (t) => t.scope === "commercial" && t.transactionType === "transfer"
      ),
    [transactions]
  );

  const loanTransactions = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.scope === "commercial" &&
          (t.transactionType === "loan_inflow" ||
            t.transactionType === "loan_repayment" ||
            t.transactionType === "loan_interest" ||
            t.transactionType === "loan_profit_share")
      ),
    [transactions]
  );

  const filterTransactions = useMemo(() => {
    return (txList: SeedTransaction[]) => {
      return txList.filter((t) => {
        if (modeFilter !== "all" && t.mode !== modeFilter) return false;

        if (dateFilter !== "all") {
          const txDate = new Date(t.date);
          const now = new Date();
          if (dateFilter === "this_month") {
            if (
              txDate.getFullYear() !== now.getFullYear() ||
              txDate.getMonth() !== now.getMonth()
            ) {
              return false;
            }
          } else if (dateFilter === "last_30_days") {
            const diffDays = (now.getTime() - txDate.getTime()) / 86400000;
            if (diffDays < 0 || diffDays > 30) return false;
          } else if (dateFilter === "fy_24_25") {
            const start = new Date("2024-04-01");
            const end = new Date("2025-03-31T23:59:59");
            if (txDate < start || txDate > end) return false;
          }
        }

        if (ledgerSearchQuery.trim()) {
          const q = ledgerSearchQuery.toLowerCase().trim();
          const matchesCode = t.transCode?.toLowerCase().includes(q);
          const matchesProp = t.propertyCode?.toLowerCase().includes(q);
          const matchesCat = t.category?.toLowerCase().includes(q);
          const matchesRecipient = t.recipientOrSource?.toLowerCase().includes(q);
          const matchesRemarks = t.remarks?.toLowerCase().includes(q);
          const matchesPlot = t.subPlotNumber?.toLowerCase().includes(q);
          if (
            !matchesCode &&
            !matchesProp &&
            !matchesCat &&
            !matchesRecipient &&
            !matchesRemarks &&
            !matchesPlot
          ) {
            return false;
          }
        }

        return true;
      });
    };
  }, [modeFilter, dateFilter, ledgerSearchQuery]);

  const filteredOutflows = useMemo(
    () => filterTransactions(outflows),
    [filterTransactions, outflows]
  );
  const filteredDealInflows = useMemo(
    () => filterTransactions(dealInflows),
    [filterTransactions, dealInflows]
  );
  const filteredCapitalAndWithdrawals = useMemo(
    () => filterTransactions(capitalAndWithdrawals),
    [filterTransactions, capitalAndWithdrawals]
  );
  const filteredTransfers = useMemo(
    () => filterTransactions(transfers),
    [filterTransactions, transfers]
  );
  const filteredLoanTransactions = useMemo(
    () => filterTransactions(loanTransactions),
    [filterTransactions, loanTransactions]
  );

  const renderLedgerFilterBar = () => (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={ledgerSearchQuery}
          onChange={(e) => setLedgerSearchQuery(e.target.value)}
          placeholder="Search by property, category, person, or notes..."
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
      {/* Upcoming Payment Deadlines Banner */}
      {metrics.deadlineAlerts && metrics.deadlineAlerts.length > 0 && (
        <div className="flex flex-col gap-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Upcoming Payment Deadlines ({metrics.deadlineAlerts.length})
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {metrics.overdueDeadlinesCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-semibold font-mono">
                  {metrics.overdueDeadlinesCount} Overdue
                </span>
              )}
              {metrics.upcomingDeadlinesCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-semibold font-mono">
                  {metrics.upcomingDeadlinesCount} Due Soon
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {metrics.deadlineAlerts.map((alert, idx) => {
              const matchedPropMetric = metrics.propertyMetrics.find(
                (p) => p.property.propertyCode === alert.propertyCode
              );
              return (
                <div
                  key={idx}
                  onClick={() =>
                    matchedPropMetric && onSelectProperty(matchedPropMetric)
                  }
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 cursor-pointer transition-all bg-white shadow-soft ${
                    alert.status === "overdue"
                      ? "border-rose-200 hover:border-rose-400"
                      : alert.status === "urgent"
                      ? "border-amber-200 hover:border-amber-400"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 truncate">
                      {alert.propertyName}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        alert.status === "overdue"
                          ? "bg-rose-100 text-rose-700"
                          : alert.status === "urgent"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {alert.daysLeft < 0
                        ? `${Math.abs(alert.daysLeft)}d Overdue`
                        : alert.daysLeft === 0
                        ? "Due Today"
                        : `${alert.daysLeft}d Left`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Due {formatDateIN(alert.dueDate)}</span>
                    <span className="font-mono font-bold text-slate-900">
                      Balance: {formatINRCompact(matchedPropMetric?.pendingOutflow || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clean Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto pb-0.5 gap-3 scrollbar-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("deals")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "deals"
                ? "border-emerald-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Properties</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {metrics.propertyMetrics.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("outflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "outflows"
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
            onClick={() => setActiveTab("inflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "inflows"
                ? "border-emerald-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Buyer Receipts</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono">
              {formatINRCompact(metrics.dealInflowsTotal)}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("capital")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "capital"
                ? "border-emerald-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Capital &amp; Drawings</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {formatINRCompact(metrics.netCapitalInjected)}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("loans")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "loans"
                ? "border-emerald-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Loans</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {loans.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("transfers")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "transfers"
                ? "border-emerald-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Bank ↔ Cash</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 pb-1.5">
          <button
            type="button"
            onClick={() =>
              openWhatsAppShare(formatPortfolioWhatsApp(metrics, "commercial"))
            }
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Share portfolio summary on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {activeTab === "outflows" && onOpenEntryModal && (
            <button
              onClick={() => onOpenEntryModal("outflow")}
              className="btn-action-primary px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Payment</span>
            </button>
          )}

          {activeTab === "inflows" && onOpenEntryModal && (
            <button
              onClick={() => onOpenEntryModal("inflow")}
              className="btn-action-brand px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Receipt</span>
            </button>
          )}

          {activeTab === "capital" && onOpenEntryModal && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenEntryModal("inflow")}
                className="btn-action-brand px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Capital</span>
              </button>
              <button
                onClick={() => onOpenEntryModal("withdrawal")}
                className="btn-action-secondary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 whitespace-nowrap"
              >
                <span>Withdraw</span>
              </button>
            </div>
          )}

          {activeTab === "loans" && (
            <div className="flex items-center gap-1.5">
              {onOpenEntryModal && (
                <button
                  onClick={() => onOpenEntryModal("loan")}
                  className="btn-action-brand px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Record Loan Payment</span>
                </button>
              )}
              {onOpenNewLoanModal && (
                <button
                  onClick={onOpenNewLoanModal}
                  className="btn-action-secondary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Loan</span>
                </button>
              )}
            </div>
          )}

          {activeTab === "transfers" && onOpenEntryModal && (
            <button
              onClick={() => onOpenEntryModal("transfer")}
              className="btn-action-primary px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Transfer</span>
            </button>
          )}

          {activeTab === "deals" && (
            <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setLayoutVariant("cards")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  layoutVariant === "cards"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutVariant("table")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  layoutVariant === "table"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: Properties / Land Deals */}
      {activeTab === "deals" && (
        <div className="flex flex-col gap-4">
          {/* Search & Add Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties by name or area..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-soft transition-all"
              />
            </div>
            <button
              onClick={onOpenNewDealModal}
              className="btn-action-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Property</span>
            </button>
          </div>

          {filteredMetrics.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center flex flex-col items-center gap-3 shadow-soft">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {searchQuery
                  ? "No properties match your search"
                  : "No properties added yet"}
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                {searchQuery
                  ? "Try clearing your search filter to see all properties."
                  : "Add your first land deal or property to start tracking payments, costs, and profits."}
              </p>
              {!searchQuery && (
                <button
                  onClick={onOpenNewDealModal}
                  className="btn-action-brand px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 mt-1"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Your First Property</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Visual Cards */}
              {layoutVariant === "cards" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMetrics.map((pm) => {
                    const fundedPct =
                      pm.property.agreedPurchasePrice > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (pm.purchasePaidTotal /
                                pm.property.agreedPurchasePrice) *
                                100
                            )
                          )
                        : 0;

                    const isExpensesHigherThanBuy =
                      pm.propertyExpenses > pm.property.agreedPurchasePrice;

                    return (
                      <div
                        key={pm.property.id}
                        onClick={() => onSelectProperty(pm)}
                        className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-emerald-300 shadow-card hover:shadow-card-hover transition-standard group"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {pm.property.name}
                              </span>
                              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                {pm.property.propertyCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1.5 flex-wrap">
                              {pm.property.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {pm.property.location}
                                </span>
                              )}
                              {pm.property.sqftArea ? (
                                <span className="font-mono font-semibold text-amber-700">
                                  {pm.property.sqftArea.toLocaleString("en-IN")}{" "}
                                  sq.ft
                                  {pm.property.ratePerSqft
                                    ? ` @ ₹${pm.property.ratePerSqft.toLocaleString("en-IN")}`
                                    : ""}
                                </span>
                              ) : null}
                              {pm.subPlotStats && (
                                <span className="font-mono text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  {pm.subPlotStats.sold}/
                                  {pm.subPlotStats.totalPlots} Plots Sold
                                </span>
                              )}
                              {pm.deadlineStatus &&
                                pm.deadlineStatus !== "safe" &&
                                pm.deadlineStatus !== "none" &&
                                pm.daysToDeadline !== undefined && (
                                  <span
                                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                                      pm.deadlineStatus === "overdue"
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : pm.deadlineStatus === "urgent"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    }`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {pm.daysToDeadline < 0
                                        ? `${Math.abs(pm.daysToDeadline)}d Overdue`
                                        : pm.daysToDeadline === 0
                                        ? "Due Today"
                                        : `Due in ${pm.daysToDeadline}d`}
                                    </span>
                                  </span>
                                )}
                              {pm.property.attachmentUrl && (
                                <a
                                  href={pm.property.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline font-medium"
                                  title="Open documents"
                                >
                                  <Link2 className="w-3 h-3" />
                                  <span>Docs</span>
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openWhatsAppShare(formatPropertyWhatsApp(pm));
                              }}
                              className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Share on WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            {onEditProperty && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditProperty(pm.property);
                                }}
                                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title="Edit property"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 2x2 Plain-English Financial Grid */}
                        <div className="grid grid-cols-2 gap-2.5 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/70">
                          <div>
                            <div className="text-[11px] font-semibold text-slate-500">
                              Buy Price
                            </div>
                            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
                              {formatINR(pm.property.agreedPurchasePrice)}
                            </div>
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-amber-700">
                              Extra Costs
                            </div>
                            <div className="text-sm sm:text-base font-bold font-mono text-amber-700 mt-0.5">
                              {formatINR(pm.propertyExpenses)}
                            </div>
                            {isExpensesHigherThanBuy && (
                              <div className="text-[10px] text-amber-600 font-medium">
                                Higher than buy price
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-blue-700">
                              Target Sale
                            </div>
                            <div className="text-sm sm:text-base font-bold font-mono text-blue-700 mt-0.5">
                              {pm.property.targetSalePrice
                                ? formatINR(pm.property.targetSalePrice)
                                : "Not set"}
                            </div>
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-emerald-700">
                              Agreed Sale
                            </div>
                            <div className="text-sm sm:text-base font-bold font-mono text-emerald-700 mt-0.5">
                              {pm.property.agreedSellingPrice
                                ? formatINR(pm.property.agreedSellingPrice)
                                : "Unsold"}
                            </div>
                          </div>
                        </div>

                        {/* Total Cost & Profit Row */}
                        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                          <span className="text-slate-500">
                            Total Cost:{" "}
                            <strong className="text-slate-900 font-mono font-bold">
                              {formatINR(pm.totalProjectOutlay)}
                            </strong>
                          </span>
                          {pm.property.status === "sold" ||
                          pm.property.status === "closed" ? (
                            pm.realizedProfit > 0 ? (
                              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                                +{formatINR(pm.realizedProfit)} Profit
                              </span>
                            ) : (
                              <span className="font-mono text-amber-700 font-semibold text-xs">
                                Recovering Cost
                              </span>
                            )
                          ) : pm.projectedProfit !== 0 ? (
                            <span className="font-mono text-violet-700 font-semibold bg-violet-50 px-2 py-0.5 rounded-full text-xs">
                              Est. +{formatINR(pm.projectedProfit)}
                            </span>
                          ) : null}
                        </div>

                        {/* Seller Payment Progress Bar */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                            <span>Paid to Seller</span>
                            <span className="font-mono text-slate-900 font-bold">
                              {fundedPct}% ({formatINRCompact(pm.purchasePaidTotal)})
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                fundedPct >= 100
                                  ? "bg-emerald-500"
                                  : "bg-blue-600"
                              }`}
                              style={{ width: `${fundedPct}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${
                              pm.property.status === "sold"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : pm.property.status === "in_progress"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                pm.property.status === "sold"
                                  ? "bg-emerald-500"
                                  : pm.property.status === "in_progress"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {formatStatusLabel(pm.property.status)}
                          </span>
                          <span className="text-slate-400 group-hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors">
                            Open Ledger <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table View */}
              {layoutVariant === "table" && (
                <div className="border border-slate-200/90 rounded-2xl overflow-x-auto bg-white shadow-card">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <th className="py-3.5 px-4">Code</th>
                        <th className="py-3.5 px-4">Property</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4 text-right">Buy Price</th>
                        <th className="py-3.5 px-4 text-right text-amber-700">
                          Extra Costs
                        </th>
                        <th className="py-3.5 px-4 text-right text-slate-900">
                          Total Cost
                        </th>
                        <th className="py-3.5 px-4 text-right">Paid (Cash)</th>
                        <th className="py-3.5 px-4 text-right">Paid (Bank)</th>
                        <th className="py-3.5 px-4 text-right text-amber-700">
                          Owed to Seller
                        </th>
                        <th className="py-3.5 px-4 text-right text-blue-700">
                          Target Sale
                        </th>
                        <th className="py-3.5 px-4 text-right text-emerald-700">
                          Agreed Sale
                        </th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMetrics.map((pm) => (
                        <tr
                          key={pm.property.id}
                          onClick={() => onSelectProperty(pm)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono text-slate-500 text-xs font-semibold">
                            {pm.property.propertyCode}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {pm.property.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {formatDateIN(pm.property.acquisitionDate)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                            {formatINR(pm.property.agreedPurchasePrice)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-700">
                            {formatINR(pm.propertyExpenses)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                            {formatINR(pm.totalProjectOutlay)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                            {formatINR(pm.purchasePaidCash)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                            {formatINR(pm.purchasePaidBank)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-700">
                            {formatINR(pm.pendingOutflow)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-blue-700">
                            {pm.property.targetSalePrice
                              ? formatINR(pm.property.targetSalePrice)
                              : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                            {pm.property.agreedSellingPrice
                              ? formatINR(pm.property.agreedSellingPrice)
                              : "-"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                              {formatStatusLabel(pm.property.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900 text-sm">
                        <td colSpan={3} className="py-3.5 px-4">
                          Total Across All Properties
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          {formatINR(metrics.totalAgreedBuyPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-700">
                          {formatINR(metrics.totalPropertyExpenses)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                          {formatINR(metrics.totalProjectOutlay)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          {formatINR(metrics.outflowsCash)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          {formatINR(metrics.outflowsBank)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-700">
                          {formatINR(metrics.totalPendingPayable)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-blue-700">
                          {formatINR(metrics.totalTargetSalePrice)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                          {formatINR(metrics.totalAgreedSalePrice)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 2: Payments Made */}
      {activeTab === "outflows" && (
        <div className="flex flex-col gap-3">
          {renderLedgerFilterBar()}
          <div className="border border-slate-200/90 rounded-2xl overflow-x-auto bg-white shadow-card">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Paid Via</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Paid To / Notes</th>
                  <th className="py-3.5 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOutflows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-slate-400 text-sm font-medium"
                    >
                      No payments match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredOutflows.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-xs font-semibold">
                        {t.transCode || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDateIN(t.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{t.propertyCode || "-"}</span>
                          {t.subPlotNumber && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Plot #{t.subPlotNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{t.category}</span>
                          {t.borneBy === "seller" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                              For Seller
                            </span>
                          )}
                          {t.borneBy === "buyer" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                              For Buyer
                            </span>
                          )}
                          {t.borneBy === "split" && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-bold"
                              title={`Self: ₹${(t.amountSelf || 0).toLocaleString("en-IN")} | Seller: ₹${(t.amountSeller || 0).toLocaleString("en-IN")} | Buyer: ₹${(t.amountBuyer || 0).toLocaleString("en-IN")}`}
                            >
                              Split
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
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
                          <span>
                            {t.remarks || t.recipientOrSource || "-"}
                          </span>
                          {t.attachmentUrl && (
                            <a
                              href={t.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                              title="Open proof"
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
                  <td colSpan={5} className="py-3.5 px-4">
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

      {/* Tab 3: Buyer Receipts */}
      {activeTab === "inflows" && (
        <div className="flex flex-col gap-3">
          {renderLedgerFilterBar()}
          <div className="border border-slate-200/90 rounded-2xl overflow-x-auto bg-white shadow-card">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Receipt Type</th>
                  <th className="py-3.5 px-4">Received Via</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Buyer / Notes</th>
                  <th className="py-3.5 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDealInflows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-slate-400 text-sm font-medium"
                    >
                      No buyer receipts match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredDealInflows.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-xs font-semibold">
                        {t.transCode || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDateIN(t.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{t.propertyCode || "-"}</span>
                          {t.subPlotNumber && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Plot #{t.subPlotNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {t.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                          {t.mode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        +{formatINR(t.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <span>
                            {t.remarks || t.recipientOrSource || "-"}
                          </span>
                          {t.attachmentUrl && (
                            <a
                              href={t.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                              title="Open proof"
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
                  <td colSpan={5} className="py-3.5 px-4">
                    Total Buyer Receipts (Filtered)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                    {formatINR(
                      filteredDealInflows.reduce((sum, x) => sum + x.amount, 0)
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Capital & Drawings */}
      {activeTab === "capital" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-soft flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">
                Total Capital Put In
              </span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {formatINR(metrics.capitalInjectedTotal)}
              </span>
              <span className="text-[11px] text-slate-500">
                Bank: {formatINRCompact(metrics.capitalInjectedBank)} • Cash:{" "}
                {formatINRCompact(metrics.capitalInjectedCash)}
              </span>
            </div>

            <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-soft flex flex-col gap-1">
              <span className="text-xs font-semibold text-amber-700">
                Capital Returned
              </span>
              <span className="text-lg font-bold font-mono text-amber-700">
                -{formatINR(metrics.capitalWithdrawalsTotal)}
              </span>
              <span className="text-[11px] text-slate-500">
                Principal refunded to partners
              </span>
            </div>

            <div className="bg-white border border-rose-200/80 rounded-2xl p-4 shadow-soft flex flex-col gap-1">
              <span className="text-xs font-semibold text-rose-700">
                Profits Taken Out
              </span>
              <span className="text-lg font-bold font-mono text-rose-600">
                -{formatINR(metrics.profitWithdrawalsTotal)}
              </span>
              <span className="text-[11px] text-slate-500">
                Dividends &amp; personal drawings
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-soft flex flex-col gap-1">
              <span className="text-xs font-semibold text-emerald-800">
                Net Capital Remaining
              </span>
              <span className="text-lg font-bold font-mono text-emerald-700">
                {formatINR(
                  metrics.netCapitalInjected - metrics.profitWithdrawalsTotal
                )}
              </span>
              <span className="text-[11px] text-emerald-700/80">
                Currently retained in business
              </span>
            </div>
          </div>

          {renderLedgerFilterBar()}

          <div className="border border-slate-200/90 rounded-2xl overflow-x-auto bg-white shadow-card">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Person / Source</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCapitalAndWithdrawals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-slate-400 text-sm font-medium"
                    >
                      No capital or withdrawal entries match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredCapitalAndWithdrawals.map((t) => {
                    const isCapitalInflow =
                      t.transactionType === "capital_inflow";
                    const isProfitWithdrawal =
                      t.transactionType === "profit_withdrawal";
                    const isCapitalWithdrawal =
                      t.transactionType === "capital_withdrawal";

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-xs font-semibold">
                          {t.transCode || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {formatDateIN(t.date)}
                        </td>
                        <td className="py-3.5 px-4">
                          {isCapitalInflow && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Capital Added
                            </span>
                          )}
                          {isCapitalWithdrawal && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Capital Refund
                            </span>
                          )}
                          {isProfitWithdrawal && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Profit Taken
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {t.recipientOrSource || t.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              t.mode === "Cash"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {t.mode}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-bold ${
                            isCapitalInflow
                              ? "text-emerald-700"
                              : isCapitalWithdrawal
                              ? "text-amber-700"
                              : "text-rose-600"
                          }`}
                        >
                          {isCapitalInflow ? "+" : "-"}
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
                                title="Open proof"
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
                  <td colSpan={5} className="py-3.5 px-4">
                    Net Capital Flow (Filtered)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                    {formatINR(
                      filteredCapitalAndWithdrawals.reduce((sum, x) => {
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

      {/* Tab 5: Loans */}
      {activeTab === "loans" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 shadow-soft flex flex-col gap-1">
              <span className="text-xs font-semibold text-rose-700">
                Remaining Loan Balance
              </span>
              <span className="text-lg font-bold font-mono text-rose-700">
                {formatINR(metrics.outstandingLoansPrincipal)}
              </span>
              <span className="text-[11px] text-rose-700/80">
                Principal still to repay
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-soft flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">
                Total Borrowed
              </span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {formatINR(metrics.loansBorrowedTotal)}
              </span>
              <span className="text-[11px] text-slate-500">
                Bank: {formatINRCompact(metrics.loansBorrowedBank)} • Cash:{" "}
                {formatINRCompact(metrics.loansBorrowedCash)}
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-soft flex flex-col gap-1">
              <span className="text-xs font-semibold text-emerald-700">
                Principal Repaid
              </span>
              <span className="text-lg font-bold font-mono text-emerald-700">
                {formatINR(metrics.loansRepaidTotal)}
              </span>
              <span className="text-[11px] text-slate-500">
                Bank: {formatINRCompact(metrics.loansRepaidBank)} • Cash:{" "}
                {formatINRCompact(metrics.loansRepaidCash)}
              </span>
            </div>

            <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-soft flex flex-col gap-1">
              <span className="text-xs font-semibold text-amber-700">
                Interest &amp; Profit Share Paid
              </span>
              <span className="text-lg font-bold font-mono text-amber-700">
                {formatINR(metrics.totalFinanceCosts)}
              </span>
              <span className="text-[11px] text-slate-500">
                Interest: {formatINRCompact(metrics.loansInterestPaidTotal)} •
                Share: {formatINRCompact(metrics.loansProfitSharePaidTotal)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-emerald-600" />
                <span>Active Loans ({loans.length})</span>
              </h3>
              {onOpenNewLoanModal && (
                <button
                  onClick={onOpenNewLoanModal}
                  className="btn-action-secondary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Loan</span>
                </button>
              )}
            </div>

            {loans.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center flex flex-col items-center gap-3 shadow-soft">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  No loans tracked yet
                </div>
                <p className="text-xs text-slate-500 max-w-sm">
                  Add a bank loan or money borrowed from family/friends to keep track of repayments and interest.
                </p>
                {onOpenNewLoanModal && (
                  <button
                    onClick={onOpenNewLoanModal}
                    className="btn-action-brand px-4 py-2 rounded-xl text-xs mt-1"
                  >
                    + Add Your First Loan
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loans.map((l) => {
                  const loanMetric = metrics.loanMetrics?.find(
                    (m) => m.loan.loanCode === l.loanCode || m.loan.id === l.id
                  );
                  const borrowed =
                    loanMetric?.totalBorrowed ?? l.principalAmount;
                  const repaid = loanMetric?.principalRepaidTotal ?? 0;
                  const outstanding =
                    loanMetric?.outstandingPrincipal ?? l.principalAmount;
                  const interestPaid = loanMetric?.interestPaidTotal ?? 0;
                  const profitSharePaid =
                    loanMetric?.profitSharePaidTotal ?? 0;
                  const progressPct =
                    loanMetric?.repaymentProgressPct ??
                    (borrowed > 0
                      ? Math.min(100, Math.round((repaid / borrowed) * 100))
                      : 0);

                  return (
                    <div
                      key={l.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-card hover:shadow-card-hover transition-standard"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-slate-900">
                              {l.lenderName}
                            </span>
                            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {l.loanCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 flex-wrap">
                            <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {l.lenderType.replace("_", " ")}
                            </span>
                            {l.linkedPropertyCode && (
                              <span className="text-[11px] text-amber-700 font-mono font-semibold">
                                For {l.linkedPropertyCode}
                              </span>
                            )}
                            <span className="text-[11px]">
                              Started {formatDateIN(l.startDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              openWhatsAppShare(
                                formatLoanWhatsApp(l, loanMetric)
                              );
                            }}
                            className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          {onEditLoan && (
                            <button
                              type="button"
                              onClick={() => onEditLoan(l)}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Edit loan"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize border ${
                              l.status === "closed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : l.status === "active"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {l.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500">
                            Loan Amount
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-slate-900 mt-0.5">
                            {formatINRCompact(l.principalAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-rose-700">
                            Remaining
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-rose-700 mt-0.5">
                            {formatINRCompact(outstanding)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-emerald-700">
                            Repaid
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-emerald-700 mt-0.5">
                            {formatINRCompact(repaid)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-amber-700">
                            Interest/Share
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-amber-700 mt-0.5">
                            {formatINRCompact(interestPaid + profitSharePaid)}
                          </div>
                        </div>
                      </div>

                      {((l.interestRatePct || 0) > 0 ||
                        (l.profitSharePct || 0) > 0 ||
                        l.notes) && (
                        <div className="text-xs text-slate-600 flex flex-col gap-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            {(l.interestRatePct || 0) > 0 && (
                              <span>
                                Interest:{" "}
                                <strong className="text-slate-900 font-mono">
                                  {l.interestRatePct}% / yr
                                </strong>
                              </span>
                            )}
                            {(l.profitSharePct || 0) > 0 && (
                              <span className="text-emerald-700">
                                Profit Share:{" "}
                                <strong className="font-mono font-bold">
                                  {l.profitSharePct}%
                                </strong>
                              </span>
                            )}
                          </div>
                          {l.profitShareTerms && (
                            <div className="text-[11px] text-slate-500 italic">
                              {l.profitShareTerms}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>Repayment Progress</span>
                          <span className="font-mono text-slate-900 font-bold">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>

                      {onOpenEntryModal && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenEntryModal("loan", undefined, l.loanCode)
                            }
                            className="btn-action-secondary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Record Borrow / Repayment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Loan Transactions Ledger */}
          <div className="flex flex-col gap-2.5 pt-2">
            <h3 className="text-sm font-bold text-slate-900">
              Loan History ({loanTransactions.length})
            </h3>
            {renderLedgerFilterBar()}
            <div className="border border-slate-200/90 rounded-2xl overflow-x-auto bg-white shadow-card">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Loan</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Mode</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4">Lender / Notes</th>
                    <th className="py-3.5 px-4 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoanTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-slate-400 text-sm font-medium"
                      >
                        No loan transactions match your current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLoanTransactions.map((t) => {
                      const isBorrow = t.transactionType === "loan_inflow";
                      const isRepay = t.transactionType === "loan_repayment";
                      const isInterest = t.transactionType === "loan_interest";
                      const isProfitShare =
                        t.transactionType === "loan_profit_share";

                      return (
                        <tr
                          key={t.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono text-slate-500 text-xs font-semibold">
                            {t.transCode || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            {formatDateIN(t.date)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {t.loanCode || "-"}
                          </td>
                          <td className="py-3.5 px-4">
                            {isBorrow && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Borrowed
                              </span>
                            )}
                            {isRepay && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                Principal Repaid
                              </span>
                            )}
                            {isInterest && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Interest Paid
                              </span>
                            )}
                            {isProfitShare && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                                Profit Share
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                t.mode === "Cash"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {t.mode}
                            </span>
                          </td>
                          <td
                            className={`py-3.5 px-4 text-right font-mono font-bold ${
                              isBorrow
                                ? "text-emerald-700"
                                : isRepay
                                ? "text-blue-700"
                                : "text-amber-700"
                            }`}
                          >
                            {isBorrow ? "+" : "-"}
                            {formatINR(t.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            <div className="flex items-center gap-2">
                              <span>
                                {t.remarks || t.recipientOrSource || "-"}
                              </span>
                              {t.attachmentUrl && (
                                <a
                                  href={t.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                  title="Open proof"
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
                    <td colSpan={5} className="py-3.5 px-4">
                      Remaining Loan Principal
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-rose-700">
                      {formatINR(metrics.outstandingLoansPrincipal)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Bank <-> Cash Transfers */}
      {activeTab === "transfers" && (
        <div className="flex flex-col gap-3">
          {renderLedgerFilterBar()}
          <div className="border border-slate-200/90 rounded-2xl overflow-x-auto bg-white shadow-card">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Direction</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-400 text-sm font-medium"
                    >
                      No bank-to-cash transfers match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-xs font-semibold">
                        {t.transCode || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDateIN(t.date)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-semibold">
                        {t.transferType || "Bank Withdrawal to Cash"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatINR(t.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {t.recipientOrSource || "-"}
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
                              title="Open proof"
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
                  <td colSpan={3} className="py-3.5 px-4">
                    Total Transfers (Filtered)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                    {formatINR(
                      filteredTransfers.reduce((sum, x) => sum + x.amount, 0)
                    )}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
