"use client";

import React from "react";
import { formatINR } from "@/lib/formatters";
import {
  CommercialDashboardMetrics,
  PersonalDashboardMetrics,
} from "@/lib/formulaEngine";
import { Wallet, Banknote, Landmark, Clock, ArrowDownLeft, TrendingUp } from "lucide-react";

interface KpiStripProps {
  mode: "commercial" | "personal";
  commercialMetrics?: CommercialDashboardMetrics | null;
  personalMetrics?: PersonalDashboardMetrics | null;
}

export const KpiStrip: React.FC<KpiStripProps> = ({
  mode,
  commercialMetrics,
  personalMetrics,
}) => {
  if (mode === "commercial" && commercialMetrics) {
    const {
      netBankLiquidity,
      netCashLiquidity,
      currentNetLiquidity,
      totalPendingPayable,
      totalPendingReceivable,
      totalRealizedProfit,
      capitalInjectedTotal,
      propertyMetrics,
    } = commercialMetrics;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Net Bank */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Net Bank Liquidity</span>
            <Landmark className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
            {formatINR(netBankLiquidity)}
          </div>
          <div className="text-xs text-[#22C55E] font-medium flex items-center gap-1 mt-1.5">
            <span>Bank Reserve</span>
          </div>
        </div>

        {/* Net Cash */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Cash in Hand</span>
            <Banknote className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
            {formatINR(netCashLiquidity)}
          </div>
          <div className="text-xs text-[#A1A1AA] font-medium flex items-center gap-1 mt-1.5">
            <span>Liquid Cash</span>
          </div>
        </div>

        {/* Total Combined Liquidity */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Total Liquidity</span>
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
            {formatINR(currentNetLiquidity)}
          </div>
          <div className="text-xs text-[#A1A1AA] font-medium mt-1.5">
            Capital: {formatINR(capitalInjectedTotal)}
          </div>
        </div>

        {/* Pending Payables to Sellers */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#F59E0B] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Pending to Sellers</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-[#F59E0B] tracking-tight">
            {formatINR(totalPendingPayable)}
          </div>
          <div className="text-xs text-[#A1A1AA] font-medium mt-1.5">
            {propertyMetrics.length} Land Deals
          </div>
        </div>

        {/* Pending Receivables from Buyers */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#22C55E] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Buyer Receivables</span>
            <ArrowDownLeft className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-[#22C55E] tracking-tight">
            {formatINR(totalPendingReceivable)}
          </div>
          <div className="text-xs text-[#A1A1AA] font-medium mt-1.5">
            Agreed Selling Pipeline
          </div>
        </div>

        {/* Realized Profit */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Realized Profit</span>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
            {formatINR(totalRealizedProfit)}
          </div>
          <div className="text-xs text-[#A1A1AA] font-medium mt-1.5">
            Settled Deal Gains
          </div>
        </div>
      </div>
    );
  }

  if (mode === "personal" && personalMetrics) {
    const {
      currentBankBalance,
      currentCashBalance,
      totalInvestmentDone,
      inflowsTotal,
      properties,
    } = personalMetrics;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Invested */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Total Invested</span>
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-white tracking-tight">
            {formatINR(totalInvestmentDone)}
          </div>
          <div className="text-xs text-[#A1A1AA] font-medium mt-1.5">
            Across {properties.length} Personal Properties
          </div>
        </div>

        {/* Personal Inflows */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#3B82F6] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Inflows Allocated</span>
            <Landmark className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-[#3B82F6] tracking-tight">
            {formatINR(inflowsTotal)}
          </div>
          <div className="text-xs text-[#22C55E] font-medium mt-1.5">
            Personal Savings &amp; Incomes
          </div>
        </div>

        {/* Current Asset Bank Balance */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#22C55E] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Bank Balance Available</span>
            <Banknote className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-[#22C55E] tracking-tight">
            {formatINR(currentBankBalance)}
          </div>
          <div className="text-xs text-[#A1A1AA] font-medium mt-1.5">
            Ready for Next Installment
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#383838] transition-standard shadow-sm">
          <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Cash in Hand Balance</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-white tracking-tight">
            {formatINR(currentCashBalance)}
          </div>
          <div className="text-xs text-[#A1A1AA] font-medium mt-1.5">
            For Site Expenses &amp; Labor
          </div>
        </div>
      </div>
    );
  }

  return null;
};
