"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  // Synchronized strip-level state: all cards switch in lockstep
  const [activePanel, setActivePanel] = useState<"A" | "B">("A");
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSwitch = useCallback((targetPanel?: "A" | "B") => {
    setIsFlipping(true);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = setTimeout(() => {
      setActivePanel((prev) => targetPanel ?? (prev === "A" ? "B" : "A"));
      setIsFlipping(false);
    }, 200);
  }, []);

  // Synchronized 7-second auto-cycle interval across all strip cards
  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      triggerSwitch();
    }, 7000);

    return () => {
      clearInterval(intervalId);
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, [isPaused, triggerSwitch]);

  const handleHoverStart = useCallback(() => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
  }, []);

  const handleHoverEnd = useCallback(() => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  }, []);

  const handleCardClick = useCallback(() => {
    triggerSwitch();
    handleHoverEnd();
  }, [triggerSwitch, handleHoverEnd]);

  const handleSelectPanel = useCallback(
    (panel: "A" | "B") => {
      triggerSwitch(panel);
      handleHoverEnd();
    },
    [triggerSwitch, handleHoverEnd]
  );

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      triggerSwitch(direction === "left" ? "B" : "A");
      handleHoverEnd();
    },
    [triggerSwitch, handleHoverEnd]
  );

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
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
      >
        {/* Card 1: Bank Position & Inflow Velocity */}
        <CyclingKpiCard
          cardAccentColor="blue"
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          panelA={{
            title: "Net Bank Liquidity",
            badge: "CLEARED",
            badgeColor: "bg-blue-950/60 text-blue-400 border border-blue-800/40",
            titleColor: "text-blue-400",
            value: formatINR(netBankLiquidity),
            valueColor: "text-blue-400",
            subtitle: "Bank Reserve",
            icon: Landmark,
            iconColor: "text-[#3B82F6]",
          }}
          panelB={{
            title: "Bank Inflow Volume",
            badge: "INFLOWS",
            badgeColor: "bg-blue-950/60 text-blue-400 border border-blue-800/40",
            titleColor: "text-blue-400",
            value: formatINR(bankInflowsGross),
            valueColor: "text-blue-400",
            subtitle: "Gross Bank Credits Received",
            icon: ArrowDownLeft,
            iconColor: "text-[#3B82F6]",
          }}
        />

        {/* Card 2: Liquid Cash & Site Outflow Burn */}
        <CyclingKpiCard
          cardAccentColor="emerald"
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          panelA={{
            title: "Cash in Hand",
            badge: "IN HAND",
            badgeColor: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
            titleColor: "text-emerald-400",
            value: formatINR(netCashLiquidity),
            valueColor: "text-emerald-400",
            subtitle: "Liquid Vault Cash",
            icon: Banknote,
            iconColor: "text-[#22C55E]",
          }}
          panelB={{
            title: "Cash Outflow Burn",
            badge: "CASH BURN",
            badgeColor: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
            titleColor: "text-emerald-400",
            value: formatINR(outflowsCash),
            valueColor: "text-emerald-400",
            subtitle: "Site Labor, Legal & Registration",
            icon: TrendingDown,
            iconColor: "text-[#22C55E]",
          }}
        />

        {/* Card 3: Combined Liquidity vs Invested Capital */}
        <CyclingKpiCard
          cardAccentColor="cyan"
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          panelA={{
            title: "Total Liquidity",
            badge: "AVAILABLE",
            badgeColor: "bg-cyan-950/60 text-cyan-400 border border-cyan-800/40",
            titleColor: "text-cyan-400",
            value: formatINR(currentNetLiquidity),
            valueColor: "text-cyan-400",
            subtitle: `Bank: ${formatINR(netBankLiquidity)} | Cash: ${formatINR(netCashLiquidity)}`,
            icon: Wallet,
            iconColor: "text-[#06B6D4]",
          }}
          panelB={{
            title: "Net Retained Capital",
            badge: "NET EQUITY",
            badgeColor: "bg-cyan-950/60 text-cyan-400 border border-cyan-800/40",
            titleColor: "text-cyan-400",
            value: formatINR(netCapitalInjected),
            valueColor: "text-cyan-400",
            subtitle: `Gross Cap: ${formatINR(capitalInjectedTotal)} - Refunds`,
            icon: Coins,
            iconColor: "text-[#06B6D4]",
          }}
        />

        {/* Card 4: Seller Liabilities vs Full Outlay */}
        <CyclingKpiCard
          cardAccentColor="amber"
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
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
            badgeColor: "bg-amber-950/60 text-amber-400 border border-amber-800/40",
            titleColor: "text-amber-400",
            value: formatINR(totalProjectOutlay),
            valueColor: "text-amber-400",
            subtitle: `Buy: ${formatINR(totalAgreedBuyPrice)} + Exp: ${formatINR(totalPropertyExpenses)}`,
            icon: Landmark,
            iconColor: "text-[#F59E0B]",
          }}
        />

        {/* Card 5: External Debt vs Incoming Buyer Receivables */}
        <CyclingKpiCard
          cardAccentColor="rose"
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
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
            iconColor: "text-[#F43F5E]",
          }}
          panelB={{
            title: "Buyer Receivables",
            badge: "RECEIVABLES",
            badgeColor: "bg-rose-950/60 text-rose-400 border border-rose-800/40",
            titleColor: "text-rose-400",
            value: formatINR(totalPendingReceivable),
            valueColor: "text-rose-400",
            subtitle: "Agreed Selling Pipeline",
            icon: ArrowDownLeft,
            iconColor: "text-[#F43F5E]",
          }}
        />

        {/* Card 6: Auto-Switching Actual vs Projected Profit KPI Card (Synchronized 7s Interval + Touch Swipe) */}
        <ProfitKpiCard
          cardAccentColor="emerald"
          totalRealizedProfit={totalRealizedProfit}
          totalProjectedProfit={totalProjectedProfit}
          totalPendingProfit={totalPendingProfit}
          profitWithdrawalsTotal={profitWithdrawalsTotal}
          activeDealsCount={activeDealsCount}
          soldDealsCount={soldDealsCount}
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
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
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
      >
        {/* Card 1: Total Investment Paid vs Committed Value */}
        <CyclingKpiCard
          cardAccentColor="blue"
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          panelA={{
            title: "Total Invested",
            badge: "PAID",
            badgeColor: "bg-blue-950/60 text-blue-400 border border-blue-800/40",
            titleColor: "text-blue-400",
            value: formatINR(totalInvestmentDone),
            valueColor: "text-blue-400",
            subtitle: `Across ${properties.length} Personal Properties`,
            icon: Wallet,
            iconColor: "text-[#3B82F6]",
          }}
          panelB={{
            title: "Committed Value",
            badge: "COMMITTED",
            badgeColor: "bg-blue-950/60 text-blue-400 border border-blue-800/40",
            titleColor: "text-blue-400",
            value: formatINR(totalAgreedValue),
            valueColor: "text-blue-400",
            subtitle: `Pending: ${formatINR(totalPendingCommitment)}`,
            icon: Building2,
            iconColor: "text-[#3B82F6]",
          }}
        />

        {/* Card 2: Savings Inflows vs Capital Withdrawn */}
        <CyclingKpiCard
          cardAccentColor="purple"
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          panelA={{
            title: "Inflows Allocated",
            badge: "SAVINGS",
            badgeColor: "bg-purple-950/60 text-purple-400 border border-purple-800/40",
            titleColor: "text-purple-400",
            value: formatINR(inflowsTotal),
            valueColor: "text-purple-400",
            subtitle: "Personal Savings & Income",
            icon: Landmark,
            iconColor: "text-[#A855F7]",
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
            iconColor: "text-[#A855F7]",
          }}
        />

        {/* Card 3: Bank Available vs Combined Liquidity */}
        <CyclingKpiCard
          cardAccentColor="emerald"
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
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
            badgeColor: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
            titleColor: "text-emerald-400",
            value: formatINR(netPersonalLiquidity),
            subtitle: `Cash in Hand: ${formatINR(currentCashBalance)}`,
            icon: Wallet,
            iconColor: "text-[#22C55E]",
          }}
        />

        {/* Card 4: Cash in Hand vs Pending Commitments */}
        <CyclingKpiCard
          cardAccentColor="amber"
          activePanel={activePanel}
          isFlipping={isFlipping}
          onClick={handleCardClick}
          onSelectPanel={handleSelectPanel}
          onSwipe={handleSwipe}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          panelA={{
            title: "Cash in Hand Balance",
            badge: "VAULT CASH",
            badgeColor: "bg-amber-950/60 text-amber-400 border border-amber-800/40",
            titleColor: "text-amber-400",
            value: formatINR(currentCashBalance),
            valueColor: "text-amber-400",
            subtitle: "For Site Expenses & Labor",
            icon: Clock,
            iconColor: "text-[#F59E0B]",
          }}
          panelB={{
            title: "Pending Payments",
            badge: "NEXT MILESTONES",
            badgeColor: "bg-amber-950/60 text-amber-400 border border-amber-800/40",
            titleColor: "text-amber-400",
            value: formatINR(totalPendingCommitment),
            valueColor: "text-amber-400",
            subtitle: "Builder Construction Milestones",
            icon: Building2,
            iconColor: "text-[#F59E0B]",
          }}
        />
      </div>
    );
  }

  return null;
};
