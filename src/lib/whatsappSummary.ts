import { formatINRCompact, formatINR, formatDateIN } from "./formatters";
import {
  PropertyFinancialMetrics,
  LoanFinancialMetrics,
  CommercialDashboardMetrics,
} from "./formulaEngine";
import { SeedProperty, SeedLoan } from "./seedData";

/**
 * Generate clean, professional WhatsApp text snapshot for a Commercial Land Deal
 */
export function formatPropertyWhatsApp(pm: PropertyFinancialMetrics): string {
  const p = pm.property;
  const lines: string[] = [
    "*AVANIYA REAL ESTATE UPDATE*",
    `Property: *${p.name}* (${p.propertyCode})`,
    p.location ? `Location: ${p.location}` : "",
    `Status: ${p.status.toUpperCase()}`,
    "--------------------------------",
    `Agreed Buy Price:   ${formatINR(p.agreedPurchasePrice)}`,
    `Expenses Paid:      ${formatINR(pm.propertyExpenses)}`,
    `Total Project Cost: ${formatINR(pm.totalProjectOutlay)}`,
    `Paid to Seller:     ${formatINR(pm.purchasePaidTotal)}`,
    `Pending to Seller:  ${formatINR(pm.pendingOutflow)}`,
    "--------------------------------",
    p.agreedSellingPrice && p.agreedSellingPrice > 0
      ? `Agreed Sale Price:  ${formatINR(p.agreedSellingPrice)}`
      : p.targetSalePrice && p.targetSalePrice > 0
      ? `Target Sale Price:  ${formatINR(p.targetSalePrice)}`
      : "",
    `Receipts Collected: ${formatINR(pm.totalReceiptsCollected)}`,
    `Pending from Buyer: ${formatINR(pm.pendingInflow)}`,
    `Projected Profit:   ${formatINR(pm.projectedProfit)}`,
  ];

  if (pm.realizedProfit > 0) {
    lines.push(`Realized Profit:    ${formatINR(pm.realizedProfit)} (Collected)`);
  }

  if (pm.daysToDeadline !== undefined && p.agreementDueDate) {
    const days = pm.daysToDeadline;
    const alertText =
      days < 0
        ? `EXPIRED (${Math.abs(days)} days ago)`
        : days === 0
        ? "DUE TODAY"
        : `${days} days left (${formatDateIN(p.agreementDueDate)})`;
    lines.push(`Registration Due:   ${alertText}`);
  }

  if (pm.subPlotStats && pm.subPlotStats.totalPlots > 0) {
    const sp = pm.subPlotStats;
    lines.push("--------------------------------");
    lines.push(
      `Layout Plots: ${sp.sold} Sold | ${sp.booked} Booked | ${sp.available} Available (Total: ${sp.totalPlots})`
    );
  }

  if (pm.partnerAllocations && pm.partnerAllocations.length > 0) {
    lines.push("--------------------------------");
    lines.push("*JV Partner Allocation:*");
    pm.partnerAllocations.forEach((pa) => {
      lines.push(
        `- ${pa.name} (${pa.equityPct}%): Cost ${formatINRCompact(pa.costShare)} | Profit ${formatINRCompact(pa.projectedProfitShare)}`
      );
    });
  }

  lines.push("--------------------------------");
  lines.push(`Generated: ${new Date().toLocaleDateString("en-IN")}`);

  return lines.filter(Boolean).join("\n");
}

/**
 * Generate clean WhatsApp text snapshot for a Loan / Debt Facility
 */
