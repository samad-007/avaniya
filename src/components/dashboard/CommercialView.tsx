"use client";

import React, { useState } from "react";
import { formatINR, formatINRCompact, formatDateIN } from "@/lib/formatters";
import {
  CommercialDashboardMetrics,
  PropertyFinancialMetrics,
} from "@/lib/formulaEngine";
import { SeedTransaction } from "@/lib/seedData";
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
} from "lucide-react";

interface CommercialViewProps {
  metrics: CommercialDashboardMetrics;
  transactions: SeedTransaction[];
  onSelectProperty: (propertyMetric: PropertyFinancialMetrics) => void;
  onOpenNewDealModal: () => void;
}

export const CommercialView: React.FC<CommercialViewProps> = ({
  metrics,
  transactions,
  onSelectProperty,
  onOpenNewDealModal,
}) => {
  const [activeTab, setActiveTab] = useState<
    "deals" | "outflows" | "inflows" | "capital" | "transfers" | "accounts"
  >("deals");
  const [layoutVariant, setLayoutVariant] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMetrics = metrics.propertyMetrics.filter(
    (pm) =>
      pm.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pm.property.propertyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pm.property.location &&
        pm.property.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const outflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "outflow"
  );
  const dealInflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "deal_inflow"
  );
  const capitalInflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "capital_inflow"
  );
  const transfers = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "transfer"
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#222222] overflow-x-auto pb-0.5 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("deals")}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-standard ${
              activeTab === "deals"
                ? "border-white text-white font-semibold"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            1. Land Deals Master ({metrics.propertyMetrics.length})
          </button>
          <button
            onClick={() => setActiveTab("outflows")}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-standard ${
              activeTab === "outflows"
                ? "border-white text-white font-semibold"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            2. Property Outflows ({formatINRCompact(metrics.outflowsTotal)})
          </button>
          <button
            onClick={() => setActiveTab("inflows")}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-standard ${
              activeTab === "inflows"
                ? "border-white text-white font-semibold"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            3. Sale Receipts ({formatINRCompact(metrics.dealInflowsTotal)})
          </button>
          <button
            onClick={() => setActiveTab("capital")}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-standard ${
              activeTab === "capital"
                ? "border-white text-white font-semibold"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            4. Capital Funding ({formatINRCompact(metrics.capitalInjectedTotal)})
          </button>
          <button
            onClick={() => setActiveTab("transfers")}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-standard ${
              activeTab === "transfers"
                ? "border-white text-white font-semibold"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            5. Cash & Bank Transfers
          </button>
        </div>

        {/* View Toggle (Cards vs Table for Deals) */}
        {activeTab === "deals" && (
          <div className="flex items-center gap-1 bg-[#111111] p-0.5 rounded border border-[#222222]">
            <button
              onClick={() => setLayoutVariant("cards")}
              className={`p-1 rounded text-xs transition-standard ${
                layoutVariant === "cards"
                  ? "bg-[#222222] text-white"
                  : "text-[#888888] hover:text-white"
              }`}
              title="Visual Pipeline Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutVariant("table")}
              className={`p-1 rounded text-xs transition-standard ${
                layoutVariant === "table"
                  ? "bg-[#222222] text-white"
                  : "text-[#888888] hover:text-white"
              }`}
              title="Dense Ledger Matrix"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Land Deals Master */}
      {activeTab === "deals" && (
        <div className="flex flex-col gap-3">
          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#666666] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter properties or location..."
                className="w-full pl-8 pr-3 py-1.5 rounded bg-[#0e0e0e] border border-[#222222] text-xs text-white placeholder-[#666666] outline-none focus:border-[#444444] transition-standard"
              />
            </div>
            <button
              onClick={onOpenNewDealModal}
              className="px-3 py-1.5 rounded bg-white text-black text-xs font-semibold hover:bg-[#e0e0e0] transition-standard flex items-center gap-1.5"
            >
              <span>+ Add New Land Deal</span>
            </button>
          </div>

          {/* Option B: Visual Pipeline Cards with Explicit 4-Price Matrix */}
          {layoutVariant === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                    className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-4 flex flex-col justify-between gap-3 cursor-pointer hover:border-[#383838] hover:bg-[#0d0d0d] transition-standard group shadow-sm"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white group-hover:text-[#22C55E] transition-colors">
                            {pm.property.name}
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161616] text-[#888888] border border-[#222222]">
                            {pm.property.propertyCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[#777777] mt-0.5">
                          {pm.property.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              {pm.property.location}
                            </span>
                          )}
                          {pm.property.sqftArea ? (
                            <span className="font-mono text-[#F59E0B]">
                              {pm.property.sqftArea.toLocaleString("en-IN")}{" "}
                              sq.ft
                              {pm.property.ratePerSqft
                                ? ` @ ₹${pm.property.ratePerSqft.toLocaleString("en-IN")}/sqft`
                                : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          pm.property.status === "sold"
                            ? "bg-green-950/40 text-green-400 border border-green-800/40"
                            : pm.property.status === "in_progress"
                            ? "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                            : "bg-[#181818] text-[#888888] border border-[#2a2a2a]"
                        }`}
                      >
                        {pm.property.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Financial Matrix (Agreed Buy, Expenses, Target Price, Selling Price) */}
                    <div className="grid grid-cols-2 gap-2 bg-[#050505] p-2.5 rounded border border-[#161616]">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#777777]">
                          1. Agreed Buy Price
                        </div>
                        <div className="text-xs font-bold font-mono text-white">
                          {formatINR(pm.property.agreedPurchasePrice)}
                        </div>
                        <div className="text-[9px] text-[#555555]">
                          Seller Consideration
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#F59E0B]">
                          2. Property Expenses
                        </div>
                        <div className="text-xs font-bold font-mono text-[#F59E0B]">
                          {formatINR(pm.propertyExpenses)}
                        </div>
                        <div className="text-[9px] text-[#666666]">
                          {isExpensesHigherThanBuy
                            ? "Exceeds Buy Price"
                            : "Stamp, Legal, DTCP, Fencing"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#3B82F6]">
                          3. Target Sale Exit
                        </div>
                        <div className="text-xs font-bold font-mono text-[#3B82F6]">
                          {pm.property.targetSalePrice
                            ? formatINR(pm.property.targetSalePrice)
                            : "Not Set"}
                        </div>
                        <div className="text-[9px] text-[#555555]">
                          Market Exit Valuation
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#22C55E]">
                          4. Agreed Selling Price
                        </div>
                        <div className="text-xs font-bold font-mono text-[#22C55E]">
                          {pm.property.agreedSellingPrice
                            ? formatINR(pm.property.agreedSellingPrice)
                            : "Pipeline"}
                        </div>
                        <div className="text-[9px] text-[#555555]">
                          Buyer Agreed Price
                        </div>
                      </div>
                    </div>

                    {/* Total Outlay & Profit Summary */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-[#161616]">
                      <span className="text-[#888888]">
                        Total Outlay:{" "}
                        <strong className="text-white font-mono">
                          {formatINR(pm.totalProjectOutlay)}
                        </strong>
                      </span>
                      {pm.projectedProfit !== 0 && (
                        <span className="font-mono text-[#22C55E] font-medium">
                          +{formatINR(pm.projectedProfit)} Gain
                        </span>
                      )}
                    </div>

                    {/* Funding Progress Bar */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] text-[#777777]">
                        <span>Seller Payment Progress</span>
                        <span className="font-mono text-white font-medium">
                          {fundedPct}% ({formatINRCompact(pm.purchasePaidTotal)})
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
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

          {/* Option A: Dense Ledger Matrix */}
          {layoutVariant === "table" && (
            <div className="border border-[#222222] rounded-lg overflow-x-auto bg-[#0a0a0a]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111111] border-b border-[#222222] text-[#888888] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Land ID</th>
                    <th className="py-2.5 px-3">Property / Location</th>
                    <th className="py-2.5 px-3">Acquired</th>
                    <th className="py-2.5 px-3 text-right">Agreed Buy</th>
                    <th className="py-2.5 px-3 text-right text-[#F59E0B]">
                      Expenses
                    </th>
                    <th className="py-2.5 px-3 text-right font-semibold">
                      Total Outlay
                    </th>
                    <th className="py-2.5 px-3 text-right">Paid (Cash)</th>
                    <th className="py-2.5 px-3 text-right">Paid (Bank)</th>
                    <th className="py-2.5 px-3 text-right text-[#F59E0B]">
                      Pending to Seller
                    </th>
                    <th className="py-2.5 px-3 text-right text-[#3B82F6]">
                      Target Price
                    </th>
                    <th className="py-2.5 px-3 text-right text-[#22C55E]">
                      Selling Price
                    </th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]">
                  {filteredMetrics.map((pm) => (
                    <tr
                      key={pm.property.id}
                      onClick={() => onSelectProperty(pm)}
                      className="hover:bg-[#121212] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-[#888888]">
                        {pm.property.propertyCode}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">
                        {pm.property.name}
                      </td>
                      <td className="py-2.5 px-3 text-[#777777]">
                        {formatDateIN(pm.property.acquisitionDate)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatINR(pm.property.agreedPurchasePrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#F59E0B]">
                        {formatINR(pm.propertyExpenses)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                        {formatINR(pm.totalProjectOutlay)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#888888]">
                        {formatINR(pm.purchasePaidCash)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#888888]">
                        {formatINR(pm.purchasePaidBank)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#F59E0B]">
                        {formatINR(pm.pendingOutflow)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#3B82F6]">
                        {pm.property.targetSalePrice
                          ? formatINR(pm.property.targetSalePrice)
                          : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#22C55E]">
                        {pm.property.agreedSellingPrice
                          ? formatINR(pm.property.agreedSellingPrice)
                          : "-"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161616] text-[#888888] border border-[#222222]">
                          {pm.property.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#0e0e0e] border-t-2 border-[#222222] font-semibold text-white text-xs">
                    <td colSpan={3} className="py-2.5 px-3">
                      Total Across All Land Deals
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatINR(metrics.totalAgreedBuyPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#F59E0B]">
                      {formatINR(metrics.totalPropertyExpenses)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-white">
                      {formatINR(metrics.totalProjectOutlay)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#888888]">
                      {formatINR(metrics.outflowsCash)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#888888]">
                      {formatINR(metrics.outflowsBank)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#F59E0B]">
                      {formatINR(metrics.totalPendingPayable)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#3B82F6]">
                      {formatINR(metrics.totalTargetSalePrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#22C55E]">
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
        <div className="border border-[#222222] rounded-lg overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#222222] text-[#888888] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Trans ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Land ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3 text-right">Amount Paid</th>
                <th className="py-2.5 px-3">Paid To / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {outflows.map((t) => (
                <tr key={t.id} className="hover:bg-[#121212] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[#888888]">
                    {t.transCode || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-[#aaaaaa]">
                    {formatDateIN(t.date)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-white">
                    {t.propertyCode || "-"}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-white">
                    {t.category}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        t.mode === "Cash"
                          ? "bg-amber-950/20 text-amber-400 border-amber-800/30"
                          : "bg-blue-950/20 text-blue-400 border-blue-800/30"
                      }`}
                    >
                      {t.mode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                    {formatINR(t.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-[#888888]">
                    {t.remarks || t.recipientOrSource || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#0e0e0e] border-t-2 border-[#222222] font-semibold text-white">
                <td colSpan={5} className="py-2.5 px-3">
                  Total Outflows Paid
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-[#22C55E]">
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
        <div className="border border-[#222222] rounded-lg overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#222222] text-[#888888] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Receipt ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Land ID</th>
                <th className="py-2.5 px-3">Receipt Type</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3 text-right">Amount Received</th>
                <th className="py-2.5 px-3">Received From / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {dealInflows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-[#666666] text-xs"
                  >
                    No buyer sale receipts logged yet.
                  </td>
                </tr>
              ) : (
                dealInflows.map((t) => (
                  <tr key={t.id} className="hover:bg-[#121212] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#888888]">
                      {t.transCode || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-[#aaaaaa]">
                      {formatDateIN(t.date)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white">
                      {t.propertyCode || "-"}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">
                      {t.category}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border bg-blue-950/20 text-blue-400 border-blue-800/30">
                        {t.mode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#22C55E]">
                      {formatINR(t.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-[#888888]">
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
        <div className="border border-[#222222] rounded-lg overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#222222] text-[#888888] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Inflow ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Source / Description</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3 text-right">Amount Injected</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {capitalInflows.map((t) => (
                <tr key={t.id} className="hover:bg-[#121212] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[#888888]">
                    {t.transCode || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-[#aaaaaa]">
                    {formatDateIN(t.date)}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-white">
                    {t.recipientOrSource || t.category}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        t.mode === "Cash"
                          ? "bg-amber-950/20 text-amber-400 border-amber-800/30"
                          : "bg-blue-950/20 text-blue-400 border-blue-800/30"
                      }`}
                    >
                      {t.mode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                    {formatINR(t.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-[#888888]">
                    {t.remarks || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#0e0e0e] border-t-2 border-[#222222] font-semibold text-white">
                <td colSpan={4} className="py-2.5 px-3">
                  Total External Capital Injected
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-[#22C55E]">
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
        <div className="border border-[#222222] rounded-lg overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#222222] text-[#888888] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Transfer ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Transfer Type</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Reference / Purpose</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-[#121212] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[#888888]">
                    {t.transCode || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-[#aaaaaa]">
                    {formatDateIN(t.date)}
                  </td>
                  <td className="py-2.5 px-3 text-white font-medium">
                    {t.transferType || "Bank Withdrawal to Cash"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                    {formatINR(t.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-[#aaaaaa]">
                    {t.recipientOrSource || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-[#888888]">
                    {t.remarks || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#0e0e0e] border-t-2 border-[#222222] font-semibold text-white">
                <td colSpan={3} className="py-2.5 px-3">
                  Total Internal Transfers
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-white">
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
