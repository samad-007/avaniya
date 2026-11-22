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
      cardAccentColor="positive"
      panelA={{
        title: "Profit Earned",
        badge: "Earned",
        value: formatINR(totalRealizedProfit),
        valueColor:
          totalRealizedProfit >= 0 ? "text-md-positive" : "text-md-error",
        subtitle:
          totalPendingProfit > 0 ? (
            <span className="text-md-warning font-semibold">
              {formatINR(totalPendingProfit)} still to collect
            </span>
          ) : profitWithdrawalsTotal > 0 ? (
            <span>Withdrawn: {formatINR(profitWithdrawalsTotal)}</span>
          ) : (
            <span>
              From {soldDealsCount} sold{" "}
              {soldDealsCount === 1 ? "property" : "properties"}
            </span>
          ),
        icon: TrendingUp,
      }}
      panelB={{
        title: "Expected Profit",
        badge: "Projected",
        value: formatINR(totalProjectedProfit),
        valueColor: "text-md-positive",
        subtitle: (
          <span>
            Est. gain on {activeDealsCount} active{" "}
            {activeDealsCount === 1 ? "deal" : "deals"}
          </span>
        ),
        icon: Target,
      }}
      {...cyclingProps}
    />
  );
};
