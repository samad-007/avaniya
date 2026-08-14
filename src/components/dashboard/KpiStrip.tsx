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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Net Bank */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 flex flex-col justify-between hover:border-[#333333] transition-standard">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Net Bank Liquidity</span>
            <Landmark className="w-3.5 h-3.5 text-[#3B82F6]" />
          </div>
          <div className="text-lg font-bold font-mono text-white tracking-tight">
            {formatINR(netBankLiquidity)}
          </div>
          <div className="text-[10px] text-[#22C55E] flex items-center gap-1 mt-1">
            <span>Bank Reserve</span>
          </div>
        </div>

        {/* Net Cash */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 flex flex-col justify-between hover:border-[#333333] transition-standard">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Cash in Hand</span>
            <Banknote className="w-3.5 h-3.5 text-[#22C55E]" />
          </div>
          <div className="text-lg font-bold font-mono text-white tracking-tight">
            {formatINR(netCashLiquidity)}
          </div>
          <div className="text-[10px] text-[#888888] flex items-center gap-1 mt-1">
            <span>Liquid Cash</span>
          </div>
        </div>

        {/* Total Combined Liquidity */}
        <div className="bg-[#0e0e0e] border border-[#333333] rounded-md p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Total Liquidity</span>
            <Wallet className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-lg font-bold font-mono text-white tracking-tight">
            {formatINR(currentNetLiquidity)}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">
            Capital: {formatINR(capitalInjectedTotal)}
          </div>
        </div>

        {/* Pending Payables to Sellers */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 flex flex-col justify-between hover:border-[#333333] transition-standard">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Pending to Sellers</span>
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
          </div>
          <div className="text-lg font-bold font-mono text-[#F59E0B] tracking-tight">
            {formatINR(totalPendingPayable)}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">
            {propertyMetrics.length} Land Deals
          </div>
        </div>

        {/* Pending Receivables from Buyers */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 flex flex-col justify-between hover:border-[#333333] transition-standard">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Buyer Receivables</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#22C55E]" />
          </div>
          <div className="text-lg font-bold font-mono text-[#22C55E] tracking-tight">
            {formatINR(totalPendingReceivable)}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">
            Agreed Selling Pipeline
          </div>
        </div>

        {/* Realized Profit */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 flex flex-col justify-between hover:border-[#333333] transition-standard">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Realized Profit</span>
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-lg font-bold font-mono text-white tracking-tight">
            {formatINR(totalRealizedProfit)}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">
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
      netPersonalLiquidity,
      totalInvestmentDone,
      inflowsTotal,
      properties,
    } = personalMetrics;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Total Invested */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 flex flex-col justify-between hover:border-[#333333] transition-standard">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Total Invested</span>
            <Wallet className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-xl font-bold font-mono text-white tracking-tight">
            {formatINR(totalInvestmentDone)}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">
            Across {properties.length} Personal Properties
          </div>
        </div>

        {/* Personal Inflows */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 flex flex-col justify-between hover:border-[#333333] transition-standard">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Inflows Allocated</span>
            <Landmark className="w-3.5 h-3.5 text-[#3B82F6]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#3B82F6] tracking-tight">
            {formatINR(inflowsTotal)}
          </div>
          <div className="text-[10px] text-[#22C55E] mt-1">
            Personal Savings & Incomes
          </div>
        </div>

        {/* Current Asset Bank Balance */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 flex flex-col justify-between hover:border-[#333333] transition-standard">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Bank Balance Available</span>
            <Banknote className="w-3.5 h-3.5 text-[#22C55E]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#22C55E] tracking-tight">
            {formatINR(currentBankBalance)}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">
            Ready for Next Installment
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 flex flex-col justify-between hover:border-[#333333] transition-standard">
          <div className="flex items-center justify-between text-[#888888] text-[11px] font-medium uppercase tracking-wider mb-1">
            <span>Cash in Hand Balance</span>
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
          </div>
          <div className="text-xl font-bold font-mono text-white tracking-tight">
            {formatINR(currentCashBalance)}
          </div>
          <div className="text-[10px] text-[#888888] mt-1">
            For Site Expenses & Labor
          </div>
        </div>
      </div>
    );
  }

  return null;
};
