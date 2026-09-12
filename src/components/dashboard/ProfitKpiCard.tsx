"use client";

import React from "react";
import { formatINR } from "@/lib/formatters";
import { TrendingUp, Target } from "lucide-react";
import { CyclingKpiCard, CyclingKpiCardProps } from "./CyclingKpiCard";

export interface ProfitKpiCardProps
  extends Omit<CyclingKpiCardProps, "panelA" | "panelB"> {
  totalRealizedProfit: number;
  totalProjectedProfit: number;
  totalPendingProfit: number;
  profitWithdrawalsTotal: number;
  activeDealsCount: number;
  soldDealsCount: number;
}

export const ProfitKpiCard: React.FC<ProfitKpiCardProps> = ({
  totalRealizedProfit,
  totalProjectedProfit,
  totalPendingProfit,
  profitWithdrawalsTotal,
  activeDealsCount,
  soldDealsCount,
  ...cyclingProps
}) => {
  return (
    <CyclingKpiCard
      cardAccentColor="emerald"
      panelA={{
        title: "Actual Profit",
        badge: "REALIZED",
        badgeColor: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
        titleColor: "text-emerald-400",
        value: formatINR(totalRealizedProfit),
        subtitle:
          totalPendingProfit > 0 ? (
            <span className="text-amber-400/90">
              Pending: {formatINR(totalPendingProfit)} to collect
            </span>
          ) : profitWithdrawalsTotal > 0 ? (
            <span>Drawings: -{formatINR(profitWithdrawalsTotal)}</span>
          ) : (
            <span>
              Settled Gains ({soldDealsCount}{" "}
              {soldDealsCount === 1 ? "Deal" : "Deals"} Sold)
            </span>
          ),
        icon: TrendingUp,
        iconColor: "text-[#22C55E]",
      }}
      panelB={{
        title: "Projected Profit",
        badge: "PIPELINE",
        badgeColor: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
        titleColor: "text-emerald-400",
        value: formatINR(totalProjectedProfit),
        subtitle: (
          <span>
            Across {activeDealsCount} Active{" "}
            {activeDealsCount === 1 ? "Deal" : "Deals"} (Unsold)
          </span>
        ),
        icon: Target,
        iconColor: "text-[#22C55E]",
      }}
      {...cyclingProps}
    />
  );
};
