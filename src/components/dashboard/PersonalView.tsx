"use client";

import React, { useState, useMemo } from "react";
import { formatINR, formatINRCompact, formatDateIN } from "@/lib/formatters";
import { PersonalDashboardMetrics } from "@/lib/formulaEngine";
import { SeedProperty, SeedTransaction } from "@/lib/seedData";
import {
  Home,
  Plus,
  MapPin,
  Pencil,
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
    type: "outflow" | "inflow" | "transfer",
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

  const personalOutflows = useMemo(
    () =>
      transactions.filter(
        (t) => t.scope === "personal" && t.transactionType === "outflow"
      ),
    [transactions]
  );

  const personalInflows = useMemo(
    () =>
      transactions.filter(
        (t) => t.scope === "personal" && t.transactionType === "capital_inflow"
      ),
    [transactions]
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

        {/* Key Ingress Action: Add Personal Property (Hover-to-White) */}
        <button
          onClick={onOpenNewPropertyModal}
          className="btn-action-primary px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Personal Property</span>
        </button>
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
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
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
              {personalOutflows.map((t) => (
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
                <td colSpan={4} className="py-3.5 px-3.5">
                  Total Personal Outflows
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

      {/* SubTab 3: Inflows */}
      {activeSubTab === "inflows" && (
        <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Source Description</th>
                <th className="py-3 px-3.5">Payment Mode</th>
                <th className="py-3 px-3.5 text-right">Amount (INR)</th>
                <th className="py-3 px-3.5">Remarks</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {personalInflows.map((t) => (
                <tr key={t.id} className="hover:bg-[#141414] transition-colors">
                  <td className="py-3 px-3.5 text-[#D4D4D8]">
                    {formatDateIN(t.date)}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-white">
                    {t.recipientOrSource || t.category}
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
          </table>
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
