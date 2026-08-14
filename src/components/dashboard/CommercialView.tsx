"use client";

import React, { useState, useMemo } from "react";
import { formatINR, formatINRCompact, formatDateIN } from "@/lib/formatters";
import {
  CommercialDashboardMetrics,
  PropertyFinancialMetrics,
} from "@/lib/formulaEngine";
import { SeedProperty, SeedTransaction } from "@/lib/seedData";
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
} from "lucide-react";

interface CommercialViewProps {
  metrics: CommercialDashboardMetrics;
  transactions: SeedTransaction[];
  onSelectProperty: (propertyMetric: PropertyFinancialMetrics) => void;
  onOpenNewDealModal: () => void;
  onEditProperty?: (property: SeedProperty) => void;
}

export const CommercialView: React.FC<CommercialViewProps> = ({
  metrics,
  transactions,
  onSelectProperty,
  onOpenNewDealModal,
  onEditProperty,
}) => {
  const [activeTab, setActiveTab] = useState<
    "deals" | "outflows" | "inflows" | "capital" | "transfers" | "accounts"
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

  const capitalInflows = useMemo(
    () =>
      transactions.filter(
        (t) => t.scope === "commercial" && t.transactionType === "capital_inflow"
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

  return (
    <div className="flex flex-col gap-4">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#262626] overflow-x-auto pb-0.5 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("deals")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "deals"
                ? "border-white text-white"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            1. Land Deals Master ({metrics.propertyMetrics.length})
          </button>
          <button
            onClick={() => setActiveTab("outflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "outflows"
                ? "border-white text-white"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            2. Property Outflows ({formatINRCompact(metrics.outflowsTotal)})
          </button>
          <button
            onClick={() => setActiveTab("inflows")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "inflows"
                ? "border-white text-white"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            3. Sale Receipts ({formatINRCompact(metrics.dealInflowsTotal)})
          </button>
          <button
            onClick={() => setActiveTab("capital")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "capital"
                ? "border-white text-white"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            4. Capital Funding ({formatINRCompact(metrics.capitalInjectedTotal)})
          </button>
          <button
            onClick={() => setActiveTab("transfers")}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === "transfers"
                ? "border-white text-white"
                : "border-transparent text-[#A1A1AA] hover:text-white"
            }`}
          >
            5. Cash &amp; Bank Transfers
          </button>
        </div>

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
                      {pm.projectedProfit !== 0 && (
                        <span className="font-mono text-[#22C55E] font-bold">
                          +{formatINR(pm.projectedProfit)} Gain
                        </span>
                      )}
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
                <td></td>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {dealInflows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Capital Funding */}
      {activeTab === "capital" && (
        <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                <th className="py-3 px-3.5">Inflow ID</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Source / Description</th>
                <th className="py-3 px-3.5">Payment Mode</th>
                <th className="py-3 px-3.5 text-right">Amount Injected</th>
                <th className="py-3 px-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {capitalInflows.map((t) => (
                <tr key={t.id} className="hover:bg-[#141414] transition-colors">
                  <td className="py-3 px-3.5 font-mono text-[#A1A1AA] font-semibold">
                    {t.transCode || "-"}
                  </td>
                  <td className="py-3 px-3.5 text-[#D4D4D8]">
                    {formatDateIN(t.date)}
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
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                    {formatINR(t.amount)}
                  </td>
                  <td className="py-3 px-3.5 text-[#A1A1AA]">
                    {t.remarks || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#0e0e0e] border-t-2 border-[#262626] font-bold text-white text-sm">
                <td colSpan={4} className="py-3.5 px-3.5">
                  Total External Capital Injected
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono text-[#22C55E]">
                  {formatINR(metrics.capitalInjectedTotal)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab 5: Transfers */}
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
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
