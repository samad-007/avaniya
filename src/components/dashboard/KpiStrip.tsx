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
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <span className="font-display text-sm font-bold text-md-on-surface tracking-tight">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1 bg-md-surface-container p-1 rounded-full text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => handleSelectPanel("A")}
          className={`px-3 py-1 rounded-full transition-all ${ activePanel === "A" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant hover:text-md-on-surface" }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => handleSelectPanel("B")}
          className={`px-3 py-1 rounded-full transition-all ${ activePanel === "B" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant hover:text-md-on-surface" }`}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <CyclingKpiCard
            cardAccentColor="tertiary"
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
                netBankLiquidity >= 0
                  ? "text-md-on-surface"
                  : "text-md-error",
              subtitle: "Available in bank account",
              icon: Landmark,
            }}
            panelB={{
              title: "Total Bank Receipts",
              badge: "Inflows",
              value: formatINR(bankInflowsGross),
              valueColor: "text-md-tertiary",
              subtitle: "All bank credits received",
              icon: ArrowDownLeft,
            }}
          />

          <CyclingKpiCard
            cardAccentColor="primary"
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
                netCashLiquidity >= 0
                  ? "text-md-on-surface"
                  : "text-md-error",
              subtitle: "Physical cash available",
              icon: Banknote,
            }}
            panelB={{
              title: "Total Cash Spent",
              badge: "Spent",
              value: formatINR(outflowsCash),
              valueColor: "text-md-on-surface",
              subtitle: "Site, legal & registration cash",
              icon: TrendingDown,
            }}
          />

          <CyclingKpiCard
            cardAccentColor="secondary"
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
                currentNetLiquidity >= 0
                  ? "text-md-primary"
                  : "text-md-error",
              subtitle: "Bank + Cash combined",
              icon: Wallet,
            }}
            panelB={{
              title: "Your Net Capital",
              badge: "Capital",
              value: formatINR(netCapitalInjected),
              valueColor: "text-md-primary",
              subtitle: `Put in: ${formatINR(capitalInjectedTotal)}`,
              icon: Coins,
            }}
          />

          <CyclingKpiCard
            cardAccentColor="warning"
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
                totalPendingPayable > 0
                  ? "text-md-warning"
                  : "text-md-on-surface",
              subtitle: `Across ${propertyMetrics.length} ${
                propertyMetrics.length === 1 ? "property" : "properties"
              }`,
              icon: Clock,
            }}
            panelB={{
              title: "Total Deal Cost",
              badge: "Total Cost",
              value: formatINR(totalProjectOutlay),
              valueColor: "text-md-on-surface",
              subtitle: `Buy ${formatINR(totalAgreedBuyPrice)} + Costs ${formatINR(totalPropertyExpenses)}`,
              icon: Landmark,
            }}
          />

          <CyclingKpiCard
            cardAccentColor="error"
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
                  ? "text-md-error"
                  : "text-md-on-surface-variant",
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
              valueColor: "text-md-positive",
              subtitle: "Pending from property sales",
              icon: ArrowDownLeft,
            }}
          />

          <ProfitKpiCard
            cardAccentColor="positive"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <CyclingKpiCard
            cardAccentColor="tertiary"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Paid So Far",
              badge: "Paid",
              value: formatINR(totalInvestmentDone),
              valueColor: "text-md-on-surface",
              subtitle: `Across ${properties.length} personal ${
                properties.length === 1 ? "home" : "properties"
              }`,
              icon: Wallet,
            }}
            panelB={{
              title: "Total Property Cost",
              badge: "Agreed",
              value: formatINR(totalAgreedValue),
              valueColor: "text-md-tertiary",
              subtitle: `Remaining: ${formatINR(totalPendingCommitment)}`,
              icon: Building2,
            }}
          />

          <CyclingKpiCard
            cardAccentColor="secondary"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Savings Added",
              badge: "Added",
              value: formatINR(inflowsTotal),
              valueColor: "text-md-on-surface",
              subtitle: "Personal savings & income",
              icon: Landmark,
            }}
            panelB={{
              title: "Funds Taken Out",
              badge: "Withdrawn",
              value: formatINR(withdrawalsTotal),
              valueColor: "text-md-secondary",
              subtitle: "Refunds & personal drawings",
              icon: Coins,
            }}
          />

          <CyclingKpiCard
            cardAccentColor="positive"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Bank Balance",
              badge: "Bank",
              value: formatINR(currentBankBalance),
              valueColor: "text-md-positive",
              subtitle: "Ready for next payment",
              icon: Banknote,
            }}
            panelB={{
              title: "Total Available",
              badge: "Combined",
              value: formatINR(netPersonalLiquidity),
              valueColor: "text-md-positive",
              subtitle: `Cash in hand: ${formatINR(currentCashBalance)}`,
              icon: Wallet,
            }}
          />

          <CyclingKpiCard
            cardAccentColor="warning"
            activePanel={activePanel}
            isFlipping={isFlipping}
            onClick={handleCardClick}
            onSelectPanel={handleSelectPanel}
            onSwipe={handleSwipe}
            panelA={{
              title: "Cash in Hand",
              badge: "Cash",
              value: formatINR(currentCashBalance),
              valueColor: "text-md-on-surface",
              subtitle: "For site visits & small expenses",
              icon: Clock,
            }}
            panelB={{
              title: "Balance Left to Pay",
              badge: "Pending",
              value: formatINR(totalPendingCommitment),
              valueColor: "text-md-warning",
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
