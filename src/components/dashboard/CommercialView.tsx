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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-md-surface-lowest p-3 rounded-[24px] border border-md-outline-variant shadow-m3-1">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-md-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={ledgerSearchQuery}
          onChange={(e) => setLedgerSearchQuery(e.target.value)}
          placeholder="Search by property, category, person, or notes..."
          className="w-full bg-md-surface-low border border-md-outline-variant rounded-[18px] pl-10 pr-3.5 py-2 text-xs text-md-on-surface placeholder:text-md-on-surface-variant outline-none focus:bg-md-surface-lowest focus:border-md-primary focus:ring-2 focus:ring-md-primary/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <div className="flex items-center gap-0.5 bg-md-surface-container p-1 rounded-[18px] border border-md-outline-variant/80">
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
                  ? "bg-md-surface-lowest text-md-on-surface shadow-sm"
                  : "text-md-on-surface-variant hover:text-md-on-surface"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 bg-md-surface-container p-1 rounded-[18px] border border-md-outline-variant/80">
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
                  ? "bg-md-surface-lowest text-md-on-surface shadow-sm"
                  : "text-md-on-surface-variant hover:text-md-on-surface"
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
        <div className="flex flex-col gap-3 bg-md-warning-container/60 border border-md-outline-variant rounded-[24px] p-4 shadow-m3-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-md-warning-container border border-md-outline-variant flex items-center justify-center text-md-warning flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-md-on-surface">
                Upcoming Payment Deadlines ({metrics.deadlineAlerts.length})
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {metrics.overdueDeadlinesCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-md-error-container text-md-error border border-md-outline-variant font-semibold font-mono">
                  {metrics.overdueDeadlinesCount} Overdue
                </span>
              )}
              {metrics.upcomingDeadlinesCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-md-warning-container text-md-on-warning-container border border-md-outline-variant font-semibold font-mono">
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
                  className={`p-3 rounded-[18px] border text-xs flex flex-col justify-between gap-1.5 cursor-pointer transition-all bg-md-surface-lowest shadow-m3-1 ${
                    alert.status === "overdue"
                      ? "border-md-outline-variant hover:border-md-error"
                      : alert.status === "urgent"
                      ? "border-md-outline-variant hover:border-md-warning"
                      : "border-md-outline-variant hover:border-md-outline"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-md-on-surface truncate">
                      {alert.propertyName}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        alert.status === "overdue"
                          ? "bg-md-error-container text-md-error"
                          : alert.status === "urgent"
                          ? "bg-md-warning-container text-md-on-warning-container"
                          : "bg-md-surface-container text-md-on-surface-variant"
                      }`}
                    >
                      {alert.daysLeft < 0
                        ? `${Math.abs(alert.daysLeft)}d Overdue`
                        : alert.daysLeft === 0
                        ? "Due Today"
                        : `${alert.daysLeft}d Left`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-md-on-surface-variant">
                    <span>Due {formatDateIN(alert.dueDate)}</span>
                    <span className="font-mono font-bold text-md-on-surface">
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
      <div className="flex items-center justify-between border-b border-md-outline-variant overflow-x-auto pb-0.5 gap-3 scrollbar-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("deals")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "deals"
                ? "border-md-primary text-md-on-surface"
                : "border-transparent text-md-on-surface-variant hover:text-md-on-surface"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Properties</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-md-surface-container text-md-on-surface-variant font-mono">
              {metrics.propertyMetrics.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("outflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "outflows"
                ? "border-md-primary text-md-on-surface"
                : "border-transparent text-md-on-surface-variant hover:text-md-on-surface"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Payments Made</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-md-surface-container text-md-on-surface-variant font-mono">
              {formatINRCompact(metrics.outflowsTotal)}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("inflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "inflows"
                ? "border-md-primary text-md-on-surface"
                : "border-transparent text-md-on-surface-variant hover:text-md-on-surface"
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Buyer Receipts</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-md-primary-container text-md-positive font-mono">
              {formatINRCompact(metrics.dealInflowsTotal)}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("capital")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "capital"
                ? "border-md-primary text-md-on-surface"
                : "border-transparent text-md-on-surface-variant hover:text-md-on-surface"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Capital &amp; Drawings</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-md-surface-container text-md-on-surface-variant font-mono">
              {formatINRCompact(metrics.netCapitalInjected)}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("loans")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "loans"
                ? "border-md-primary text-md-on-surface"
                : "border-transparent text-md-on-surface-variant hover:text-md-on-surface"
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Loans</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-md-surface-container text-md-on-surface-variant font-mono">
              {loans.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("transfers")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "transfers"
                ? "border-md-primary text-md-on-surface"
                : "border-transparent text-md-on-surface-variant hover:text-md-on-surface"
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
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-[18px] bg-md-primary-container border border-md-outline-variant text-md-positive hover:bg-md-primary-container transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Share portfolio summary on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {activeTab === "outflows" && onOpenEntryModal && (
            <button
              onClick={() => onOpenEntryModal("outflow")}
              className="btn-action-primary px-3.5 py-1.5 rounded-[18px] text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Payment</span>
            </button>
          )}

          {activeTab === "inflows" && onOpenEntryModal && (
            <button
              onClick={() => onOpenEntryModal("inflow")}
              className="btn-action-brand px-3.5 py-1.5 rounded-[18px] text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Receipt</span>
            </button>
          )}

          {activeTab === "capital" && onOpenEntryModal && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenEntryModal("inflow")}
                className="btn-action-brand px-3 py-1.5 rounded-[18px] text-xs flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Capital</span>
              </button>
              <button
                onClick={() => onOpenEntryModal("withdrawal")}
                className="btn-action-secondary px-3 py-1.5 rounded-[18px] text-xs flex items-center gap-1 whitespace-nowrap"
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
                  className="btn-action-brand px-3 py-1.5 rounded-[18px] text-xs flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Record Loan Payment</span>
                </button>
              )}
              {onOpenNewLoanModal && (
                <button
                  onClick={onOpenNewLoanModal}
                  className="btn-action-secondary px-3 py-1.5 rounded-[18px] text-xs flex items-center gap-1 whitespace-nowrap"
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
              className="btn-action-primary px-3.5 py-1.5 rounded-[18px] text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Transfer</span>
            </button>
          )}

          {activeTab === "deals" && (
            <div className="flex items-center gap-0.5 bg-md-surface-container p-1 rounded-[18px] border border-md-outline-variant">
              <button
                onClick={() => setLayoutVariant("cards")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  layoutVariant === "cards"
                    ? "bg-md-surface-lowest text-md-on-surface shadow-sm"
                    : "text-md-on-surface-variant hover:text-md-on-surface"
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutVariant("table")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  layoutVariant === "table"
                    ? "bg-md-surface-lowest text-md-on-surface shadow-sm"
                    : "text-md-on-surface-variant hover:text-md-on-surface"
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
              <Search className="w-4 h-4 text-md-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties by name or area..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-[18px] bg-md-surface-lowest border border-md-outline-variant text-sm text-md-on-surface placeholder:text-md-on-surface-variant outline-none focus:border-md-primary focus:ring-2 focus:ring-md-primary/20 shadow-m3-1 transition-all"
              />
            </div>
            <button
              onClick={onOpenNewDealModal}
              className="btn-action-primary px-4 py-2.5 rounded-[18px] text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Property</span>
            </button>
          </div>

          {filteredMetrics.length === 0 ? (
            <div className="bg-md-surface-lowest border border-dashed border-md-outline rounded-[24px] p-10 text-center flex flex-col items-center gap-3 shadow-m3-1">
              <div className="w-12 h-12 rounded-[24px] bg-md-primary-container border border-md-outline-variant flex items-center justify-center text-md-primary">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-md-on-surface">
                {searchQuery
                  ? "No properties match your search"
                  : "No properties added yet"}
              </h3>
              <p className="text-sm text-md-on-surface-variant max-w-md">
                {searchQuery
                  ? "Try clearing your search filter to see all properties."
                  : "Add your first land deal or property to start tracking payments, costs, and profits."}
              </p>
              {!searchQuery && (
                <button
                  onClick={onOpenNewDealModal}
                  className="btn-action-brand px-4 py-2.5 rounded-[18px] text-sm flex items-center gap-1.5 mt-1"
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
                        className="bg-md-surface-lowest border border-md-outline-variant rounded-[24px] p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-md-primary shadow-m3-1 hover:shadow-m3-2 transition-standard group"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base sm:text-lg font-bold text-md-on-surface group-hover:text-md-positive transition-colors">
                                {pm.property.name}
                              </span>
                              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-md-surface-container text-md-on-surface-variant border border-md-outline-variant">
                                {pm.property.propertyCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-md-on-surface-variant mt-1.5 flex-wrap">
                              {pm.property.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-md-on-surface-variant" />
                                  {pm.property.location}
                                </span>
                              )}
                              {pm.property.sqftArea ? (
                                <span className="font-mono font-semibold text-md-warning">
                                  {pm.property.sqftArea.toLocaleString("en-IN")}{" "}
                                  sq.ft
                                  {pm.property.ratePerSqft
                                    ? ` @ ₹${pm.property.ratePerSqft.toLocaleString("en-IN")}`
                                    : ""}
                                </span>
                              ) : null}
                              {pm.subPlotStats && (
                                <span className="font-mono text-[11px] text-md-positive font-semibold bg-md-primary-container border border-md-outline-variant px-2 py-0.5 rounded-full">
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
                                        ? "bg-md-error-container text-md-error border-md-outline-variant"
                                        : pm.deadlineStatus === "urgent"
                                        ? "bg-md-warning-container text-md-warning border-md-outline-variant"
                                        : "bg-md-warning-container/80 text-md-warning border-md-outline-variant"
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
                                  className="text-xs text-md-tertiary hover:text-md-on-tertiary-container flex items-center gap-1 hover:underline font-medium"
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
                              className="p-2 rounded-[18px] bg-md-primary-container border border-md-outline-variant text-md-positive hover:bg-md-primary-container transition-colors"
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
                                className="p-2 rounded-[18px] bg-md-surface-low border border-md-outline-variant text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container transition-colors"
                                title="Edit property"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 2x2 Plain-English Financial Grid */}
                        <div className="grid grid-cols-2 gap-2.5 bg-md-surface-low p-3.5 rounded-[18px] border border-md-outline-variant/80">
                          <div>
                            <div className="text-[11px] font-semibold text-md-on-surface-variant">
                              Buy Price
                            </div>
                            <div className="text-sm sm:text-base font-bold font-mono text-md-on-surface mt-0.5">
                              {formatINR(pm.property.agreedPurchasePrice)}
                            </div>
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-md-warning">
                              Extra Costs
                            </div>
                            <div className="text-sm sm:text-base font-bold font-mono text-md-warning mt-0.5">
                              {formatINR(pm.propertyExpenses)}
                            </div>
                            {isExpensesHigherThanBuy && (
                              <div className="text-[10px] text-md-warning font-medium">
                                Higher than buy price
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-md-tertiary">
                              Target Sale
                            </div>
                            <div className="text-sm sm:text-base font-bold font-mono text-md-tertiary mt-0.5">
                              {pm.property.targetSalePrice
                                ? formatINR(pm.property.targetSalePrice)
                                : "Not set"}
                            </div>
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-md-positive">
                              Agreed Sale
                            </div>
                            <div className="text-sm sm:text-base font-bold font-mono text-md-positive mt-0.5">
                              {pm.property.agreedSellingPrice
                                ? formatINR(pm.property.agreedSellingPrice)
                                : "Unsold"}
                            </div>
                          </div>
                        </div>

                        {/* Total Cost & Profit Row */}
                        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                          <span className="text-md-on-surface-variant">
                            Total Cost:{" "}
                            <strong className="text-md-on-surface font-mono font-bold">
                              {formatINR(pm.totalProjectOutlay)}
                            </strong>
                          </span>
                          {pm.property.status === "sold" ||
                          pm.property.status === "closed" ? (
                            pm.realizedProfit > 0 ? (
                              <span className="font-mono text-md-positive font-bold bg-md-primary-container px-2 py-0.5 rounded-full text-xs">
                                +{formatINR(pm.realizedProfit)} Profit
                              </span>
                            ) : (
                              <span className="font-mono text-md-warning font-semibold text-xs">
                                Recovering Cost
                              </span>
                            )
                          ) : pm.projectedProfit !== 0 ? (
                            <span className="font-mono text-md-secondary font-semibold bg-md-secondary-container px-2 py-0.5 rounded-full text-xs">
                              Est. +{formatINR(pm.projectedProfit)}
                            </span>
                          ) : null}
                        </div>

                        {/* Seller Payment Progress Bar */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs text-md-on-surface-variant font-medium">
                            <span>Paid to Seller</span>
                            <span className="font-mono text-md-on-surface font-bold">
                              {fundedPct}% ({formatINRCompact(pm.purchasePaidTotal)})
                            </span>
                          </div>
                          <div className="w-full h-2 bg-md-surface-container rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                fundedPct >= 100
                                  ? "bg-md-primary-container0"
                                  : "bg-md-primary"
                              }`}
                              style={{ width: `${fundedPct}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-md-outline-variant/60 text-xs">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${
                              pm.property.status === "sold"
                                ? "bg-md-primary-container text-md-positive border-md-outline-variant"
                                : pm.property.status === "in_progress"
                                ? "bg-md-warning-container text-md-warning border-md-outline-variant"
                                : "bg-md-surface-container text-md-on-surface border-md-outline-variant"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                pm.property.status === "sold"
                                  ? "bg-md-primary-container0"
                                  : pm.property.status === "in_progress"
                                  ? "bg-md-warning-container0"
                                  : "bg-slate-400"
                              }`}
                            />
                            {formatStatusLabel(pm.property.status)}
                          </span>
                          <span className="text-md-on-surface-variant group-hover:text-md-positive font-semibold flex items-center gap-1 transition-colors">
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
                <div className="border border-md-outline-variant rounded-[24px] overflow-x-auto bg-md-surface-lowest shadow-m3-1">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-md-surface-low border-b border-md-outline-variant text-md-on-surface-variant uppercase text-[11px] font-bold tracking-wider">
                        <th className="py-3.5 px-4">Code</th>
                        <th className="py-3.5 px-4">Property</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4 text-right">Buy Price</th>
                        <th className="py-3.5 px-4 text-right text-md-warning">
                          Extra Costs
                        </th>
                        <th className="py-3.5 px-4 text-right text-md-on-surface">
                          Total Cost
                        </th>
                        <th className="py-3.5 px-4 text-right">Paid (Cash)</th>
                        <th className="py-3.5 px-4 text-right">Paid (Bank)</th>
                        <th className="py-3.5 px-4 text-right text-md-warning">
                          Owed to Seller
                        </th>
                        <th className="py-3.5 px-4 text-right text-md-tertiary">
                          Target Sale
                        </th>
                        <th className="py-3.5 px-4 text-right text-md-positive">
                          Agreed Sale
                        </th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-md-outline-variant/50">
                      {filteredMetrics.map((pm) => (
                        <tr
                          key={pm.property.id}
                          onClick={() => onSelectProperty(pm)}
                          className="hover:bg-md-surface-low cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono text-md-on-surface-variant text-xs font-semibold">
                            {pm.property.propertyCode}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-md-on-surface">
                            {pm.property.name}
                          </td>
                          <td className="py-3.5 px-4 text-md-on-surface-variant whitespace-nowrap">
                            {formatDateIN(pm.property.acquisitionDate)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-md-on-surface">
                            {formatINR(pm.property.agreedPurchasePrice)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-md-warning">
                            {formatINR(pm.propertyExpenses)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-md-on-surface">
                            {formatINR(pm.totalProjectOutlay)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-md-on-surface-variant">
                            {formatINR(pm.purchasePaidCash)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-md-on-surface-variant">
                            {formatINR(pm.purchasePaidBank)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-md-warning">
                            {formatINR(pm.pendingOutflow)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-md-tertiary">
                            {pm.property.targetSalePrice
                              ? formatINR(pm.property.targetSalePrice)
                              : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-md-positive">
                            {pm.property.agreedSellingPrice
                              ? formatINR(pm.property.agreedSellingPrice)
                              : "-"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-md-surface-container text-md-on-surface border border-md-outline-variant whitespace-nowrap">
                              {formatStatusLabel(pm.property.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-md-surface-low border-t border-md-outline-variant font-bold text-md-on-surface text-sm">
                        <td colSpan={3} className="py-3.5 px-4">
                          Total Across All Properties
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          {formatINR(metrics.totalAgreedBuyPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-md-warning">
                          {formatINR(metrics.totalPropertyExpenses)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-md-on-surface">
                          {formatINR(metrics.totalProjectOutlay)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-md-on-surface-variant">
                          {formatINR(metrics.outflowsCash)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-md-on-surface-variant">
                          {formatINR(metrics.outflowsBank)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-md-warning">
                          {formatINR(metrics.totalPendingPayable)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-md-tertiary">
                          {formatINR(metrics.totalTargetSalePrice)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-md-positive">
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
          <div className="border border-md-outline-variant rounded-[24px] overflow-x-auto bg-md-surface-lowest shadow-m3-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-md-surface-low border-b border-md-outline-variant text-md-on-surface-variant uppercase text-[11px] font-bold tracking-wider">
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
              <tbody className="divide-y divide-md-outline-variant/50">
                {filteredOutflows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-md-on-surface-variant text-sm font-medium"
                    >
                      No payments match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredOutflows.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-md-surface-low transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-md-on-surface-variant text-xs font-semibold">
                        {t.transCode || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-md-on-surface-variant whitespace-nowrap">
                        {formatDateIN(t.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-md-on-surface">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{t.propertyCode || "-"}</span>
                          {t.subPlotNumber && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-md-primary-container text-md-positive border border-md-outline-variant">
                              Plot #{t.subPlotNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-md-on-surface">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{t.category}</span>
                          {t.borneBy === "seller" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-md-warning-container text-md-warning border border-md-outline-variant font-bold">
                              For Seller
                            </span>
                          )}
                          {t.borneBy === "buyer" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-md-tertiary-container text-md-tertiary border border-md-outline-variant font-bold">
                              For Buyer
                            </span>
                          )}
                          {t.borneBy === "split" && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-md-secondary-container text-md-secondary border border-md-outline-variant font-bold"
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
                              ? "bg-md-warning-container text-md-warning border-md-outline-variant"
                              : "bg-md-tertiary-container text-md-tertiary border-md-outline-variant"
                          }`}
                        >
                          {t.mode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-md-on-surface">
                        {formatINR(t.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-md-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <span>
                            {t.remarks || t.recipientOrSource || "-"}
                          </span>
                          {t.attachmentUrl && (
                            <a
                              href={t.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-md-tertiary hover:text-md-on-tertiary-container flex-shrink-0"
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
                            className="p-1.5 rounded-lg bg-md-surface-low border border-md-outline-variant text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container inline-flex items-center justify-center transition-colors"
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
                <tr className="bg-md-surface-low border-t border-md-outline-variant font-bold text-md-on-surface text-sm">
                  <td colSpan={5} className="py-3.5 px-4">
                    Total Payments (Filtered)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-md-on-surface">
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
          <div className="border border-md-outline-variant rounded-[24px] overflow-x-auto bg-md-surface-lowest shadow-m3-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-md-surface-low border-b border-md-outline-variant text-md-on-surface-variant uppercase text-[11px] font-bold tracking-wider">
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
              <tbody className="divide-y divide-md-outline-variant/50">
                {filteredDealInflows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-md-on-surface-variant text-sm font-medium"
                    >
                      No buyer receipts match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredDealInflows.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-md-surface-low transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-md-on-surface-variant text-xs font-semibold">
                        {t.transCode || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-md-on-surface-variant whitespace-nowrap">
                        {formatDateIN(t.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-md-on-surface">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{t.propertyCode || "-"}</span>
                          {t.subPlotNumber && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-md-primary-container text-md-positive border border-md-outline-variant">
                              Plot #{t.subPlotNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-md-on-surface">
                        {t.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-md-tertiary-container text-md-tertiary border-md-outline-variant">
                          {t.mode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-md-positive">
                        +{formatINR(t.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-md-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <span>
                            {t.remarks || t.recipientOrSource || "-"}
                          </span>
                          {t.attachmentUrl && (
                            <a
                              href={t.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-md-tertiary hover:text-md-on-tertiary-container flex-shrink-0"
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
                            className="p-1.5 rounded-lg bg-md-surface-low border border-md-outline-variant text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container inline-flex items-center justify-center transition-colors"
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
                <tr className="bg-md-surface-low border-t border-md-outline-variant font-bold text-md-on-surface text-sm">
                  <td colSpan={5} className="py-3.5 px-4">
                    Total Buyer Receipts (Filtered)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-md-positive">
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
            <div className="bg-md-surface-lowest border border-md-outline-variant rounded-[24px] p-4 shadow-m3-1 flex flex-col gap-1">
              <span className="text-xs font-semibold text-md-on-surface-variant">
                Total Capital Put In
              </span>
              <span className="text-lg font-bold font-mono text-md-on-surface">
                {formatINR(metrics.capitalInjectedTotal)}
              </span>
              <span className="text-[11px] text-md-on-surface-variant">
                Bank: {formatINRCompact(metrics.capitalInjectedBank)} • Cash:{" "}
                {formatINRCompact(metrics.capitalInjectedCash)}
              </span>
            </div>

            <div className="bg-md-surface-lowest border border-md-outline-variant rounded-[24px] p-4 shadow-m3-1 flex flex-col gap-1">
              <span className="text-xs font-semibold text-md-warning">
                Capital Returned
              </span>
              <span className="text-lg font-bold font-mono text-md-warning">
                -{formatINR(metrics.capitalWithdrawalsTotal)}
              </span>
              <span className="text-[11px] text-md-on-surface-variant">
                Principal refunded to partners
              </span>
            </div>

            <div className="bg-md-surface-lowest border border-md-outline-variant rounded-[24px] p-4 shadow-m3-1 flex flex-col gap-1">
              <span className="text-xs font-semibold text-md-error">
                Profits Taken Out
              </span>
              <span className="text-lg font-bold font-mono text-md-error">
                -{formatINR(metrics.profitWithdrawalsTotal)}
              </span>
              <span className="text-[11px] text-md-on-surface-variant">
                Dividends &amp; personal drawings
              </span>
            </div>

            <div className="bg-md-primary-container/50 border border-md-outline-variant rounded-[24px] p-4 shadow-m3-1 flex flex-col gap-1">
              <span className="text-xs font-semibold text-md-on-primary-container">
                Net Capital Remaining
              </span>
              <span className="text-lg font-bold font-mono text-md-positive">
                {formatINR(
                  metrics.netCapitalInjected - metrics.profitWithdrawalsTotal
                )}
              </span>
              <span className="text-[11px] text-md-on-primary-container/80">
                Currently retained in business
              </span>
            </div>
          </div>

          {renderLedgerFilterBar()}

          <div className="border border-md-outline-variant rounded-[24px] overflow-x-auto bg-md-surface-lowest shadow-m3-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-md-surface-low border-b border-md-outline-variant text-md-on-surface-variant uppercase text-[11px] font-bold tracking-wider">
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
              <tbody className="divide-y divide-md-outline-variant/50">
                {filteredCapitalAndWithdrawals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-md-on-surface-variant text-sm font-medium"
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
                        className="hover:bg-md-surface-low transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono text-md-on-surface-variant text-xs font-semibold">
                          {t.transCode || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-md-on-surface-variant whitespace-nowrap">
                          {formatDateIN(t.date)}
                        </td>
                        <td className="py-3.5 px-4">
                          {isCapitalInflow && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-md-primary-container text-md-positive border border-md-outline-variant">
                              Capital Added
                            </span>
                          )}
                          {isCapitalWithdrawal && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-md-warning-container text-md-warning border border-md-outline-variant">
                              Capital Refund
                            </span>
                          )}
                          {isProfitWithdrawal && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-md-error-container text-md-error border border-md-outline-variant">
                              Profit Taken
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-md-on-surface">
                          {t.recipientOrSource || t.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              t.mode === "Cash"
                                ? "bg-md-warning-container text-md-warning border-md-outline-variant"
                                : "bg-md-tertiary-container text-md-tertiary border-md-outline-variant"
                            }`}
                          >
                            {t.mode}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-bold ${
                            isCapitalInflow
                              ? "text-md-positive"
                              : isCapitalWithdrawal
                              ? "text-md-warning"
                              : "text-md-error"
                          }`}
                        >
                          {isCapitalInflow ? "+" : "-"}
                          {formatINR(t.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-md-on-surface-variant">
                          <div className="flex items-center gap-2">
                            <span>{t.remarks || "-"}</span>
                            {t.attachmentUrl && (
                              <a
                                href={t.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-md-tertiary hover:text-md-on-tertiary-container flex-shrink-0"
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
                              className="p-1.5 rounded-lg bg-md-surface-low border border-md-outline-variant text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container inline-flex items-center justify-center transition-colors"
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
                <tr className="bg-md-surface-low border-t border-md-outline-variant font-bold text-md-on-surface text-sm">
                  <td colSpan={5} className="py-3.5 px-4">
                    Net Capital Flow (Filtered)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-md-positive">
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
            <div className="bg-md-error-container/60 border border-md-outline-variant rounded-[24px] p-4 shadow-m3-1 flex flex-col gap-1">
              <span className="text-xs font-semibold text-md-error">
                Remaining Loan Balance
              </span>
              <span className="text-lg font-bold font-mono text-md-error">
                {formatINR(metrics.outstandingLoansPrincipal)}
              </span>
              <span className="text-[11px] text-md-on-error-container/80">
                Principal still to repay
              </span>
            </div>

            <div className="bg-md-surface-lowest border border-md-outline-variant rounded-[24px] p-4 shadow-m3-1 flex flex-col gap-1">
              <span className="text-xs font-semibold text-md-on-surface-variant">
                Total Borrowed
              </span>
              <span className="text-lg font-bold font-mono text-md-on-surface">
                {formatINR(metrics.loansBorrowedTotal)}
              </span>
              <span className="text-[11px] text-md-on-surface-variant">
                Bank: {formatINRCompact(metrics.loansBorrowedBank)} • Cash:{" "}
                {formatINRCompact(metrics.loansBorrowedCash)}
              </span>
            </div>

            <div className="bg-md-surface-lowest border border-md-outline-variant rounded-[24px] p-4 shadow-m3-1 flex flex-col gap-1">
              <span className="text-xs font-semibold text-md-positive">
                Principal Repaid
              </span>
              <span className="text-lg font-bold font-mono text-md-positive">
                {formatINR(metrics.loansRepaidTotal)}
              </span>
              <span className="text-[11px] text-md-on-surface-variant">
                Bank: {formatINRCompact(metrics.loansRepaidBank)} • Cash:{" "}
                {formatINRCompact(metrics.loansRepaidCash)}
              </span>
            </div>

            <div className="bg-md-surface-lowest border border-md-outline-variant rounded-[24px] p-4 shadow-m3-1 flex flex-col gap-1">
              <span className="text-xs font-semibold text-md-warning">
                Interest &amp; Profit Share Paid
              </span>
              <span className="text-lg font-bold font-mono text-md-warning">
                {formatINR(metrics.totalFinanceCosts)}
              </span>
              <span className="text-[11px] text-md-on-surface-variant">
                Interest: {formatINRCompact(metrics.loansInterestPaidTotal)} •
                Share: {formatINRCompact(metrics.loansProfitSharePaidTotal)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-md-on-surface flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-md-primary" />
                <span>Active Loans ({loans.length})</span>
              </h3>
              {onOpenNewLoanModal && (
                <button
                  onClick={onOpenNewLoanModal}
                  className="btn-action-secondary px-3 py-1.5 rounded-[18px] text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Loan</span>
                </button>
              )}
            </div>

            {loans.length === 0 ? (
              <div className="bg-md-surface-lowest border border-dashed border-md-outline rounded-[24px] p-8 text-center flex flex-col items-center gap-3 shadow-m3-1">
                <div className="w-11 h-11 rounded-[24px] bg-md-primary-container border border-md-outline-variant flex items-center justify-center text-md-primary">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-md-on-surface">
                  No loans tracked yet
                </div>
                <p className="text-xs text-md-on-surface-variant max-w-sm">
                  Add a bank loan or money borrowed from family/friends to keep track of repayments and interest.
                </p>
                {onOpenNewLoanModal && (
                  <button
                    onClick={onOpenNewLoanModal}
                    className="btn-action-brand px-4 py-2 rounded-[18px] text-xs mt-1"
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
                      className="bg-md-surface-lowest border border-md-outline-variant rounded-[24px] p-5 flex flex-col justify-between gap-4 shadow-m3-1 hover:shadow-m3-2 transition-standard"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-md-on-surface">
                              {l.lenderName}
                            </span>
                            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-md-surface-container text-md-on-surface-variant border border-md-outline-variant">
                              {l.loanCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-md-on-surface-variant mt-1.5 flex-wrap">
                            <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold bg-md-surface-container text-md-on-surface">
                              {l.lenderType.replace("_", " ")}
                            </span>
                            {l.linkedPropertyCode && (
                              <span className="text-[11px] text-md-warning font-mono font-semibold">
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
                            className="p-2 rounded-[18px] bg-md-primary-container border border-md-outline-variant text-md-positive hover:bg-md-primary-container transition-colors"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          {onEditLoan && (
                            <button
                              type="button"
                              onClick={() => onEditLoan(l)}
                              className="p-2 rounded-[18px] bg-md-surface-low border border-md-outline-variant text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container transition-colors"
                              title="Edit loan"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize border ${
                              l.status === "closed"
                                ? "bg-md-primary-container text-md-positive border-md-outline-variant"
                                : l.status === "active"
                                ? "bg-md-tertiary-container text-md-tertiary border-md-outline-variant"
                                : "bg-md-error-container text-md-error border-md-outline-variant"
                            }`}
                          >
                            {l.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-md-surface-low p-3 rounded-[18px] border border-md-outline-variant/80">
                        <div>
                          <div className="text-[11px] font-semibold text-md-on-surface-variant">
                            Loan Amount
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-md-on-surface mt-0.5">
                            {formatINRCompact(l.principalAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-md-error">
                            Remaining
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-md-error mt-0.5">
                            {formatINRCompact(outstanding)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-md-positive">
                            Repaid
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-md-positive mt-0.5">
                            {formatINRCompact(repaid)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-md-warning">
                            Interest/Share
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-md-warning mt-0.5">
                            {formatINRCompact(interestPaid + profitSharePaid)}
                          </div>
                        </div>
                      </div>

                      {((l.interestRatePct || 0) > 0 ||
                        (l.profitSharePct || 0) > 0 ||
                        l.notes) && (
                        <div className="text-xs text-md-on-surface-variant flex flex-col gap-1 bg-md-surface-low p-2.5 rounded-[18px] border border-md-outline-variant/60">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            {(l.interestRatePct || 0) > 0 && (
                              <span>
                                Interest:{" "}
                                <strong className="text-md-on-surface font-mono">
                                  {l.interestRatePct}% / yr
                                </strong>
                              </span>
                            )}
                            {(l.profitSharePct || 0) > 0 && (
                              <span className="text-md-positive">
                                Profit Share:{" "}
                                <strong className="font-mono font-bold">
                                  {l.profitSharePct}%
                                </strong>
                              </span>
                            )}
                          </div>
                          {l.profitShareTerms && (
                            <div className="text-[11px] text-md-on-surface-variant italic">
                              {l.profitShareTerms}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs text-md-on-surface-variant">
                          <span>Repayment Progress</span>
                          <span className="font-mono text-md-on-surface font-bold">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-md-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-md-primary-container0 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>

                      {onOpenEntryModal && (
                        <div className="flex items-center gap-2 pt-2 border-t border-md-outline-variant/60">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenEntryModal("loan", undefined, l.loanCode)
                            }
                            className="btn-action-secondary px-3 py-1.5 rounded-[18px] text-xs flex items-center gap-1 text-md-positive border-md-outline-variant hover:bg-md-primary-container"
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
            <h3 className="text-sm font-bold text-md-on-surface">
              Loan History ({loanTransactions.length})
            </h3>
            {renderLedgerFilterBar()}
            <div className="border border-md-outline-variant rounded-[24px] overflow-x-auto bg-md-surface-lowest shadow-m3-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-md-surface-low border-b border-md-outline-variant text-md-on-surface-variant uppercase text-[11px] font-bold tracking-wider">
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
                <tbody className="divide-y divide-md-outline-variant/50">
                  {filteredLoanTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-md-on-surface-variant text-sm font-medium"
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
                          className="hover:bg-md-surface-low transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono text-md-on-surface-variant text-xs font-semibold">
                            {t.transCode || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-md-on-surface-variant whitespace-nowrap">
                            {formatDateIN(t.date)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-md-on-surface">
                            {t.loanCode || "-"}
                          </td>
                          <td className="py-3.5 px-4">
                            {isBorrow && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-md-primary-container text-md-positive border border-md-outline-variant">
                                Borrowed
                              </span>
                            )}
                            {isRepay && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-md-tertiary-container text-md-tertiary border border-md-outline-variant">
                                Principal Repaid
                              </span>
                            )}
                            {isInterest && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-md-warning-container text-md-warning border border-md-outline-variant">
                                Interest Paid
                              </span>
                            )}
                            {isProfitShare && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-md-secondary-container text-md-secondary border border-md-outline-variant">
                                Profit Share
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                t.mode === "Cash"
                                  ? "bg-md-warning-container text-md-warning border-md-outline-variant"
                                  : "bg-md-tertiary-container text-md-tertiary border-md-outline-variant"
                              }`}
                            >
                              {t.mode}
                            </span>
                          </td>
                          <td
                            className={`py-3.5 px-4 text-right font-mono font-bold ${
                              isBorrow
                                ? "text-md-positive"
                                : isRepay
                                ? "text-md-tertiary"
                                : "text-md-warning"
                            }`}
                          >
                            {isBorrow ? "+" : "-"}
                            {formatINR(t.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-md-on-surface-variant">
                            <div className="flex items-center gap-2">
                              <span>
                                {t.remarks || t.recipientOrSource || "-"}
                              </span>
                              {t.attachmentUrl && (
                                <a
                                  href={t.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-md-tertiary hover:text-md-on-tertiary-container flex-shrink-0"
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
                                className="p-1.5 rounded-lg bg-md-surface-low border border-md-outline-variant text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container inline-flex items-center justify-center transition-colors"
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
                  <tr className="bg-md-surface-low border-t border-md-outline-variant font-bold text-md-on-surface text-sm">
                    <td colSpan={5} className="py-3.5 px-4">
                      Remaining Loan Principal
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-md-error">
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
          <div className="border border-md-outline-variant rounded-[24px] overflow-x-auto bg-md-surface-lowest shadow-m3-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-md-surface-low border-b border-md-outline-variant text-md-on-surface-variant uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Direction</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-md-outline-variant/50">
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-md-on-surface-variant text-sm font-medium"
                    >
                      No bank-to-cash transfers match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-md-surface-low transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-md-on-surface-variant text-xs font-semibold">
                        {t.transCode || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-md-on-surface-variant whitespace-nowrap">
                        {formatDateIN(t.date)}
                      </td>
                      <td className="py-3.5 px-4 text-md-on-surface font-semibold">
                        {t.transferType || "Bank Withdrawal to Cash"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-md-on-surface">
                        {formatINR(t.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-md-on-surface">
                        {t.recipientOrSource || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-md-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <span>{t.remarks || "-"}</span>
                          {t.attachmentUrl && (
                            <a
                              href={t.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-md-tertiary hover:text-md-on-tertiary-container flex-shrink-0"
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
                            className="p-1.5 rounded-lg bg-md-surface-low border border-md-outline-variant text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container inline-flex items-center justify-center transition-colors"
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
                <tr className="bg-md-surface-low border-t border-md-outline-variant font-bold text-md-on-surface text-sm">
                  <td colSpan={3} className="py-3.5 px-4">
                    Total Transfers (Filtered)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-md-on-surface">
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
