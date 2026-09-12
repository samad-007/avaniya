"use client";

import React, { useState, useMemo } from "react";
import { formatINR, formatINRCompact, formatDateIN } from "@/lib/formatters";
import {
  CommercialDashboardMetrics,
  PropertyFinancialMetrics,
} from "@/lib/formulaEngine";
import { SeedProperty, SeedTransaction, SeedLoan } from "@/lib/seedData";
import {
  LayoutGrid,
  Table as TableIcon,
  Maximize2,
  MapPin,
  Calendar,
  Banknote,
  Landmark,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  Receipt,
  FileCheck2,
  Pencil,
  Plus,
  HandCoins,
  Users,
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

  return (
    <div className="flex flex-col gap-4">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#262626] overflow-x-auto pb-0.5 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("deals")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "deals"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            1. Land Deals Master ({metrics.propertyMetrics.length})
          </button>
          <button
            onClick={() => setActiveTab("outflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "outflows"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            2. Property Outflows ({formatINRCompact(metrics.outflowsTotal)})
          </button>
          <button
            onClick={() => setActiveTab("inflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "inflows"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            3. Sale Receipts ({formatINRCompact(metrics.dealInflowsTotal)})
          </button>
          <button
            onClick={() => setActiveTab("capital")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "capital"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            4. Capital &amp; Withdrawals ({formatINRCompact(metrics.netCapitalInjected)})
          </button>
          <button
            onClick={() => setActiveTab("loans")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "loans"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            5. Loans &amp; Debt ({loans.length})
          </button>
          <button
            onClick={() => setActiveTab("transfers")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "transfers"
                ? "border-white text-white font-bold"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            6. Cash &amp; Bank Transfers
          </button>
        </div>

        {/* Action Controls on Right */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {activeTab === "outflows" && onOpenEntryModal && (
            <button
              onClick={() => onOpenEntryModal("outflow")}
              className="btn-action-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Outflow</span>
            </button>
          )}

          {activeTab === "inflows" && onOpenEntryModal && (
            <button
              onClick={() => onOpenEntryModal("inflow")}
              className="btn-action-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-[#22C55E]" />
              <span>Log Sale Receipt</span>
            </button>
          )}

          {activeTab === "capital" && onOpenEntryModal && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenEntryModal("inflow")}
                className="btn-action-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5] text-[#22C55E]" />
                <span>+ Inflow</span>
              </button>
              <button
                onClick={() => onOpenEntryModal("withdrawal")}
                className="btn-action-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap text-amber-300 border border-amber-800/40"
              >
                <span>+ Withdraw</span>
              </button>
            </div>
          )}

          {activeTab === "loans" && (
            <div className="flex items-center gap-1.5">
              {onOpenEntryModal && (
                <button
                  onClick={() => onOpenEntryModal("loan")}
                  className="btn-action-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap text-emerald-400"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Log Loan Flow</span>
                </button>
              )}
              {onOpenNewLoanModal && (
                <button
                  onClick={onOpenNewLoanModal}
                  className="btn-action-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ New Facility</span>
                </button>
              )}
            </div>
          )}

          {activeTab === "transfers" && onOpenEntryModal && (
            <button
              onClick={() => onOpenEntryModal("transfer")}
              className="btn-action-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Transfer</span>
            </button>
          )}

          {/* View Toggle (Cards vs Table for Deals) */}
          {activeTab === "deals" && (
            <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-lg border border-[#262626]">
              <button
                onClick={() => setLayoutVariant("cards")}
                className={`p-1.5 rounded-md text-xs transition-all duration-150 ${
                  layoutVariant === "cards"
                    ? "bg-[#262626] text-white"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
                title="Visual Pipeline Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutVariant("table")}
                className={`p-1.5 rounded-md text-xs transition-all duration-150 ${
                  layoutVariant === "table"
                    ? "bg-[#262626] text-white"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
                title="Dense Ledger Matrix"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: Land Deals Master */}
      {activeTab === "deals" && (
        <div className="flex flex-col gap-3.5">
          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter properties or location..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0e0e0e] border border-[#262626] text-sm text-white placeholder-[#71717A] outline-none focus:border-[#555555] transition-all duration-150"
              />
            </div>
            {/* Key Ingress Button: Add New Land Deal (Hover-to-White) */}
            <button
              onClick={onOpenNewDealModal}
              className="btn-action-primary px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Land Deal</span>
            </button>
          </div>

          {/* Visual Pipeline Cards */}
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
                    className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-[#444444] hover:bg-[#0e0e0e] transition-all duration-150 group shadow-md"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-bold text-white group-hover:text-[#22C55E] transition-colors">
                            {pm.property.name}
                          </span>
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626]">
                            {pm.property.propertyCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mt-1 flex-wrap">
                          {pm.property.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#71717A]" />
                              {pm.property.location}
                            </span>
                          )}
                          {pm.property.sqftArea ? (
                            <span className="font-mono font-medium text-[#F59E0B]">
                              {pm.property.sqftArea.toLocaleString("en-IN")}{" "}
                              sq.ft
                              {pm.property.ratePerSqft
                                ? ` @ ₹${pm.property.ratePerSqft.toLocaleString("en-IN")}/sqft`
                                : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {onEditProperty && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProperty(pm.property);
                            }}
                            className="btn-action-primary p-2 rounded-lg"
                            title="Edit Property Data Points"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#22C55E]" />
                          </button>
                        )}
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                            pm.property.status === "sold"
                              ? "bg-green-950/40 text-green-400 border border-green-800/40"
                              : pm.property.status === "in_progress"
                              ? "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                              : "bg-[#181818] text-[#A1A1AA] border border-[#2a2a2a]"
                          }`}
                        >
                          {pm.property.status}
                        </span>
                      </div>
                    </div>

                    {/* Financial Matrix (Agreed Buy, Expenses, Target Price, Selling Price) */}
                    <div className="grid grid-cols-2 gap-2.5 bg-[#050505] p-3 rounded-lg border border-[#1a1a1a]">
                      <div>
                        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                          1. Agreed Buy Price
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                          {formatINR(pm.property.agreedPurchasePrice)}
                        </div>
                        <div className="text-xs text-[#71717A] mt-0.5">
                          Seller Consideration
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
                          2. Property Expenses
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-[#F59E0B] mt-0.5">
                          {formatINR(pm.propertyExpenses)}
                        </div>
                        <div className="text-xs text-[#71717A] mt-0.5 truncate">
                          {isExpensesHigherThanBuy
                            ? "Exceeds Buy Price"
                            : "Stamp, Legal, DTCP, Fencing"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
                          3. Target Sale Exit
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-[#3B82F6] mt-0.5">
                          {pm.property.targetSalePrice
                            ? formatINR(pm.property.targetSalePrice)
                            : "Not Set"}
                        </div>
                        <div className="text-xs text-[#71717A] mt-0.5">
                          Market Exit Valuation
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
                          4. Agreed Selling Price
                        </div>
                        <div className="text-sm sm:text-base font-bold font-mono text-[#22C55E] mt-0.5">
                          {pm.property.agreedSellingPrice
                            ? formatINR(pm.property.agreedSellingPrice)
                            : "Pipeline"}
                        </div>
                        <div className="text-xs text-[#71717A] mt-0.5">
                          Buyer Agreed Price
                        </div>
                      </div>
                    </div>

                    {/* Total Outlay & Profit Summary */}
                    <div className="flex items-center justify-between text-xs sm:text-sm pt-1 border-t border-[#1a1a1a]">
                      <span className="text-[#A1A1AA]">
                        Total Outlay:{" "}
                        <strong className="text-white font-mono font-bold">
                          {formatINR(pm.totalProjectOutlay)}
                        </strong>
                      </span>
                      {pm.property.status === "sold" || pm.property.status === "closed" ? (
                        pm.realizedProfit > 0 ? (
                          <span className="font-mono text-[#22C55E] font-bold">
                            +{formatINR(pm.realizedProfit)} Realized
                          </span>
                        ) : (
                          <span className="font-mono text-amber-400 font-semibold">
                            Cost Recovering
                          </span>
                        )
                      ) : pm.projectedProfit !== 0 ? (
                        <span className="font-mono text-purple-400 font-semibold">
                          Est. Gain: +{formatINR(pm.projectedProfit)}
                        </span>
                      ) : null}
                    </div>

                    {/* Funding Progress Bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs text-[#A1A1AA] font-medium">
                        <span>Seller Payment Progress</span>
                        <span className="font-mono text-white font-bold">
                          {fundedPct}% ({formatINRCompact(pm.purchasePaidTotal)})
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-300"
                          style={{ width: `${fundedPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dense Ledger Matrix */}
          {layoutVariant === "table" && (
            <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                    <th className="py-3 px-3.5">Land ID</th>
                    <th className="py-3 px-3.5">Property / Location</th>
                    <th className="py-3 px-3.5">Acquired</th>
                    <th className="py-3 px-3.5 text-right">Agreed Buy</th>
                    <th className="py-3 px-3.5 text-right text-[#F59E0B]">
                      Expenses
                    </th>
                    <th className="py-3 px-3.5 text-right font-bold text-white">
                      Total Outlay
                    </th>
                    <th className="py-3 px-3.5 text-right">Paid (Cash)</th>
                    <th className="py-3 px-3.5 text-right">Paid (Bank)</th>
                    <th className="py-3 px-3.5 text-right text-[#F59E0B]">
                      Pending to Seller
                    </th>
                    <th className="py-3 px-3.5 text-right text-[#3B82F6]">
                      Target Price
                    </th>
                    <th className="py-3 px-3.5 text-right text-[#22C55E]">
                      Selling Price
                    </th>
                    <th className="py-3 px-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818]">
                  {filteredMetrics.map((pm) => (
                    <tr
                      key={pm.property.id}
                      onClick={() => onSelectProperty(pm)}
                      className="hover:bg-[#141414] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3.5 font-mono text-[#A1A1AA] font-semibold">
                        {pm.property.propertyCode}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-white">
                        {pm.property.name}
                      </td>
                      <td className="py-3 px-3.5 text-[#A1A1AA]">
                        {formatDateIN(pm.property.acquisitionDate)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-white">
                        {formatINR(pm.property.agreedPurchasePrice)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-[#F59E0B]">
                        {formatINR(pm.propertyExpenses)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                        {formatINR(pm.totalProjectOutlay)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-[#D4D4D8]">
                        {formatINR(pm.purchasePaidCash)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-[#D4D4D8]">
                        {formatINR(pm.purchasePaidBank)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-[#F59E0B]">
                        {formatINR(pm.pendingOutflow)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-[#3B82F6]">
                        {pm.property.targetSalePrice
                          ? formatINR(pm.property.targetSalePrice)
                          : "-"}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-[#22C55E]">
                        {pm.property.agreedSellingPrice
                          ? formatINR(pm.property.agreedSellingPrice)
                          : "-"}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#2a2a2a] uppercase">
                          {pm.property.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#0e0e0e] border-t-2 border-[#262626] font-bold text-white text-sm">
                    <td colSpan={3} className="py-3.5 px-3.5">
                      Total Across All Land Deals
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono">
                      {formatINR(metrics.totalAgreedBuyPrice)}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-[#F59E0B]">
                      {formatINR(metrics.totalPropertyExpenses)}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-white">
                      {formatINR(metrics.totalProjectOutlay)}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-[#D4D4D8]">
                      {formatINR(metrics.outflowsCash)}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-[#D4D4D8]">
                      {formatINR(metrics.outflowsBank)}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-[#F59E0B]">
                      {formatINR(metrics.totalPendingPayable)}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-[#3B82F6]">
                      {formatINR(metrics.totalTargetSalePrice)}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-[#22C55E]">
                      {formatINR(metrics.totalAgreedSalePrice)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Outflows Log */}
      {activeTab === "outflows" && (
        <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                <th className="py-3 px-3.5">Trans ID</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Land ID</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Payment Mode</th>
                <th className="py-3 px-3.5 text-right">Amount Paid</th>
                <th className="py-3 px-3.5">Paid To / Notes</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {outflows.map((t) => (
                <tr key={t.id} className="hover:bg-[#141414] transition-colors">
                  <td className="py-3 px-3.5 font-mono text-[#A1A1AA] font-semibold">
                    {t.transCode || "-"}
                  </td>
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
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                        t.mode === "Cash"
                          ? "bg-amber-950/20 text-amber-400 border-amber-800/30"
                          : "bg-blue-950/20 text-blue-400 border-blue-800/30"
                      }`}
                    >
                      {t.mode}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                    {formatINR(t.amount)}
                  </td>
                  <td className="py-3 px-3.5 text-[#A1A1AA]">
                    {t.remarks || t.recipientOrSource || "-"}
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
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#0e0e0e] border-t-2 border-[#262626] font-bold text-white text-sm">
                <td colSpan={5} className="py-3.5 px-3.5">
                  Total Outflows Paid
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono text-[#22C55E]">
                  {formatINR(metrics.outflowsTotal)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab 3: Sale Receipts */}
      {activeTab === "inflows" && (
        <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                <th className="py-3 px-3.5">Receipt ID</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Land ID</th>
                <th className="py-3 px-3.5">Receipt Type</th>
                <th className="py-3 px-3.5">Payment Mode</th>
                <th className="py-3 px-3.5 text-right">Amount Received</th>
                <th className="py-3 px-3.5">Received From / Notes</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {dealInflows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-[#71717A] text-sm font-medium"
                  >
                    No buyer sale receipts logged yet.
                  </td>
                </tr>
              ) : (
                dealInflows.map((t) => (
                  <tr key={t.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-3 px-3.5 font-mono text-[#A1A1AA] font-semibold">
                      {t.transCode || "-"}
                    </td>
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
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-[#22C55E]">
                      {formatINR(t.amount)}
                    </td>
                    <td className="py-3 px-3.5 text-[#A1A1AA]">
                      {t.remarks || t.recipientOrSource || "-"}
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
          </table>
        </div>
      )}

      {/* Tab 4: Capital & Withdrawals */}
      {activeTab === "capital" && (
        <div className="flex flex-col gap-4">
          {/* Equity & Retained Capital Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#0e0e0e] border border-[#262626] rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Gross Capital Injected
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-white">
                {formatINR(metrics.capitalInjectedTotal)}
              </span>
              <span className="text-[11px] text-[#71717A]">
                Bank: {formatINRCompact(metrics.capitalInjectedBank)} | Cash: {formatINRCompact(metrics.capitalInjectedCash)}
              </span>
            </div>

            <div className="bg-[#0e0e0e] border border-amber-900/30 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Capital Principal Returned
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-amber-400">
                -{formatINR(metrics.capitalWithdrawalsTotal)}
              </span>
              <span className="text-[11px] text-[#71717A]">
                Equity reductions &amp; partner refunds
              </span>
            </div>

            <div className="bg-[#0e0e0e] border border-rose-900/30 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                Profit &amp; Drawings Withdrawn
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-rose-400">
                -{formatINR(metrics.profitWithdrawalsTotal)}
              </span>
              <span className="text-[11px] text-[#71717A]">
                Reallocated to other ventures/dividends
              </span>
            </div>

            <div className="bg-[#0e0e0e] border border-[#333333] rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                Net Retained Capital In Business
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-[#22C55E]">
                {formatINR(metrics.netCapitalInjected - metrics.profitWithdrawalsTotal)}
              </span>
              <span className="text-[11px] text-[#71717A]">
                Retained net capital equity
              </span>
            </div>
          </div>

          {/* Unified Ledger Table */}
          <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                  <th className="py-3 px-3.5">Entry ID</th>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Type / Flow</th>
                  <th className="py-3 px-3.5">Category / Party</th>
                  <th className="py-3 px-3.5">Payment Mode</th>
                  <th className="py-3 px-3.5 text-right">Amount</th>
                  <th className="py-3 px-3.5">Notes</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {capitalAndWithdrawals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-[#71717A] text-sm font-medium"
                    >
                      No capital funding or withdrawal transactions logged yet.
                    </td>
                  </tr>
                ) : (
                  capitalAndWithdrawals.map((t) => {
                    const isCapitalInflow = t.transactionType === "capital_inflow";
                    const isProfitWithdrawal = t.transactionType === "profit_withdrawal";
                    const isCapitalWithdrawal = t.transactionType === "capital_withdrawal";

                    return (
                      <tr key={t.id} className="hover:bg-[#141414] transition-colors">
                        <td className="py-3 px-3.5 font-mono text-[#A1A1AA] font-semibold">
                          {t.transCode || "-"}
                        </td>
                        <td className="py-3 px-3.5 text-[#D4D4D8]">
                          {formatDateIN(t.date)}
                        </td>
                        <td className="py-3 px-3.5">
                          {isCapitalInflow && (
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-800/30">
                              Capital Inflow
                            </span>
                          )}
                          {isCapitalWithdrawal && (
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-950/30 text-amber-400 border border-amber-800/30">
                              Capital Refund
                            </span>
                          )}
                          {isProfitWithdrawal && (
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-rose-950/30 text-rose-400 border border-rose-800/30">
                              Profit Drawing
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-white">
                          {t.recipientOrSource || t.category}
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                              t.mode === "Cash"
                                ? "bg-amber-950/20 text-amber-400 border-amber-800/30"
                                : "bg-blue-950/20 text-blue-400 border-blue-800/30"
                            }`}
                          >
                            {t.mode}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-3.5 text-right font-mono font-bold ${
                            isCapitalInflow
                              ? "text-[#22C55E]"
                              : isCapitalWithdrawal
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {isCapitalInflow ? "+" : "-"}
                          {formatINR(t.amount)}
                        </td>
                        <td className="py-3 px-3.5 text-[#A1A1AA]">
                          {t.remarks || "-"}
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
                  <td colSpan={5} className="py-3.5 px-3.5">
                    Net Retained Capital (Injected - Refunds - Profit Drawings)
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono text-[#22C55E]">
                    {formatINR(metrics.netCapitalInjected - metrics.profitWithdrawalsTotal)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Loans & Debt */}
      {activeTab === "loans" && (
        <div className="flex flex-col gap-4">
          {/* Debt Summary KPI Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#0e0e0e] border border-emerald-900/40 rounded-xl p-3.5 flex flex-col gap-1 shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Outstanding Principal Debt
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-white">
                {formatINR(metrics.outstandingLoansPrincipal)}
              </span>
              <span className="text-[11px] text-[#71717A]">
                Net active borrowing liability
              </span>
            </div>

            <div className="bg-[#0e0e0e] border border-[#262626] rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Total Borrowed Inward
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-white">
                {formatINR(metrics.loansBorrowedTotal)}
              </span>
              <span className="text-[11px] text-[#71717A]">
                Bank: {formatINRCompact(metrics.loansBorrowedBank)} | Cash: {formatINRCompact(metrics.loansBorrowedCash)}
              </span>
            </div>

            <div className="bg-[#0e0e0e] border border-[#262626] rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Principal Repaid
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-[#22C55E]">
                {formatINR(metrics.loansRepaidTotal)}
              </span>
              <span className="text-[11px] text-[#71717A]">
                Bank: {formatINRCompact(metrics.loansRepaidBank)} | Cash: {formatINRCompact(metrics.loansRepaidCash)}
              </span>
            </div>

            <div className="bg-[#0e0e0e] border border-amber-900/30 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Total Finance Costs Paid
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-amber-400">
                {formatINR(metrics.totalFinanceCosts)}
              </span>
              <span className="text-[11px] text-[#71717A]">
                Interest: {formatINRCompact(metrics.loansInterestPaidTotal)} | Profit Share: {formatINRCompact(metrics.loansProfitSharePaidTotal)}
              </span>
            </div>
          </div>

          {/* Loan Facilities Registry */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-emerald-400" />
                <span>Loan Agreements &amp; Facilities ({loans.length})</span>
              </h3>
              {onOpenNewLoanModal && (
                <button
                  onClick={onOpenNewLoanModal}
                  className="btn-action-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Add Loan Agreement</span>
                </button>
              )}
            </div>

            {loans.length === 0 ? (
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-8 text-center flex flex-col items-center gap-3">
                <HandCoins className="w-8 h-8 text-[#555555]" />
                <div className="text-sm font-semibold text-white">No loan facilities registered</div>
                <p className="text-xs text-[#71717A] max-w-sm">
                  Add commercial bank term loans or family/friend venture debt to track borrowings, interest payments, and profit sharing.
                </p>
                {onOpenNewLoanModal && (
                  <button
                    onClick={onOpenNewLoanModal}
                    className="btn-action-primary px-4 py-2 rounded-lg text-xs font-semibold mt-1"
                  >
                    + Add First Loan Facility
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {loans.map((l) => {
                  const loanMetric = metrics.loanMetrics?.find(
                    (m) => m.loan.loanCode === l.loanCode || m.loan.id === l.id
                  );
                  const borrowed = loanMetric?.totalBorrowed ?? l.principalAmount;
                  const repaid = loanMetric?.principalRepaidTotal ?? 0;
                  const outstanding = loanMetric?.outstandingPrincipal ?? l.principalAmount;
                  const interestPaid = loanMetric?.interestPaidTotal ?? 0;
                  const profitSharePaid = loanMetric?.profitSharePaidTotal ?? 0;
                  const progressPct =
                    loanMetric?.repaymentProgressPct ??
                    (borrowed > 0 ? Math.min(100, Math.round((repaid / borrowed) * 100)) : 0);

                  return (
                    <div
                      key={l.id}
                      className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-md hover:border-[#444444] transition-all duration-150"
                    >
                      {/* Facility Header */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-white">
                              {l.lenderName}
                            </span>
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626]">
                              {l.loanCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#A1A1AA] mt-1 flex-wrap">
                            <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1a1a1a] text-[#D4D4D8] border border-[#2a2a2a]">
                              {l.lenderType.replace("_", " ")}
                            </span>
                            {l.linkedPropertyCode && (
                              <span className="text-[11px] text-[#F59E0B] font-mono">
                                Linked: {l.linkedPropertyCode}
                              </span>
                            )}
                            <span className="text-[11px] text-[#71717A]">
                              Started {formatDateIN(l.startDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {onEditLoan && (
                            <button
                              type="button"
                              onClick={() => onEditLoan(l)}
                              className="btn-action-primary p-2 rounded-lg"
                              title="Edit Loan Agreement"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#22C55E]" />
                            </button>
                          )}
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                              l.status === "closed"
                                ? "bg-green-950/40 text-green-400 border border-green-800/40"
                                : l.status === "active"
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                                : "bg-rose-950/40 text-rose-400 border border-rose-800/40"
                            }`}
                          >
                            {l.status}
                          </span>
                        </div>
                      </div>

                      {/* Financial Balances Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#050505] p-3 rounded-lg border border-[#1a1a1a]">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                            Sanctioned
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-white mt-0.5">
                            {formatINRCompact(l.principalAmount)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                            Outstanding
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-emerald-400 mt-0.5">
                            {formatINRCompact(outstanding)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#22C55E]">
                            Repaid
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-[#22C55E] mt-0.5">
                            {formatINRCompact(repaid)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                            Finance Paid
                          </div>
                          <div className="text-xs sm:text-sm font-bold font-mono text-amber-400 mt-0.5">
                            {formatINRCompact(interestPaid + profitSharePaid)}
                          </div>
                        </div>
                      </div>

                      {/* Terms & Profit Share Details */}
                      {((l.interestRatePct || 0) > 0 || (l.profitSharePct || 0) > 0 || l.notes) && (
                        <div className="text-xs text-[#A1A1AA] flex flex-col gap-1 bg-[#090909] p-2.5 rounded-lg border border-[#181818]">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            {(l.interestRatePct || 0) > 0 && (
                              <span>
                                Interest: <strong className="text-white font-mono">{l.interestRatePct}% p.a.</strong> (Paid: {formatINRCompact(interestPaid)})
                              </span>
                            )}
                            {(l.profitSharePct || 0) > 0 && (
                              <span className="text-emerald-400">
                                Profit Share: <strong className="font-mono font-bold">{l.profitSharePct}%</strong> (Paid: {formatINRCompact(profitSharePaid)})
                              </span>
                            )}
                          </div>
                          {l.profitShareTerms && (
                            <div className="text-[11px] text-[#888888] italic">
                              Terms: {l.profitShareTerms}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Repayment Progress Bar */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                          <span>Repayment Progress</span>
                          <span className="font-mono text-white font-bold">
                            {progressPct}% ({formatINRCompact(repaid)} / {formatINRCompact(borrowed)})
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Quick Action Logging Buttons */}
                      {onOpenEntryModal && (
                        <div className="flex items-center gap-1.5 pt-2 border-t border-[#1a1a1a] flex-wrap">
                          <button
                            type="button"
                            onClick={() => onOpenEntryModal("loan", undefined, l.loanCode)}
                            className="px-2.5 py-1.5 rounded-md bg-[#161616] hover:bg-[#222222] border border-[#2a2a2a] text-xs font-semibold text-emerald-400 transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Log Borrow / Repay</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dedicated Loan Transactions Ledger */}
          <div className="flex flex-col gap-2 pt-2">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Loan Transactions &amp; Repayment History ({loanTransactions.length})
            </h3>
            <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                    <th className="py-3 px-3.5">Trans ID</th>
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Loan Code</th>
                    <th className="py-3 px-3.5">Flow Type</th>
                    <th className="py-3 px-3.5">Payment Mode</th>
                    <th className="py-3 px-3.5 text-right">Amount</th>
                    <th className="py-3 px-3.5">Lender / Remarks</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818]">
                  {loanTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-[#71717A] text-sm font-medium"
                      >
                        No loan borrowings or repayments logged yet.
                      </td>
                    </tr>
                  ) : (
                    loanTransactions.map((t) => {
                      const isBorrow = t.transactionType === "loan_inflow";
                      const isRepay = t.transactionType === "loan_repayment";
                      const isInterest = t.transactionType === "loan_interest";
                      const isProfitShare = t.transactionType === "loan_profit_share";

                      return (
                        <tr key={t.id} className="hover:bg-[#141414] transition-colors">
                          <td className="py-3 px-3.5 font-mono text-[#A1A1AA] font-semibold">
                            {t.transCode || "-"}
                          </td>
                          <td className="py-3 px-3.5 text-[#D4D4D8]">
                            {formatDateIN(t.date)}
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold text-white">
                            {t.loanCode || "-"}
                          </td>
                          <td className="py-3 px-3.5">
                            {isBorrow && (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-800/30">
                                + Borrow Inflow
                              </span>
                            )}
                            {isRepay && (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-950/30 text-blue-400 border border-blue-800/30">
                                - Principal Repaid
                              </span>
                            )}
                            {isInterest && (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-950/30 text-amber-400 border border-amber-800/30">
                                - Interest Expense
                              </span>
                            )}
                            {isProfitShare && (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-purple-950/30 text-purple-400 border border-purple-800/30">
                                - Profit Share Paid
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5">
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                                t.mode === "Cash"
                                  ? "bg-amber-950/20 text-amber-400 border-amber-800/30"
                                  : "bg-blue-950/20 text-blue-400 border-blue-800/30"
                              }`}
                            >
                              {t.mode}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-3.5 text-right font-mono font-bold ${
                              isBorrow
                                ? "text-[#22C55E]"
                                : isRepay
                                ? "text-blue-400"
                                : "text-amber-400"
                            }`}
                          >
                            {isBorrow ? "+" : "-"}
                            {formatINR(t.amount)}
                          </td>
                          <td className="py-3 px-3.5 text-[#A1A1AA]">
                            {t.remarks || t.recipientOrSource || "-"}
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
                    <td colSpan={5} className="py-3.5 px-3.5">
                      Net Outstanding Debt Liability
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-emerald-400">
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

      {/* Tab 6: Transfers */}
      {activeTab === "transfers" && (
        <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                <th className="py-3 px-3.5">Transfer ID</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Transfer Type</th>
                <th className="py-3 px-3.5 text-right">Amount</th>
                <th className="py-3 px-3.5">Reference / Purpose</th>
                <th className="py-3 px-3.5">Notes</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-[#141414] transition-colors">
                  <td className="py-3 px-3.5 font-mono text-[#A1A1AA] font-semibold">
                    {t.transCode || "-"}
                  </td>
                  <td className="py-3 px-3.5 text-[#D4D4D8]">
                    {formatDateIN(t.date)}
                  </td>
                  <td className="py-3 px-3.5 text-white font-bold">
                    {t.transferType || "Bank Withdrawal to Cash"}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                    {formatINR(t.amount)}
                  </td>
                  <td className="py-3 px-3.5 text-[#D4D4D8]">
                    {t.recipientOrSource || "-"}
                  </td>
                  <td className="py-3 px-3.5 text-[#A1A1AA]">
                    {t.remarks || "-"}
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
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#0e0e0e] border-t-2 border-[#262626] font-bold text-white text-sm">
                <td colSpan={3} className="py-3.5 px-3.5">
                  Total Internal Transfers
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono text-white">
                  {formatINR(metrics.transfersBankToCash)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
