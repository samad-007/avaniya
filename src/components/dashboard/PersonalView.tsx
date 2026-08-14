"use client";

import React, { useState } from "react";
import { formatINR, formatINRCompact, formatDateIN } from "@/lib/formatters";
import { PersonalDashboardMetrics } from "@/lib/formulaEngine";
import { SeedProperty, SeedTransaction } from "@/lib/seedData";
import {
  Home,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Banknote,
  Landmark,
  PieChart,
  ListOrdered,
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
}

export const PersonalView: React.FC<PersonalViewProps> = ({
  metrics,
  transactions,
  onSelectProperty,
  onOpenNewPropertyModal,
  onOpenEntryModal,
  onEditProperty,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "properties" | "outflows" | "inflows" | "categories"
  >("properties");

  const personalOutflows = transactions.filter(
    (t) => t.scope === "personal" && t.transactionType === "outflow"
  );
  const personalInflows = transactions.filter(
    (t) => t.scope === "personal" && t.transactionType === "capital_inflow"
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Sub Navigation */}
      <div className="flex items-center justify-between border-b border-[#222222] overflow-x-auto pb-0.5 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab("properties")}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-standard ${
              activeSubTab === "properties"
                ? "border-white text-white font-semibold"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            1. My Properties &amp; Assets ({metrics.properties.length})
          </button>
          <button
            onClick={() => setActiveSubTab("outflows")}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-standard ${
              activeSubTab === "outflows"
                ? "border-white text-white font-semibold"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            2. Milestone Outflows ({formatINRCompact(metrics.outflowsTotal)})
          </button>
          <button
            onClick={() => setActiveSubTab("inflows")}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-standard ${
              activeSubTab === "inflows"
                ? "border-white text-white font-semibold"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            3. Personal Inflow Sources ({formatINRCompact(metrics.inflowsTotal)})
          </button>
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-standard ${
              activeSubTab === "categories"
                ? "border-white text-white font-semibold"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            4. Category Spending Breakdown
          </button>
        </div>

        <button
          onClick={onOpenNewPropertyModal}
          className="px-3 py-1.5 rounded bg-white text-black text-xs font-semibold hover:bg-[#e0e0e0] transition-standard flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Personal Property</span>
        </button>
      </div>

      {/* SubTab 1: My Properties & Assets */}
      {activeSubTab === "properties" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-4 flex flex-col justify-between gap-3.5 cursor-pointer hover:border-[#383838] hover:bg-[#0d0d0d] transition-standard group shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-[#22C55E] transition-colors">
                        {p.name}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161616] text-[#888888] border border-[#222222]">
                        {p.propertyCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#777777] mt-0.5">
                      {p.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {p.location}
                        </span>
                      )}
                      {p.acquisitionDate && (
                        <span>Acquired {formatDateIN(p.acquisitionDate)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onEditProperty && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProperty(p);
                        }}
                        className="p-1 rounded bg-[#161616] text-[#888888] hover:text-white hover:bg-[#252525] border border-[#2a2a2a] transition-standard"
                        title="Edit Property Data Points"
                      >
                        <Pencil className="w-3 h-3 text-[#22C55E]" />
                      </button>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40">
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 bg-[#050505] p-2.5 rounded border border-[#161616]">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[#777777]">
                      Agreed Asset Price
                    </div>
                    <div className="text-xs font-bold font-mono text-white">
                      {formatINR(p.agreedPurchasePrice)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[#22C55E]">
                      Invested So Far
                    </div>
                    <div className="text-xs font-bold font-mono text-[#22C55E]">
                      {formatINR(pData.totalInvested)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[#F59E0B]">
                      Pending Commitment
                    </div>
                    <div className="text-xs font-bold font-mono text-[#F59E0B]">
                      {formatINR(pData.pendingCommitment)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[#777777]">
                      Stages Done
                    </div>
                    <div className="text-xs font-bold font-mono text-white">
                      {completedMilestones} / {totalMilestones}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] text-[#777777]">
                    <span>Payment Progress</span>
                    <span className="font-mono text-white font-medium">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
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
        <div className="border border-[#222222] rounded-lg overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#222222] text-[#888888] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Property</th>
                <th className="py-2.5 px-3">Expense Category</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {personalOutflows.map((t) => (
                <tr key={t.id} className="hover:bg-[#121212] transition-colors">
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
                  Total Personal Outflows
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

      {/* SubTab 3: Inflows */}
      {activeSubTab === "inflows" && (
        <div className="border border-[#222222] rounded-lg overflow-x-auto bg-[#0a0a0a]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#222222] text-[#888888] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Source Description</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {personalInflows.map((t) => (
                <tr key={t.id} className="hover:bg-[#121212] transition-colors">
                  <td className="py-2.5 px-3 text-[#aaaaaa]">
                    {formatDateIN(t.date)}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-white">
                    {t.recipientOrSource || t.category}
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
                    {t.remarks || "-"}
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
          <div className="border border-[#222222] rounded-lg p-4 bg-[#0a0a0a] flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Expense Distribution by Category
            </h3>
            <div className="flex flex-col gap-2">
              {metrics.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white">{cat.category}</span>
                    <span className="font-mono text-[#22C55E] font-semibold">
                      {formatINR(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#222222] rounded-lg p-4 bg-[#0a0a0a] flex flex-col justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Personal Cash vs Bank Reconciliation
            </h3>
            <div className="grid grid-cols-2 gap-3 my-auto">
              <div className="bg-[#050505] p-3 rounded border border-[#161616]">
                <div className="text-[10px] uppercase text-[#888888]">
                  Bank Balance
                </div>
                <div className="text-base font-bold font-mono text-[#22C55E]">
                  {formatINR(metrics.currentBankBalance)}
                </div>
              </div>
              <div className="bg-[#050505] p-3 rounded border border-[#161616]">
                <div className="text-[10px] uppercase text-[#888888]">
                  Cash in Hand
                </div>
                <div className="text-base font-bold font-mono text-white">
                  {formatINR(metrics.currentCashBalance)}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#666666]">
              All calculations match the formula logic in New Apartment Expense
              Tracker.xlsx
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