export function formatLoanWhatsApp(
  loanOrMetric: SeedLoan | LoanFinancialMetrics,
  optionalMetric?: LoanFinancialMetrics
): string {
  const l: SeedLoan = "loan" in loanOrMetric ? loanOrMetric.loan : loanOrMetric;
  const lm = "loan" in loanOrMetric ? loanOrMetric : optionalMetric;

  const totalBorrowed = lm?.totalBorrowed ?? l.principalAmount;
  const principalRepaid = lm?.principalRepaidTotal ?? 0;
  const outstandingPrincipal = lm?.outstandingPrincipal ?? l.principalAmount;
  const interestPaid = lm?.interestPaidTotal ?? 0;
  const profitSharePaid = lm?.profitSharePaidTotal ?? 0;
  const financeCost = lm?.totalFinanceCost ?? interestPaid + profitSharePaid;
  const progressPct =
    lm?.repaymentProgressPct ??
    (totalBorrowed > 0
      ? Math.min(100, Math.round((principalRepaid / totalBorrowed) * 100))
      : 0);

  const lines: string[] = [
    "*AVANIYA DEBT & FINANCING UPDATE*",
    `Lender: *${l.lenderName}* (${l.loanCode})`,
    `Type: ${l.lenderType.replace("_", " ").toUpperCase()}`,
    "--------------------------------",
    `Sanctioned Amount:  ${formatINR(l.principalAmount)}`,
    `Borrowed Inward:    ${formatINR(totalBorrowed)}`,
    `Principal Repaid:   ${formatINR(principalRepaid)}`,
    `Outstanding Debt:   *${formatINR(outstandingPrincipal)}*`,
    "--------------------------------",
  ];

  if ((l.interestRatePct || 0) > 0) {
    lines.push(
      `Interest Rate:      ${l.interestRatePct}% p.a. (Paid: ${formatINR(interestPaid)})`
    );
  }

  if ((l.profitSharePct || 0) > 0) {
    lines.push(
      `Profit Share:       ${l.profitSharePct}% (Paid: ${formatINR(profitSharePaid)})`
    );
  }

  lines.push(`Total Finance Cost: ${formatINR(financeCost)}`);
  lines.push(`Repayment Progress: ${progressPct}%`);
  lines.push("--------------------------------");
  lines.push(`Generated: ${new Date().toLocaleDateString("en-IN")}`);

  return lines.filter(Boolean).join("\n");
}

/**
 * Generate clean WhatsApp text snapshot for a Personal Property / Asset
 */
export function formatPersonalPropertyWhatsApp(data: {
  property: SeedProperty;
  totalInvested: number;
  pendingCommitment: number;
}): string {
  const p = data.property;
  const progressPct =
    p.agreedPurchasePrice > 0
      ? Math.min(
          100,
          Math.round((data.totalInvested / p.agreedPurchasePrice) * 100)
        )
      : 0;

  const lines: string[] = [
    "*AVANIYA PERSONAL ASSET UPDATE*",
    `Property: *${p.name}* (${p.propertyCode})`,
    p.location ? `Location: ${p.location}` : "",
    `Status: ${p.status.toUpperCase()}`,
    "--------------------------------",
    `Agreed Asset Cost:    ${formatINR(p.agreedPurchasePrice)}`,
    `Total Invested:       ${formatINR(data.totalInvested)} (${progressPct}%)`,
    `Pending Commitment:   ${formatINR(data.pendingCommitment)}`,
  ];

  if (p.agreementDueDate) {
    lines.push(`Due Date:             ${formatDateIN(p.agreementDueDate)}`);
  }

  if (p.milestones && p.milestones.length > 0) {
    const done = p.milestones.filter((m) => m.status === "completed").length;
    lines.push(`Milestones Completed: ${done} / ${p.milestones.length}`);
  }

  lines.push("--------------------------------");
  lines.push(`Generated: ${new Date().toLocaleDateString("en-IN")}`);

  return lines.filter(Boolean).join("\n");
}

/**
 * Generate Portfolio Executive Summary for WhatsApp
 */
export function formatPortfolioWhatsApp(
  m: CommercialDashboardMetrics,
  scope?: "commercial" | "personal"
): string {
  const lines: string[] = [
    "*AVANIYA PORTFOLIO EXECUTIVE UPDATE*",
    `Date: ${new Date().toLocaleDateString("en-IN")}`,
    "--------------------------------",
    `Net Bank Liquidity:  ${formatINR(m.netBankLiquidity)}`,
    `Cash in Hand:        ${formatINR(m.netCashLiquidity)}`,
    `Total Net Liquidity: *${formatINR(m.currentNetLiquidity)}*`,
    "--------------------------------",
    `Commercial Outlays:  ${formatINR(m.outflowsTotal)}`,
    `Pending to Sellers:  ${formatINR(m.totalPendingPayable)}`,
    `Buyer Receivables:   ${formatINR(m.totalPendingReceivable)}`,
  ];

  if (m.outstandingLoansPrincipal > 0) {
    lines.push(`Active Loan Debt:    ${formatINR(m.outstandingLoansPrincipal)}`);
  }

  lines.push(`Realized Profit:     ${formatINR(m.totalRealizedProfit)}`);
  lines.push("--------------------------------");

  return lines.join("\n");
}

/**
 * Open WhatsApp with pre-filled text or fallback to clipboard
 */
export function openWhatsAppShare(text: string): boolean {
  try {
    const encoded = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, "_blank");
    return true;
  } catch {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    return false;
  }
}
