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
  Pencil,
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
  onEditProperty?: (property: SeedProperty) => void;
}

export const PropertyLedgerModal: React.FC<PropertyLedgerModalProps> = ({
  isOpen,
  onClose,
  propertyMetrics,
  personalPropertyData,
  onOpenEntryModal,
  onEditProperty,
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
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-modal"
      >
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-[#262626] flex items-start justify-between bg-[#0e0e0e] gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#383838] flex items-center justify-center text-white font-bold font-mono text-base">
              {prop.propertyCode.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {prop.name}
                </h2>
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626]">
                  {prop.propertyCode}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                    prop.status === "sold"
                      ? "bg-green-950/40 text-green-400 border border-green-800/40"
                      : prop.status === "in_progress"
                      ? "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                      : "bg-[#1c1c1c] text-[#A1A1AA] border border-[#383838]"
                  }`}
                >
                  {prop.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#A1A1AA] mt-1.5 flex-wrap font-medium">
                {prop.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#71717A]" />
                    {prop.location}
                  </span>
                )}
                {prop.acquisitionDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#71717A]" />
                    Acquired: {formatDateIN(prop.acquisitionDate)}
                  </span>
                )}
                {prop.sqftArea ? (
                  <span className="flex items-center gap-1 font-mono text-[#F59E0B] font-semibold">
                    <Maximize2 className="w-3.5 h-3.5" />
                    {prop.sqftArea.toLocaleString("en-IN")} sq.ft
                    {prop.ratePerSqft
                      ? ` @ ₹${prop.ratePerSqft.toLocaleString("en-IN")}/sqft`
                      : ""}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditProperty && (
              <button
                onClick={() => onEditProperty(prop)}
                className="btn-action-primary px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                title="Edit Valuation, Price & Details"
              >
                <Pencil className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="hidden sm:inline">Edit Property</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Financial Breakdown Cards */}
          {isCommercial && propertyMetrics && (
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#050505] p-4 rounded-xl border border-[#1a1a1a]">
                {/* 1. Agreed Buy Price */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                    1. Agreed Buy Price
                  </div>
                  <div className="text-lg md:text-xl font-bold font-mono text-white mt-1">
                    {formatINR(prop.agreedPurchasePrice)}
                  </div>
                  <div className="text-xs text-[#71717A] mt-0.5">
                    Seller Consideration
                  </div>
                </div>

                {/* 2. Total Property Expenses */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B] flex items-center gap-1">
                    <span>2. Property Expenses</span>
                    {isExpensesHigherThanBuy && (
                      <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                    )}
                  </div>
                  <div className="text-lg md:text-xl font-bold font-mono text-bold text-[#F59E0B] mt-1">
                    {formatINR(propertyMetrics.propertyExpenses)}
                  </div>
                  <div className="text-xs text-[#71717A] mt-0.5">
                    Stamp, Legal, DTCP, Fencing
                  </div>
                </div>

                {/* 3. Total Project Acquisition Outlay */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white">
                    Total Project Outlay
                  </div>
                  <div className="text-lg md:text-xl font-bold font-mono text-white mt-1">
                    {formatINR(propertyMetrics.totalProjectOutlay)}
                  </div>
                  <div className="text-xs text-[#71717A] mt-0.5">
                    Buy Price + All Expenses
                  </div>
                </div>

                {/* 4. Target & Selling Price */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
                    Target / Agreed Sale
                  </div>
                  <div className="text-lg md:text-xl font-bold font-mono text-[#22C55E] mt-1">
                    {prop.agreedSellingPrice
                      ? formatINR(prop.agreedSellingPrice)
                      : prop.targetSalePrice
                      ? formatINR(prop.targetSalePrice)
                      : "Not Listed"}
                  </div>
                  <div className="text-xs text-[#71717A] mt-0.5">
                    {propertyMetrics.projectedProfit !== 0 ? (
                      <span className="text-[#22C55E] font-medium">
                        Gain: +{formatINR(propertyMetrics.projectedProfit)}
                      </span>
                    ) : (
                      "Exit Valuation"
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-strip for Outstandings & Liquidity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0a0a0a] p-3.5 rounded-lg border border-[#1a1a1a] text-xs sm:text-sm">
                <div>
                  <span className="text-[#A1A1AA] text-xs font-medium block">
                    Paid to Seller (Bank)
                  </span>
                  <span className="font-mono text-white font-bold text-sm mt-0.5 block">
                    {formatINR(propertyMetrics.purchasePaidBank)}
                  </span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] text-xs font-medium block">
                    Paid to Seller (Cash)
                  </span>
                  <span className="font-mono text-white font-bold text-sm mt-0.5 block">
                    {formatINR(propertyMetrics.purchasePaidCash)}
                  </span>
                </div>
                <div>
                  <span className="text-[#F59E0B] text-xs font-semibold block">
                    Pending Payable to Seller
                  </span>
                  <span className="font-mono text-[#F59E0B] font-bold text-sm mt-0.5 block">
                    {formatINR(propertyMetrics.pendingOutflow)}
                  </span>
                </div>
                <div>
                  <span className="text-[#22C55E] text-xs font-semibold block">
                    Pending Receivable from Buyer
                  </span>
                  <span className="font-mono text-[#22C55E] font-bold text-sm mt-0.5 block">
                    {formatINR(propertyMetrics.pendingInflow)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Personal Mode Financial Breakdown */}
          {!isCommercial && personalPropertyData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-[#050505] p-4 rounded-xl border border-[#1a1a1a]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  Agreed Asset Cost
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-white mt-1">
                  {formatINR(prop.agreedPurchasePrice)}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
                  Total Invested So Far
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[#22C55E] mt-1">
                  {formatINR(personalPropertyData.totalInvested)}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
                  Remaining Commitment
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[#F59E0B] mt-1">
                  {formatINR(personalPropertyData.pendingCommitment)}
                </div>
              </div>
            </div>
          )}

          {/* Personal Mode Milestones Tracker */}
          {!isCommercial && prop.milestones && prop.milestones.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Construction &amp; Payment Milestones</span>
                <span className="text-xs text-[#A1A1AA] font-medium">
                  {prop.milestones.filter((m) => m.status === "completed").length}{" "}
                  of {prop.milestones.length} Stages Completed
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {prop.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border flex flex-col justify-between gap-2 ${
                      m.status === "completed"
                        ? "bg-green-950/20 border-green-800/40 text-white"
                        : "bg-[#111111] border-[#222222] text-[#A1A1AA]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-white">{m.name}</span>
                      {m.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#71717A]" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                      <span className="font-bold">{formatINR(m.targetAmount)}</span>
                      <span
                        className={`font-semibold uppercase ${
                          m.status === "completed"
                            ? "text-[#22C55E]"
                            : "text-[#71717A]"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row & Transaction Ledger Table */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Itemized Property Ledger</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626]">
                  {txs.length} Transactions
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Key Action: Log Outflow (Hover-to-White) */}
                <button
                  onClick={() => onOpenEntryModal("outflow", prop.propertyCode)}
                  className="btn-action-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Log Outflow</span>
                </button>
                {isCommercial && (
                  <button
                    onClick={() =>
                      onOpenEntryModal("inflow", prop.propertyCode)
                    }
                    className="btn-action-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Log Receipt</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#050505]">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                    <th className="py-3 px-3.5">Trans ID</th>
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Mode</th>
                    <th className="py-3 px-3.5 text-right">Amount</th>
                    <th className="py-3 px-3.5">Recipient / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818]">
                  {txs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-[#71717A] text-sm font-medium"
                      >
                        No transactions recorded for this property yet.
                      </td>
                    </tr>
                  ) : (
                    txs.map((t) => (
                      <tr key={t.id} className="hover:bg-[#101010] transition-colors">
                        <td className="py-3 px-3.5 font-mono text-[#A1A1AA] font-semibold">
                          {t.transCode || "-"}
                        </td>
                        <td className="py-3 px-3.5 text-[#D4D4D8]">
                          {formatDateIN(t.date)}
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
                            {t.mode === "Cash" ? (
                              <Banknote className="w-3 h-3" />
                            ) : (
                              <Landmark className="w-3 h-3" />
                            )}
                            {t.mode}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-3.5 text-right font-mono font-bold ${
                            t.transactionType === "deal_inflow"
                              ? "text-[#22C55E]"
                              : "text-white"
                          }`}
                        >
                          {t.transactionType === "deal_inflow" ? "+ " : ""}
                          {formatINR(t.amount)}
                        </td>
                        <td className="py-3 px-3.5 text-[#A1A1AA] max-w-[200px] truncate">
                          {t.remarks || t.recipientOrSource || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {txs.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#111111] border-t-2 border-[#262626] font-bold text-white text-sm">
                      <td colSpan={4} className="py-3.5 px-3.5">
                        Total Recorded for {prop.propertyCode}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono text-[#22C55E]">
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
        <div className="p-3.5 border-t border-[#262626] bg-[#0c0c0c] flex justify-between items-center gap-2">
          {onEditProperty ? (
            <button
              onClick={() => onEditProperty(prop)}
              className="btn-action-primary px-3.5 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Edit Property Valuations</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white text-xs sm:text-sm font-semibold hover:bg-[#252525] border border-[#383838] transition-all duration-150"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
