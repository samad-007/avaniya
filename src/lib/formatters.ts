/**
 * Format numbers to Indian Rupee standard format (e.g. 12500000 -> "₹ 1,25,00,000")
 */
export function formatINR(
  amount: number | null | undefined,
  includeSymbol: boolean = true
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? "₹ 0" : "0";
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  // Indian number formatting with regex
  const numStr = absAmount.toString();
  let lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);

  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }

  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  const prefix = isNegative ? "- " : "";
  const symbol = includeSymbol ? "₹ " : "";

  return `${prefix}${symbol}${formatted}`;
}

/**
 * Format numbers into compact verbal Indian representation (e.g. 12500000 -> "₹ 1.25 Cr", 450000 -> "₹ 4.50 L")
 */
export function formatINRCompact(
  amount: number | null | undefined,
  includeSymbol: boolean = true
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? "₹ 0" : "0";
  }

  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const prefix = isNegative ? "- " : "";
  const symbol = includeSymbol ? "₹ " : "";

  if (abs >= 10000000) {
    const cr = (abs / 10000000).toFixed(2);
    return `${prefix}${symbol}${cr} Cr`;
  } else if (abs >= 100000) {
    const l = (abs / 100000).toFixed(2);
    return `${prefix}${symbol}${l} L`;
  } else if (abs >= 1000) {
    const k = (abs / 1000).toFixed(1);
    return `${prefix}${symbol}${k} k`;
  }

  return `${prefix}${symbol}${Math.round(abs).toLocaleString("en-IN")}`;
}

/**
 * Convert number into human-readable words (e.g. 500000 -> "Five Lakh Rupees / ₹ 0.05 Crore")
 */
export function amountToVerbalSummary(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) {
    return "₹ 0";
  }

  const formatted = formatINR(amount, true);
  let words = "";

  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    words = `${cr} Crore Rupees`;
  } else if (amount >= 100000) {
    const l = (amount / 100000).toFixed(2);
    const crEquivalent = (amount / 10000000).toFixed(2);
    words = `${l} Lakh Rupees (${crEquivalent} Cr)`;
  } else if (amount >= 1000) {
    const k = (amount / 1000).toFixed(1);
    words = `${k} Thousand Rupees`;
  } else {
    words = `${amount.toLocaleString("en-IN")} Rupees`;
  }

  return `${formatted} (${words})`;
}

/**
 * Format ISO date string or Date object into Indian standard "DD MMM YYYY"
 */
export function formatDateIN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}
