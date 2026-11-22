"use client";

import React from "react";
import { formatINR, formatDateIN } from "@/lib/formatters";
import { PropertyFinancialMetrics } from "@/lib/formulaEngine";
import { SeedProperty, SeedTransaction } from "@/lib/seedData";
import {
  formatPropertyWhatsApp,
  openWhatsAppShare,
} from "@/lib/whatsappSummary";
import {
  X,
  Calendar,
  MapPin,
  Maximize2,
  Plus,
  ArrowDownRight,
  Landmark,
  Banknote,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pencil,
  Share2,
  Link2,
  Users,
  LayoutGrid,
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

export const PropertyLedgerModal: React.FC<PropertyLedgerModalProps> = ({
  isOpen,
  onClose,
  propertyMetrics,
  personalPropertyData,
  onOpenEntryModal,
  onEditProperty,
  onEditTransaction,
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
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full min-w-0 max-h-[92vh] flex flex-col shadow-modal overflow-hidden my-auto animate-modal"
      >
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80 gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold font-mono text-sm flex-shrink-0">
              {prop.propertyCode.slice(0, 3)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight break-words">
                  {prop.name}
                </h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                  {prop.propertyCode}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    prop.status === "sold"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : prop.status === "in_progress"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {formatStatusLabel(prop.status)}
                </span>
                {prop.agreementDueDate && (
                  <span
                    className={`flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      propertyMetrics?.deadlineStatus === "overdue"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : propertyMetrics?.deadlineStatus === "urgent"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    Due {formatDateIN(prop.agreementDueDate)}
                    {propertyMetrics?.daysToDeadline !== undefined && (
                      <span className="text-[11px]">
                        (
                        {propertyMetrics.daysToDeadline < 0
                          ? `${Math.abs(propertyMetrics.daysToDeadline)}d overdue`
                          : propertyMetrics.daysToDeadline === 0
                          ? "due today"
                          : `${propertyMetrics.daysToDeadline}d left`}
                        )
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap font-medium">
                {prop.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {prop.location}
                  </span>
                )}
                {prop.acquisitionDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Acquired {formatDateIN(prop.acquisitionDate)}
                  </span>
                )}
                {prop.sqftArea ? (
                  <span className="flex items-center gap-1 font-mono text-amber-700 font-semibold">
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

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {isCommercial && propertyMetrics && (
              <button
                type="button"
                onClick={() =>
                  openWhatsAppShare(formatPropertyWhatsApp(propertyMetrics))
                }
                className="p-2 sm:px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Share summary on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}

            {prop.attachmentUrl && (
              <a
                href={prop.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 sm:px-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Open attached documents"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Docs</span>
              </a>
            )}

            {onEditProperty && (
              <button
                onClick={() => onEditProperty(prop)}
                className="btn-action-secondary px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"
                title="Edit property details and prices"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Edit Details</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto overflow-x-hidden flex-1 flex flex-col gap-5 w-full min-w-0">
          {/* Commercial Financial Breakdown */}
          {isCommercial && propertyMetrics && (
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    Buy Price
                  </div>
                  <div className="text-lg md:text-xl font-bold font-mono text-slate-900 mt-1">
                    {formatINR(prop.agreedPurchasePrice)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Agreed with seller
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <span>Extra Costs</span>
                    {isExpensesHigherThanBuy && (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </div>
                  <div className="text-lg md:text-xl font-bold font-mono text-amber-700 mt-1">
                    {formatINR(propertyMetrics.propertyExpenses)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Stamp, legal, approvals
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    Total Deal Cost
                  </div>
                  <div className="text-lg md:text-xl font-bold font-mono text-slate-900 mt-1">
                    {formatINR(propertyMetrics.totalProjectOutlay)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Buy price + extra costs
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-emerald-700">
                    Sale Price
                  </div>
                  <div className="text-lg md:text-xl font-bold font-mono text-emerald-700 mt-1">
                    {prop.agreedSellingPrice
                      ? formatINR(prop.agreedSellingPrice)
                      : prop.targetSalePrice
                      ? formatINR(prop.targetSalePrice)
                      : "Not set"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {prop.status === "sold" || prop.status === "closed" ? (
                      propertyMetrics.realizedProfit > 0 ? (
                        <span className="text-emerald-700 font-semibold">
                          Profit: +{formatINR(propertyMetrics.realizedProfit)}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">
                          Recovering cost
                        </span>
                      )
                    ) : propertyMetrics.projectedProfit !== 0 ? (
                      <span className="text-violet-700 font-semibold">
                        Est. profit: +{formatINR(propertyMetrics.projectedProfit)}
                      </span>
                    ) : (
                      "Expected exit value"
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-strip for Payments & Balances */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 text-xs sm:text-sm shadow-soft">
                <div>
                  <span className="text-slate-500 text-xs font-medium block">
                    Paid to Seller (Bank)
                  </span>
                  <span className="font-mono text-slate-900 font-bold text-sm mt-0.5 block">
                    {formatINR(propertyMetrics.purchasePaidBank)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">
                    Paid to Seller (Cash)
                  </span>
                  <span className="font-mono text-slate-900 font-bold text-sm mt-0.5 block">
                    {formatINR(propertyMetrics.purchasePaidCash)}
                  </span>
                </div>
                <div>
                  <span className="text-amber-700 text-xs font-semibold block">
                    Still Owed to Seller
                  </span>
                  <span className="font-mono text-amber-700 font-bold text-sm mt-0.5 block">
                    {formatINR(propertyMetrics.pendingOutflow)}
                  </span>
                  {propertyMetrics.sellerPaidExpenses > 0 && (
                    <span className="text-[11px] text-amber-600 block mt-0.5">
                      (-{formatINR(propertyMetrics.sellerPaidExpenses)} paid on their behalf)
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-emerald-700 text-xs font-semibold block">
                    Buyer Still Owes You
                  </span>
                  <span className="font-mono text-emerald-700 font-bold text-sm mt-0.5 block">
                    {formatINR(propertyMetrics.pendingInflow)}
                  </span>
                  {propertyMetrics.buyerPaidExpenses > 0 && (
                    <span className="text-[11px] text-blue-600 block mt-0.5">
                      (+{formatINR(propertyMetrics.buyerPaidExpenses)} billed to buyer)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Personal Mode Financial Breakdown */}
          {!isCommercial && personalPropertyData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Total Property Cost
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-slate-900 mt-1">
                  {formatINR(prop.agreedPurchasePrice)}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-emerald-700">
                  Paid So Far
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-emerald-700 mt-1">
                  {formatINR(personalPropertyData.totalInvested)}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-amber-700">
                  Balance Left to Pay
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-amber-700 mt-1">
                  {formatINR(personalPropertyData.pendingCommitment)}
                </div>
              </div>
            </div>
          )}

          {/* Personal Mode Milestones */}
          {!isCommercial && prop.milestones && prop.milestones.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Payment Milestones</span>
                <span className="text-xs text-slate-500 font-medium">
                  {prop.milestones.filter((m) => m.status === "completed").length}{" "}
                  of {prop.milestones.length} completed
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {prop.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 ${
                      m.status === "completed"
                        ? "bg-emerald-50/70 border-emerald-200 text-slate-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-slate-900">
                        {m.name}
                      </span>
                      {m.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                      <span className="font-bold text-slate-900">
                        {formatINR(m.targetAmount)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold uppercase ${
                          m.status === "completed"
                            ? "text-emerald-700"
                            : "text-slate-400"
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

          {/* Sub-Plots Inventory */}
          {isCommercial && prop.subPlots && prop.subPlots.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-600" />
                  <span>Sub-Plots ({prop.subPlots.length})</span>
                </div>
                {propertyMetrics?.subPlotStats && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      {propertyMetrics.subPlotStats.sold} Sold
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                      {propertyMetrics.subPlotStats.booked} Booked
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                      {propertyMetrics.subPlotStats.available} Available
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full min-w-0 border border-slate-200 rounded-2xl overflow-x-auto bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3.5">Plot #</th>
                      <th className="py-2.5 px-3.5">Area (Sq.ft)</th>
                      <th className="py-2.5 px-3.5 text-right">Target Price</th>
                      <th className="py-2.5 px-3.5">Status</th>
                      <th className="py-2.5 px-3.5">Buyer</th>
                      <th className="py-2.5 px-3.5 text-right">Sold Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prop.subPlots.map((sp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                          Plot #{sp.plotNumber}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-600">
                          {sp.sqftArea
                            ? `${sp.sqftArea.toLocaleString("en-IN")} sqft`
                            : "-"}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono text-slate-900">
                          {sp.targetPrice ? formatINR(sp.targetPrice) : "-"}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
                              sp.status === "sold"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : sp.status === "booked"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {sp.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-700">
                          {sp.buyerName || "-"}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-emerald-700">
                          {sp.status === "sold"
                            ? formatINR(sp.targetPrice)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* JV Partners */}
          {isCommercial && prop.partners && prop.partners.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-600" />
                <span>Partners Equity Split ({prop.partners.length})</span>
              </div>

              <div className="w-full min-w-0 border border-slate-200 rounded-2xl overflow-x-auto bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3.5">Partner</th>
                      <th className="py-2.5 px-3.5 text-right">Share %</th>
                      <th className="py-2.5 px-3.5 text-right">Committed</th>
                      <th className="py-2.5 px-3.5 text-right">Cost Share</th>
                      <th className="py-2.5 px-3.5 text-right">Earned Profit</th>
                      <th className="py-2.5 px-3.5 text-right">Expected Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prop.partners.map((partner, idx) => {
                      const alloc = propertyMetrics?.partnerAllocations?.find(
                        (pa) => pa.name === partner.name
                      );
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                            {partner.name}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-violet-700">
                            {partner.equityPct}%
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-slate-700">
                            {partner.capitalCommitted
                              ? formatINR(partner.capitalCommitted)
                              : "-"}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-slate-600">
                            {alloc ? formatINR(alloc.costShare) : "-"}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-emerald-700">
                            {alloc ? formatINR(alloc.realizedProfitShare) : "-"}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-slate-900">
                            {alloc
                              ? formatINR(alloc.projectedProfitShare)
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions History */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>All Transactions for This Property</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {txs.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenEntryModal("outflow", prop.propertyCode)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Record Payment</span>
                </button>
                {isCommercial && (
                  <button
                    onClick={() =>
                      onOpenEntryModal("inflow", prop.propertyCode)
                    }
                    className="btn-action-brand flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Record Receipt</span>
                  </button>
                )}
              </div>
            </div>

            <div className="w-full min-w-0 border border-slate-200 rounded-2xl overflow-x-auto bg-white">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-3 px-3.5">ID</th>
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Mode</th>
                    <th className="py-3 px-3.5 text-right">Amount</th>
                    <th className="py-3 px-3.5">Party / Notes</th>
                    <th className="py-3 px-3.5 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-slate-400 text-sm font-medium"
                      >
                        No transactions recorded for this property yet.
                      </td>
                    </tr>
                  ) : (
                    txs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 font-mono text-slate-500 text-xs font-semibold">
                          {t.transCode || "-"}
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                          {formatDateIN(t.date)}
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{t.category}</span>
                            {t.subPlotNumber && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Plot #{t.subPlotNumber}
                              </span>
                            )}
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
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              t.mode === "Cash"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
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
                              ? "text-emerald-700"
                              : "text-slate-900"
                          }`}
                        >
                          {t.transactionType === "deal_inflow" ? "+ " : ""}
                          {formatINR(t.amount)}
                        </td>
                        <td className="py-3 px-3.5 text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="max-w-[200px] truncate">
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
                        <td className="py-3 px-3.5 text-right">
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
                {txs.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900 text-sm">
                      <td colSpan={4} className="py-3.5 px-3.5">
                        Total Recorded for {prop.propertyCode}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono text-emerald-700">
                        {formatINR(
                          txs.reduce((sum, t) => sum + (t.amount || 0), 0)
                        )}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex justify-between items-center gap-2">
          {onEditProperty ? (
            <button
              onClick={() => onEditProperty(prop)}
              className="btn-action-secondary px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Property Prices &amp; Details</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            className="btn-action-primary px-4 py-2 rounded-xl text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
