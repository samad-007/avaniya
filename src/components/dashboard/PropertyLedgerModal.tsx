"use client";

import React from "react";
import { formatINR, formatDateIN } from "@/lib/formatters";
import { PropertyFinancialMetrics } from "@/lib/formulaEngine";
import { SeedProperty, SeedTransaction } from "@/lib/seedData";
import {
  X,
  Calendar,
  MapPin,
  Maximize2,
  Plus,
  ArrowUpRight,
  Landmark,
  Banknote,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface PropertyLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyMetrics?: PropertyFinancialMetrics | null;
  personalPropertyData?: {
    property: SeedProperty;
    totalInvested: number;
    pendingCommitment: number;
    transactions: SeedTransaction[];
  } | null;
  onOpenEntryModal: (
    type: "outflow" | "inflow" | "transfer",
    propertyCode?: string
  ) => void;
}

export const PropertyLedgerModal: React.FC<PropertyLedgerModalProps> = ({
  isOpen,
  onClose,
  propertyMetrics,
  personalPropertyData,
  onOpenEntryModal,
}) => {
  if (!isOpen) return null;

  const isCommercial = !!propertyMetrics;
  const prop = isCommercial
    ? propertyMetrics?.property
    : personalPropertyData?.property;
  const txs = isCommercial
    ? propertyMetrics?.transactions || []
    : personalPropertyData?.transactions || [];

  if (!prop) return null;

  const isExpensesHigherThanBuy =
    isCommercial &&
    propertyMetrics &&
    propertyMetrics.propertyExpenses > prop.agreedPurchasePrice;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-[#222222] flex items-start justify-between bg-[#0e0e0e] gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-white font-bold font-mono">
              {prop.propertyCode.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {prop.name}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#161616] text-[#888888] border border-[#222222]">
                  {prop.propertyCode}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                    prop.status === "sold"
                      ? "bg-green-950/40 text-green-400 border border-green-800/40"
                      : prop.status === "in_progress"
                      ? "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                      : "bg-[#1c1c1c] text-[#999999] border border-[#333333]"
                  }`}
                >
                  {prop.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#888888] mt-1 flex-wrap">
                {prop.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#666666]" />
                    {prop.location}
                  </span>
                )}
                {prop.acquisitionDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#666666]" />
                    Acquired: {formatDateIN(prop.acquisitionDate)}
                  </span>
                )}
                {prop.sqftArea ? (
                  <span className="flex items-center gap-1 font-mono text-[#F59E0B]">
                    <Maximize2 className="w-3 h-3" />
                    {prop.sqftArea.toLocaleString("en-IN")} sq.ft
                    {prop.ratePerSqft
                      ? ` @ ₹${prop.ratePerSqft.toLocaleString("en-IN")}/sqft`
                      : ""}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-standard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Financial Breakdown Cards */}
          {isCommercial && propertyMetrics && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#050505] p-3.5 rounded-lg border border-[#1a1a1a]">
                {/* 1. Agreed Buy Price */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#888888]">
                    1. Agreed Buy Price
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {formatINR(prop.agreedPurchasePrice)}
                  </div>
                  <div className="text-[10px] text-[#666666] mt-0.5">
                    Seller Consideration
                  </div>
                </div>

                {/* 2. Total Property Expenses */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#F59E0B] flex items-center gap-1">
                    <span>2. Property Expenses</span>
                    {isExpensesHigherThanBuy && (
                      <AlertCircle className="w-3 h-3 text-[#F59E0B]" />
                    )}
                  </div>
                  <div className="text-base font-bold font-mono text-[#F59E0B] mt-0.5">
                    {formatINR(propertyMetrics.propertyExpenses)}
                  </div>
                  <div className="text-[10px] text-[#888888] mt-0.5">
                    Stamp, Legal, DTCP, Fencing
                  </div>
                </div>

                {/* 3. Total Project Acquisition Outlay */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white">
                    Total Project Outlay
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {formatINR(propertyMetrics.totalProjectOutlay)}
                  </div>
                  <div className="text-[10px] text-[#888888] mt-0.5">
                    Buy Price + All Expenses
                  </div>
                </div>

                {/* 4. Target & Selling Price */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#22C55E]">
                    Target / Agreed Sale
                  </div>
                  <div className="text-base font-bold font-mono text-[#22C55E] mt-0.5">
                    {prop.agreedSellingPrice
                      ? formatINR(prop.agreedSellingPrice)
                      : prop.targetSalePrice
                      ? formatINR(prop.targetSalePrice)
                      : "Not Listed"}
                  </div>
                  <div className="text-[10px] text-[#888888] mt-0.5">
                    {propertyMetrics.projectedProfit !== 0 ? (
                      <span className="text-[#22C55E]">
                        Gain: +{formatINR(propertyMetrics.projectedProfit)}
                      </span>
                    ) : (
                      "Exit Valuation"
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-strip for Outstandings & Liquidity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#0a0a0a] p-2.5 rounded border border-[#161616] text-xs">
                <div>
                  <span className="text-[#777777] text-[10px] block">
                    Paid to Seller (Bank)
                  </span>
                  <span className="font-mono text-white font-semibold">
                    {formatINR(propertyMetrics.purchasePaidBank)}
                  </span>
                </div>
                <div>
                  <span className="text-[#777777] text-[10px] block">
                    Paid to Seller (Cash)
                  </span>
                  <span className="font-mono text-white font-semibold">
                    {formatINR(propertyMetrics.purchasePaidCash)}
                  </span>
                </div>
                <div>
                  <span className="text-[#F59E0B] text-[10px] block">
                    Pending Payable to Seller
                  </span>
                  <span className="font-mono text-[#F59E0B] font-semibold">
                    {formatINR(propertyMetrics.pendingOutflow)}
                  </span>
                </div>
                <div>
                  <span className="text-[#22C55E] text-[10px] block">
                    Pending Receivable from Buyer
                  </span>
                  <span className="font-mono text-[#22C55E] font-semibold">
                    {formatINR(propertyMetrics.pendingInflow)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Personal Mode Financial Breakdown */}
          {!isCommercial && personalPropertyData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#050505] p-3 rounded-lg border border-[#1a1a1a]">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#888888]">
                  Agreed Asset Cost
                </div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {formatINR(prop.agreedPurchasePrice)}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#22C55E]">
                  Total Invested So Far
                </div>
                <div className="text-base font-bold font-mono text-[#22C55E] mt-0.5">
                  {formatINR(personalPropertyData.totalInvested)}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#F59E0B]">
                  Remaining Commitment
                </div>
                <div className="text-base font-bold font-mono text-[#F59E0B] mt-0.5">
                  {formatINR(personalPropertyData.pendingCommitment)}
                </div>
              </div>
            </div>
          )}

          {/* Personal Mode Milestones Tracker */}
          {!isCommercial && prop.milestones && prop.milestones.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Construction & Payment Milestones</span>
                <span className="text-[11px] text-[#888888] font-normal">
                  {prop.milestones.filter((m) => m.status === "completed").length}{" "}
                  of {prop.milestones.length} Stages Completed
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {prop.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border flex flex-col justify-between gap-1.5 ${
                      m.status === "completed"
                        ? "bg-green-950/20 border-green-800/40 text-white"
                        : "bg-[#111111] border-[#222222] text-[#888888]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white">{m.name}</span>
                      {m.status === "completed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#666666]" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>{formatINR(m.targetAmount)}</span>
                      <span
                        className={
                          m.status === "completed"
                            ? "text-[#22C55E]"
                            : "text-[#666666]"
                        }
                      >
                        {m.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row & Transaction Ledger Table */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Itemized Property Ledger</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161616] text-[#888888]">
                  {txs.length} Transactions
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenEntryModal("outflow", prop.propertyCode)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white text-black text-xs font-semibold hover:bg-[#e0e0e0] transition-standard"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>Log Outflow</span>
                </button>
                {isCommercial && (
                  <button
                    onClick={() =>
                      onOpenEntryModal("inflow", prop.propertyCode)
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161616] text-white border border-[#333333] text-xs font-medium hover:bg-[#222222] transition-standard"
                  >
                    <ArrowUpRight className="w-3 h-3 text-[#22C55E]" />
                    <span>Log Receipt</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="border border-[#222222] rounded-lg overflow-x-auto bg-[#050505]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111111] border-b border-[#222222] text-[#888888] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Trans ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Recipient / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]">
                  {txs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-[#666666] text-xs"
                      >
                        No transactions recorded for this property yet.
                      </td>
                    </tr>
                  ) : (
                    txs.map((t) => (
                      <tr key={t.id} className="hover:bg-[#0c0c0c] transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[#888888]">
                          {t.transCode || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-[#aaaaaa]">
                          {formatDateIN(t.date)}
                        </td>
                        <td className="py-2.5 px-3 text-white font-medium">
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
                            {t.mode === "Cash" ? (
                              <Banknote className="w-2.5 h-2.5" />
                            ) : (
                              <Landmark className="w-2.5 h-2.5" />
                            )}
                            {t.mode}
                          </span>
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-semibold ${
                            t.transactionType === "deal_inflow"
                              ? "text-[#22C55E]"
                              : "text-white"
                          }`}
                        >
                          {t.transactionType === "deal_inflow" ? "+ " : ""}
                          {formatINR(t.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-[#888888] max-w-[200px] truncate">
                          {t.remarks || t.recipientOrSource || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {txs.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#111111] border-t-2 border-[#222222] font-semibold text-white">
                      <td colSpan={4} className="py-2.5 px-3">
                        Total Recorded for {prop.propertyCode}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#22C55E]">
                        {formatINR(
                          txs.reduce((sum, t) => sum + (t.amount || 0), 0)
                        )}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#222222] bg-[#0c0c0c] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#1a1a1a] text-white text-xs font-medium hover:bg-[#252525] border border-[#333333] transition-standard"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
