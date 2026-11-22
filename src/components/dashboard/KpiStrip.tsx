"use client";

import React, { useState, useRef, useCallback } from "react";
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
  Layers,
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
  // User-controlled Overview vs Breakdown switch (calm, no jarring auto-flip while reading)
  const [activePanel, setActivePanel] = useState<"A" | "B">("A");
  const [isFlipping, setIsFlipping] = useState(false);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSwitch = useCallback((targetPanel?: "A" | "B") => {
    setIsFlipping(true);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = setTimeout(() => {
      setActivePanel((prev) => targetPanel ?? (prev === "A" ? "B" : "A"));
      setIsFlipping(false);
    }, 140);
  }, []);

  const handleCardClick = useCallback(() => {
    triggerSwitch();
  }, [triggerSwitch]);

  const handleSelectPanel = useCallback(
    (panel: "A" | "B") => {
      if (panel !== activePanel) {
        triggerSwitch(panel);
      }
    },
    [activePanel, triggerSwitch]
  );

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      triggerSwitch(direction === "left" ? "B" : "A");
    },
    [triggerSwitch]
  );

  const renderSectionHeader = (label: string) => (
    <div className="flex items-center justify-between gap-2 mb-2.5">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-soft text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => handleSelectPanel("A")}
          className={`px-2.5 py-1 rounded-md transition-all ${
            activePanel === "A"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => handleSelectPanel("B")}
          className={`px-2.5 py-1 rounded-md transition-all ${
            activePanel === "B"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          More Details
        </button>
      </div>
    </div>
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
      (pm) => pm.property.status !== "sold" && pm.property.status !== "closed"
    ).length;
    const soldDealsCount = propertyMetrics.filter(
      (pm) => pm.property.status === "sold" || pm.property.status === "closed"
    ).length;

    const bankInflowsGross =
      dealInflowsBank + capitalInjectedBank + loansBorrowedBank;

    return (
      <section aria-label="Financial Summary">
        {renderSectionHeader("Money & Profit Summary")}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Bank Balance vs Total Bank Credits */}
          <CyclingKpiCard
            cardAccentColor="blue"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Bank Balance",
              badge: "Bank",
              value: formatINR(netBankLiquidity),
              valueColor:
                netBankLiquidity >= 0 ? "text-slate-900" : "text-rose-600",
              subtitle: "Available in bank account",
              icon: Landmark,
            }}
            panelB={{
              title: "Total Bank Receipts",
              badge: "Inflows",
              value: formatINR(bankInflowsGross),
              valueColor: "text-blue-700",
              subtitle: "All bank credits received",
              icon: ArrowDownLeft,
            }}
          />

          {/* Card 2: Cash in Hand vs Cash Spent */}
          <CyclingKpiCard
            cardAccentColor="emerald"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Cash in Hand",
              badge: "Cash",
              value: formatINR(netCashLiquidity),
              valueColor:
                netCashLiquidity >= 0 ? "text-slate-900" : "text-rose-600",
              subtitle: "Physical cash available",
              icon: Banknote,
            }}
            panelB={{
              title: "Total Cash Spent",
              badge: "Spent",
              value: formatINR(outflowsCash),
              valueColor: "text-slate-900",
              subtitle: "Site, legal & registration cash",
              icon: TrendingDown,
            }}
          />

          {/* Card 3: Total Available Funds vs Your Capital */}
          <CyclingKpiCard
            cardAccentColor="cyan"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Total Available",
              badge: "Total",
              value: formatINR(currentNetLiquidity),
              valueColor:
                currentNetLiquidity >= 0 ? "text-teal-700" : "text-rose-600",
              subtitle: "Bank + Cash combined",
              icon: Wallet,
            }}
            panelB={{
              title: "Your Net Capital",
              badge: "Capital",
              value: formatINR(netCapitalInjected),
              valueColor: "text-teal-700",
              subtitle: `Put in: ${formatINR(capitalInjectedTotal)}`,
              icon: Coins,
            }}
          />

          {/* Card 4: Owed to Sellers vs Total Project Cost */}
          <CyclingKpiCard
            cardAccentColor="amber"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Owed to Sellers",
              badge: "Payable",
              value: formatINR(totalPendingPayable),
              valueColor:
                totalPendingPayable > 0 ? "text-amber-700" : "text-slate-900",
              subtitle: `Across ${propertyMetrics.length} ${
                propertyMetrics.length === 1 ? "property" : "properties"
              }`,
              icon: Clock,
            }}
            panelB={{
              title: "Total Deal Cost",
              badge: "Total Cost",
              value: formatINR(totalProjectOutlay),
              valueColor: "text-slate-900",
              subtitle: `Buy ${formatINR(totalAgreedBuyPrice)} + Costs ${formatINR(totalPropertyExpenses)}`,
              icon: Landmark,
            }}
          />

          {/* Card 5: Loans Owed vs Buyers Owe You */}
          <CyclingKpiCard
            cardAccentColor="rose"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Loans Owed",
              badge: "Loans",
              value: formatINR(outstandingLoansPrincipal),
              valueColor:
                outstandingLoansPrincipal > 0
                  ? "text-rose-600"
                  : "text-slate-500",
              subtitle:
                totalFinanceCosts > 0
                  ? `Interest/share paid: ${formatINR(totalFinanceCosts)}`
                  : "Remaining loan balance",
              icon: Landmark,
            }}
            panelB={{
              title: "Buyers Owe You",
              badge: "Receivable",
              value: formatINR(totalPendingReceivable),
              valueColor: "text-emerald-700",
              subtitle: "Pending from property sales",
              icon: ArrowDownLeft,
            }}
          />

          {/* Card 6: Profit Earned vs Expected Profit */}
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
          />
        </div>
      </section>
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
      <section aria-label="Personal Portfolio Summary">
        {renderSectionHeader("Personal Portfolio Summary")}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Total Paid So Far vs Total Property Value */}
          <CyclingKpiCard
            cardAccentColor="blue"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Paid So Far",
              badge: "Paid",
              value: formatINR(totalInvestmentDone),
              valueColor: "text-slate-900",
              subtitle: `Across ${properties.length} personal ${
                properties.length === 1 ? "home" : "properties"
              }`,
              icon: Wallet,
            }}
            panelB={{
              title: "Total Property Cost",
              badge: "Agreed",
              value: formatINR(totalAgreedValue),
              valueColor: "text-blue-700",
              subtitle: `Remaining: ${formatINR(totalPendingCommitment)}`,
              icon: Building2,
            }}
          />

          {/* Card 2: Savings Added vs Funds Withdrawn */}
          <CyclingKpiCard
            cardAccentColor="purple"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Savings Added",
              badge: "Added",
              value: formatINR(inflowsTotal),
              valueColor: "text-slate-900",
              subtitle: "Personal savings & income",
              icon: Landmark,
            }}
            panelB={{
              title: "Funds Taken Out",
              badge: "Withdrawn",
              value: formatINR(withdrawalsTotal),
              valueColor: "text-violet-700",
              subtitle: "Refunds & personal drawings",
              icon: Coins,
            }}
          />

          {/* Card 3: Bank Balance vs Combined Funds */}
          <CyclingKpiCard
            cardAccentColor="emerald"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Bank Balance",
              badge: "Bank",
              value: formatINR(currentBankBalance),
              valueColor: "text-emerald-700",
              subtitle: "Ready for next payment",
              icon: Banknote,
            }}
            panelB={{
              title: "Total Available",
              badge: "Combined",
              value: formatINR(netPersonalLiquidity),
              valueColor: "text-emerald-700",
              subtitle: `Cash in hand: ${formatINR(currentCashBalance)}`,
              icon: Wallet,
            }}
          />

          {/* Card 4: Cash in Hand vs Remaining to Pay */}
          <CyclingKpiCard
            cardAccentColor="amber"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Cash in Hand",
              badge: "Cash",
              value: formatINR(currentCashBalance),
              valueColor: "text-slate-900",
              subtitle: "For site visits & small expenses",
              icon: Clock,
            }}
            panelB={{
              title: "Balance Left to Pay",
              badge: "Pending",
              value: formatINR(totalPendingCommitment),
              valueColor: "text-amber-700",
              subtitle: "Upcoming builder installments",
              icon: Building2,
            }}
          />
        </div>
      </section>
    );
  }

  return null;
};
