"use client";

import React from "react";
import { formatINR } from "@/lib/formatters";
import {
  CommercialDashboardMetrics,
  PersonalDashboardMetrics,
} from "@/lib/formulaEngine";
import {
  Wallet,
  Banknote,
  Landmark,
  Clock,
  ArrowDownLeft,
  Coins,
  TrendingDown,
  Building2,
} from "lucide-react";
import { CyclingKpiCard } from "./CyclingKpiCard";
import { ProfitKpiCard } from "./ProfitKpiCard";

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
      totalProjectedProfit,
      totalPendingProfit,
      capitalInjectedTotal,
      capitalInjectedBank,
      netCapitalInjected,
      profitWithdrawalsTotal,
      outstandingLoansPrincipal,
      totalFinanceCosts,
      totalProjectOutlay,
      totalAgreedBuyPrice,
      totalPropertyExpenses,
      dealInflowsBank,
      loansBorrowedBank,
      outflowsCash,
      propertyMetrics,
    } = commercialMetrics;

    const activeDealsCount = propertyMetrics.filter(
      (pm) =>
        pm.property.status !== "sold" && pm.property.status !== "closed"
    ).length;
    const soldDealsCount = propertyMetrics.filter(
      (pm) =>
        pm.property.status === "sold" || pm.property.status === "closed"
    ).length;

    const bankInflowsGross =
      dealInflowsBank + capitalInjectedBank + loansBorrowedBank;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Bank Position & Inflow Velocity */}
        <CyclingKpiCard
          staggerDelayMs={0}
          panelA={{
            title: "Net Bank Liquidity",
            badge: "CLEARED",
            badgeColor: "bg-blue-950/60 text-blue-400 border border-blue-800/40",
            titleColor: "text-blue-400",
            value: formatINR(netBankLiquidity),
            subtitle: "Bank Reserve",
            icon: Landmark,
            iconColor: "text-[#3B82F6]",
          }}
          panelB={{
            title: "Bank Inflow Volume",
            badge: "INFLOWS",
            badgeColor: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
            titleColor: "text-emerald-400",
            value: formatINR(bankInflowsGross),
            subtitle: "Gross Bank Credits Received",
            icon: ArrowDownLeft,
            iconColor: "text-[#22C55E]",
          }}
        />

        {/* Card 2: Liquid Cash & Site Outflow Burn */}
        <CyclingKpiCard
          staggerDelayMs={1200}
          panelA={{
            title: "Cash in Hand",
            badge: "IN HAND",
            badgeColor: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
            titleColor: "text-emerald-400",
            value: formatINR(netCashLiquidity),
            subtitle: "Liquid Vault Cash",
            icon: Banknote,
            iconColor: "text-[#22C55E]",
          }}
          panelB={{
            title: "Cash Outflow Burn",
            badge: "CASH BURN",
            badgeColor: "bg-amber-950/60 text-amber-400 border border-amber-800/40",
            titleColor: "text-amber-400",
            value: formatINR(outflowsCash),
            subtitle: "Site Labor, Legal & Registration",
            icon: TrendingDown,
            iconColor: "text-[#F59E0B]",
          }}
        />

        {/* Card 3: Combined Liquidity vs Invested Capital */}
        <CyclingKpiCard
          staggerDelayMs={2400}
          panelA={{
            title: "Total Liquidity",
            badge: "AVAILABLE",
            badgeColor: "bg-zinc-800 text-zinc-300 border border-zinc-700/50",
            titleColor: "text-white",
            value: formatINR(currentNetLiquidity),
            subtitle: `Bank: ${formatINR(netBankLiquidity)} | Cash: ${formatINR(netCashLiquidity)}`,
            icon: Wallet,
            iconColor: "text-white",
          }}
          panelB={{
            title: "Net Retained Capital",
            badge: "NET EQUITY",
            badgeColor: "bg-cyan-950/60 text-cyan-400 border border-cyan-800/40",
            titleColor: "text-cyan-400",
            value: formatINR(netCapitalInjected),
            subtitle: `Gross Cap: ${formatINR(capitalInjectedTotal)} - Refunds`,
            icon: Coins,
            iconColor: "text-cyan-400",
          }}
        />

        {/* Card 4: Seller Liabilities vs Full Outlay */}
        <CyclingKpiCard
          staggerDelayMs={3600}
          panelA={{
            title: "Pending to Sellers",
            badge: "SELLER DUE",
            badgeColor: "bg-amber-950/60 text-amber-400 border border-amber-800/40",
            titleColor: "text-[#F59E0B]",
            value: formatINR(totalPendingPayable),
            valueColor: "text-[#F59E0B]",
            subtitle: `${propertyMetrics.length} Land Deals Owed`,
            icon: Clock,
            iconColor: "text-[#F59E0B]",
          }}
          panelB={{
            title: "Committed Project Outlay",
            badge: "FULL OUTLAY",
            badgeColor: "bg-yellow-950/60 text-yellow-400 border border-yellow-800/40",
            titleColor: "text-yellow-400",
            value: formatINR(totalProjectOutlay),
            valueColor: "text-yellow-400",
            subtitle: `Buy: ${formatINR(totalAgreedBuyPrice)} + Exp: ${formatINR(totalPropertyExpenses)}`,
            icon: Landmark,
            iconColor: "text-yellow-400",
          }}
        />

        {/* Card 5: External Debt vs Incoming Buyer Receivables */}
        <CyclingKpiCard
          staggerDelayMs={4800}
          panelA={{
            title: "Active Loan Debt",
            badge: "LOAN DEBT",
            badgeColor: "bg-rose-950/60 text-rose-400 border border-rose-800/40",
            titleColor: "text-rose-400",
            value: formatINR(outstandingLoansPrincipal),
            valueColor:
              outstandingLoansPrincipal > 0 ? "text-rose-400" : "text-[#A1A1AA]",
            subtitle:
              totalFinanceCosts > 0
                ? `Finance Cost: ${formatINR(totalFinanceCosts)}`
                : "Principal Outstanding",
            icon: Landmark,
            iconColor: "text-rose-400",
          }}
          panelB={{
            title: "Buyer Receivables",
            badge: "RECEIVABLES",
            badgeColor: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
            titleColor: "text-[#22C55E]",
            value: formatINR(totalPendingReceivable),
            valueColor: "text-[#22C55E]",
            subtitle: "Agreed Selling Pipeline",
            icon: ArrowDownLeft,
            iconColor: "text-[#22C55E]",
          }}
        />

        {/* Card 6: Auto-Switching Actual vs Projected Profit KPI Card (7s Interval + Touch Swipe) */}
        <ProfitKpiCard
          totalRealizedProfit={totalRealizedProfit}
          totalProjectedProfit={totalProjectedProfit}
          totalPendingProfit={totalPendingProfit}
          profitWithdrawalsTotal={profitWithdrawalsTotal}
          activeDealsCount={activeDealsCount}
          soldDealsCount={soldDealsCount}
        />
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
      withdrawalsTotal,
      properties,
    } = personalMetrics;

    const totalAgreedValue = properties.reduce(
      (sum, p) => sum + (p.property.agreedPurchasePrice || 0),
      0
    );
    const totalPendingCommitment = properties.reduce(
      (sum, p) => sum + (p.pendingCommitment || 0),
      0
    );

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Total Investment Paid vs Committed Value */}
        <CyclingKpiCard
          staggerDelayMs={0}
          panelA={{
            title: "Total Invested",
            badge: "PAID",
            badgeColor: "bg-zinc-800 text-zinc-300 border border-zinc-700/50",
            titleColor: "text-white",
            value: formatINR(totalInvestmentDone),
            subtitle: `Across ${properties.length} Personal Properties`,
            icon: Wallet,
            iconColor: "text-white",
          }}
          panelB={{
            title: "Committed Value",
            badge: "COMMITTED",
            badgeColor: "bg-blue-950/60 text-blue-400 border border-blue-800/40",
            titleColor: "text-blue-400",
            value: formatINR(totalAgreedValue),
            subtitle: `Pending: ${formatINR(totalPendingCommitment)}`,
            icon: Building2,
            iconColor: "text-blue-400",
          }}
        />

        {/* Card 2: Savings Inflows vs Capital Withdrawn */}
        <CyclingKpiCard
          staggerDelayMs={1500}
          panelA={{
            title: "Inflows Allocated",
            badge: "SAVINGS",
            badgeColor: "bg-blue-950/60 text-blue-400 border border-blue-800/40",
            titleColor: "text-[#3B82F6]",
            value: formatINR(inflowsTotal),
            valueColor: "text-[#3B82F6]",
            subtitle: "Personal Savings & Income",
            icon: Landmark,
            iconColor: "text-[#3B82F6]",
          }}
          panelB={{
            title: "Funds Withdrawn",
            badge: "DRAWINGS",
            badgeColor: "bg-purple-950/60 text-purple-400 border border-purple-800/40",
            titleColor: "text-purple-400",
            value: formatINR(withdrawalsTotal),
            valueColor: "text-purple-400",
            subtitle: "Personal Refunds & Drawings",
            icon: Coins,
            iconColor: "text-purple-400",
          }}
        />

        {/* Card 3: Bank Available vs Combined Liquidity */}
        <CyclingKpiCard
          staggerDelayMs={3000}
          panelA={{
            title: "Bank Available",
            badge: "BANK BUFFER",
            badgeColor: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
            titleColor: "text-[#22C55E]",
            value: formatINR(currentBankBalance),
            valueColor: "text-[#22C55E]",
            subtitle: "Ready for Next Installment",
            icon: Banknote,
            iconColor: "text-[#22C55E]",
          }}
          panelB={{
            title: "Total Liquid Buffer",
            badge: "TOTAL CASH",
            badgeColor: "bg-zinc-800 text-zinc-300 border border-zinc-700/50",
            titleColor: "text-white",
            value: formatINR(netPersonalLiquidity),
            subtitle: `Cash in Hand: ${formatINR(currentCashBalance)}`,
            icon: Wallet,
            iconColor: "text-white",
          }}
        />

        {/* Card 4: Cash in Hand vs Pending Commitments */}
        <CyclingKpiCard
          staggerDelayMs={4500}
          panelA={{
            title: "Cash in Hand Balance",
            badge: "VAULT CASH",
            badgeColor: "bg-amber-950/60 text-amber-400 border border-amber-800/40",
            titleColor: "text-amber-400",
            value: formatINR(currentCashBalance),
            subtitle: "For Site Expenses & Labor",
            icon: Clock,
            iconColor: "text-[#F59E0B]",
          }}
          panelB={{
            title: "Pending Payments",
            badge: "NEXT MILESTONES",
            badgeColor: "bg-orange-950/60 text-orange-400 border border-orange-800/40",
            titleColor: "text-orange-400",
            value: formatINR(totalPendingCommitment),
            valueColor: "text-orange-400",
            subtitle: "Builder Construction Milestones",
            icon: Building2,
            iconColor: "text-orange-400",
          }}
        />
      </div>
    );
  }

  return null;
};
