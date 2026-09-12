import {
  SeedProperty,
  SeedTransaction,
  SeedCategory,
  SeedLoan,
} from "./seedData";

export interface PropertyFinancialMetrics {
  property: SeedProperty;
  purchasePaidCash: number;
  purchasePaidBank: number;
  purchasePaidTotal: number;
  propertyExpenses: number;
  totalProjectOutlay: number; // Agreed Buy Price + Total Property Expenses
  totalOutflowsPaid: number; // Purchase Principal Paid + Property Expenses Paid
  receiptsReceivedCash: number;
  receiptsReceivedBank: number;
  totalReceiptsCollected: number;
  pendingOutflow: number; // Remaining payable to seller
  pendingInflow: number; // Remaining receivable from buyer
  projectedProfit: number; // Selling/Target Price - Total Project Outlay
  realizedProfit: number; // Total Receipts Collected - Total Outflows Paid
  pendingProfit: number; // Remaining profit to be received from buyer
  transactions: SeedTransaction[];
}

export interface LoanFinancialMetrics {
  loan: SeedLoan;
  totalBorrowedCash: number;
  totalBorrowedBank: number;
  totalBorrowed: number;
  principalRepaidCash: number;
  principalRepaidBank: number;
  principalRepaidTotal: number;
  interestPaidCash: number;
  interestPaidBank: number;
  interestPaidTotal: number;
  profitSharePaidCash: number;
  profitSharePaidBank: number;
  profitSharePaidTotal: number;
  totalFinanceCost: number;
  outstandingPrincipal: number;
  repaymentProgressPct: number;
  transactions: SeedTransaction[];
}

export interface CommercialDashboardMetrics {
  capitalInjectedBank: number;
  capitalInjectedCash: number;
  capitalInjectedTotal: number;
  capitalWithdrawalsBank: number;
  capitalWithdrawalsCash: number;
  capitalWithdrawalsTotal: number;
  netCapitalInjected: number;
  profitWithdrawalsBank: number;
  profitWithdrawalsCash: number;
  profitWithdrawalsTotal: number;
  outflowsBank: number;
  outflowsCash: number;
  outflowsTotal: number;
  dealInflowsBank: number;
  dealInflowsCash: number;
  dealInflowsTotal: number;
  loansBorrowedBank: number;
  loansBorrowedCash: number;
  loansBorrowedTotal: number;
  loansRepaidBank: number;
  loansRepaidCash: number;
  loansRepaidTotal: number;
  loansInterestPaidBank: number;
  loansInterestPaidCash: number;
  loansInterestPaidTotal: number;
  loansProfitSharePaidBank: number;
  loansProfitSharePaidCash: number;
  loansProfitSharePaidTotal: number;
  totalFinanceCosts: number;
  outstandingLoansPrincipal: number;
  totalLiabilitiesAndObligations: number;
  transfersBankToCash: number;
  transfersCashToBank: number;
  netBankLiquidity: number;
  netCashLiquidity: number;
  currentNetLiquidity: number;
  totalAgreedBuyPrice: number;
  totalPropertyExpenses: number;
  totalProjectOutlay: number;
  totalTargetSalePrice: number;
  totalAgreedSalePrice: number;
  totalPendingPayable: number;
  totalPendingReceivable: number;
  totalRealizedProfit: number;
  totalProjectedProfit: number;
  totalPendingProfit: number;
  propertyMetrics: PropertyFinancialMetrics[];
  loanMetrics: LoanFinancialMetrics[];
}

export interface PersonalDashboardMetrics {
  inflowsBank: number;
  inflowsCash: number;
  inflowsTotal: number;
  outflowsBank: number;
  outflowsCash: number;
  outflowsTotal: number;
  withdrawalsBank: number;
  withdrawalsCash: number;
  withdrawalsTotal: number;
  cashToBank: number;
  bankToCash: number;
  currentBankBalance: number;
  currentCashBalance: number;
  netPersonalLiquidity: number;
  totalInvestmentDone: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  properties: {
    property: SeedProperty;
    totalInvested: number;
    pendingCommitment: number;
    transactions: SeedTransaction[];
  }[];
}

/**
 * Calculate Commercial Dashboard and Property Ledger Metrics
 */
export function calculateCommercialMetrics(
  properties: SeedProperty[],
  transactions: SeedTransaction[],
  categories: SeedCategory[] = [],
  loans: SeedLoan[] = []
): CommercialDashboardMetrics {
  const commProps = properties.filter((p) => p.type === "commercial");
  const commTx = transactions.filter((t) => t.scope === "commercial");

  // Build role lookup map from categories
  const roleMap = new Map<string, string>();
  categories.forEach((c) => roleMap.set(c.name.toLowerCase(), c.financialRole));

  // Helper to determine if category is purchase principal
  const isPurchasePrincipal = (catName: string) => {
    const role = roleMap.get(catName.toLowerCase());
    if (role === "purchase_principal") return true;
    const lower = catName.toLowerCase();
    return lower.includes("purchase") || lower.includes("token advance") || lower.includes("sale deed");
  };

  // Capital Inflows (External Funding)
  const capTx = commTx.filter((t) => t.transactionType === "capital_inflow");
  const capitalInjectedBank = capTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const capitalInjectedCash = capTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const capitalInjectedTotal = capitalInjectedBank + capitalInjectedCash;

  // Capital / Investment Withdrawals (Equity Reduction / Refunds)
  const capWthTx = commTx.filter((t) => t.transactionType === "capital_withdrawal");
  const capitalWithdrawalsBank = capWthTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const capitalWithdrawalsCash = capWthTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const capitalWithdrawalsTotal = capitalWithdrawalsBank + capitalWithdrawalsCash;
  const netCapitalInjected = capitalInjectedTotal - capitalWithdrawalsTotal;

  // Profit Withdrawals (Drawings for other business / dividends)
  const profWthTx = commTx.filter((t) => t.transactionType === "profit_withdrawal");
  const profitWithdrawalsBank = profWthTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const profitWithdrawalsCash = profWthTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const profitWithdrawalsTotal = profitWithdrawalsBank + profitWithdrawalsCash;

  // Property Outflows
  const outTx = commTx.filter((t) => t.transactionType === "outflow");
  const outflowsBank = outTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const outflowsCash = outTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const outflowsTotal = outflowsBank + outflowsCash;

  // Deal Inflows (Sale Receipts)
  const dealInTx = commTx.filter((t) => t.transactionType === "deal_inflow");
  const dealInflowsBank = dealInTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const dealInflowsCash = dealInTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const dealInflowsTotal = dealInflowsBank + dealInflowsCash;

  // Loan Borrowings / Inflows
  const loanInTx = commTx.filter((t) => t.transactionType === "loan_inflow");
  const loansBorrowedBank = loanInTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const loansBorrowedCash = loanInTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const loansBorrowedTotal = loansBorrowedBank + loansBorrowedCash;

  // Loan Principal Repayments
  const loanRepayTx = commTx.filter((t) => t.transactionType === "loan_repayment");
  const loansRepaidBank = loanRepayTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const loansRepaidCash = loanRepayTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const loansRepaidTotal = loansRepaidBank + loansRepaidCash;

  // Loan Interest Paid
  const loanIntTx = commTx.filter((t) => t.transactionType === "loan_interest");
  const loansInterestPaidBank = loanIntTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const loansInterestPaidCash = loanIntTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const loansInterestPaidTotal = loansInterestPaidBank + loansInterestPaidCash;

  // Loan Profit Share Paid
  const loanProfTx = commTx.filter((t) => t.transactionType === "loan_profit_share");
  const loansProfitSharePaidBank = loanProfTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const loansProfitSharePaidCash = loanProfTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const loansProfitSharePaidTotal = loansProfitSharePaidBank + loansProfitSharePaidCash;

  const totalFinanceCosts = loansInterestPaidTotal + loansProfitSharePaidTotal;
  const outstandingLoansPrincipal = Math.max(0, loansBorrowedTotal - loansRepaidTotal);

  // Internal Transfers
  const trfTx = commTx.filter((t) => t.transactionType === "transfer");
  const transfersBankToCash = trfTx
    .filter(
      (t) =>
        t.transferType === "Bank Withdrawal to Cash" ||
        t.transferType === "Bank to Cash"
    )
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const transfersCashToBank = trfTx
    .filter(
      (t) =>
        t.transferType === "Cash Deposit to Bank" ||
        t.transferType === "Cash to Bank"
    )
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Exact formulas with withdrawal and loan reconciliation:
  // Net Bank = Gross Capital (Bank) - Capital Withdrawn (Bank) - Profit Withdrawn (Bank) - Outflows (Bank) + Deal Inflows (Bank) + Loans Borrowed (Bank) - Loans Repaid (Bank) - Loan Interest (Bank) - Loan Profit Share (Bank) - Trf (Bank->Cash) + Trf (Cash->Bank)
  const netBankLiquidity =
    capitalInjectedBank -
    capitalWithdrawalsBank -
    profitWithdrawalsBank -
    outflowsBank +
    dealInflowsBank +
    loansBorrowedBank -
    loansRepaidBank -
    loansInterestPaidBank -
    loansProfitSharePaidBank -
    transfersBankToCash +
    transfersCashToBank;

  // Net Cash = Gross Capital (Cash) - Capital Withdrawn (Cash) - Profit Withdrawn (Cash) - Outflows (Cash) + Deal Inflows (Cash) + Loans Borrowed (Cash) - Loans Repaid (Cash) - Loan Interest (Cash) - Loan Profit Share (Cash) + Trf (Bank->Cash) - Trf (Cash->Bank)
  const netCashLiquidity =
    capitalInjectedCash -
    capitalWithdrawalsCash -
    profitWithdrawalsCash -
    outflowsCash +
    dealInflowsCash +
    loansBorrowedCash -
    loansRepaidCash -
    loansInterestPaidCash -
    loansProfitSharePaidCash +
    transfersBankToCash -
    transfersCashToBank;

  const currentNetLiquidity = netBankLiquidity + netCashLiquidity;

  // Calculate per-property financial metrics
  const propertyMetrics: PropertyFinancialMetrics[] = commProps.map((p) => {
    const pTx = commTx.filter(
      (t) =>
        t.propertyCode === p.propertyCode ||
        t.propertyCode === p.name ||
        (t.remarks && t.remarks.includes(p.name))
    );

    const pOutflows = pTx.filter((t) => t.transactionType === "outflow");
    const pInflows = pTx.filter((t) => t.transactionType === "deal_inflow");

    const purchasePaidCash = pOutflows
      .filter((t) => t.mode === "Cash" && isPurchasePrincipal(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    const purchasePaidBank = pOutflows
      .filter((t) => t.mode === "Bank" && isPurchasePrincipal(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    const purchasePaidTotal = purchasePaidCash + purchasePaidBank;

    const propertyExpenses = pOutflows
      .filter((t) => !isPurchasePrincipal(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalProjectOutlay = p.agreedPurchasePrice + propertyExpenses;
    const totalOutflowsPaid = purchasePaidTotal + propertyExpenses;

    const receiptsReceivedCash = pInflows
      .filter((t) => t.mode === "Cash")
      .reduce((sum, t) => sum + t.amount, 0);

    const receiptsReceivedBank = pInflows
      .filter((t) => t.mode === "Bank")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReceiptsCollected =
      receiptsReceivedCash + receiptsReceivedBank;

    const pendingOutflow =
      p.agreedPurchasePrice > 0
        ? Math.max(0, p.agreedPurchasePrice - purchasePaidTotal)
        : 0;

    const pendingInflow =
      (p.agreedSellingPrice || 0) > 0
        ? Math.max(0, (p.agreedSellingPrice || 0) - totalReceiptsCollected)
        : 0;

    const projectedProfit =
      (p.agreedSellingPrice || 0) > 0
        ? (p.agreedSellingPrice || 0) - totalProjectOutlay
        : (p.targetSalePrice || 0) > 0
        ? (p.targetSalePrice || 0) - totalProjectOutlay
        : 0;

    const isSoldOrClosed = p.status === "sold" || p.status === "closed";

    // Cost Recovery Realized Profit on Sold Assets:
    // Recognized strictly after cumulative receipts exceed total project cost basis.
    // In-progress or open assets recognize 0 realized profit.
    const realizedProfit = isSoldOrClosed
      ? Math.max(0, totalReceiptsCollected - totalProjectOutlay)
      : 0;

    // Remaining profit pending collection from buyer
    const pendingProfit = Math.max(0, projectedProfit - realizedProfit);

    return {
      property: p,
      purchasePaidCash,
      purchasePaidBank,
      purchasePaidTotal,
      propertyExpenses,
      totalProjectOutlay,
      totalOutflowsPaid,
      receiptsReceivedCash,
      receiptsReceivedBank,
      totalReceiptsCollected,
      pendingOutflow,
      pendingInflow,
      projectedProfit,
      realizedProfit,
      pendingProfit,
      transactions: pTx.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  });

  const totalAgreedBuyPrice = commProps.reduce(
    (sum, p) => sum + (p.agreedPurchasePrice || 0),
    0
  );
  const totalPropertyExpenses = propertyMetrics.reduce(
    (sum, pm) => sum + pm.propertyExpenses,
    0
  );
  const totalProjectOutlay = totalAgreedBuyPrice + totalPropertyExpenses;

  const totalTargetSalePrice = commProps.reduce(
    (sum, p) => sum + (p.targetSalePrice || 0),
    0
  );
  const totalAgreedSalePrice = commProps.reduce(
    (sum, p) => sum + (p.agreedSellingPrice || 0),
    0
  );
  const totalPendingPayable = propertyMetrics.reduce(
    (sum, pm) => sum + pm.pendingOutflow,
    0
  );
  const totalPendingReceivable = propertyMetrics.reduce(
    (sum, pm) => sum + pm.pendingInflow,
    0
  );
  const totalRealizedProfit = propertyMetrics.reduce(
    (sum, pm) => sum + pm.realizedProfit,
    0
  );

  // Active pipeline projected profit (unsold properties only - Question 2 Option A)
  const totalProjectedProfit = propertyMetrics
    .filter(
      (pm) => pm.property.status !== "sold" && pm.property.status !== "closed"
    )
    .reduce((sum, pm) => sum + Math.max(0, pm.projectedProfit), 0);

  const totalPendingProfit = propertyMetrics.reduce(
    (sum, pm) => sum + pm.pendingProfit,
    0
  );

  // Per-Loan Financial Metrics
  const commLoans = loans.filter((l) => l.scope === "commercial");
  const loanMetrics: LoanFinancialMetrics[] = commLoans.map((l) => {
    const lTx = commTx.filter(
      (t) =>
        t.loanId === l.id ||
        t.loanCode === l.loanCode ||
        (t.recipientOrSource &&
          t.recipientOrSource.toLowerCase().includes(l.lenderName.toLowerCase())) ||
        (t.remarks &&
          l.loanCode &&
          t.remarks.toLowerCase().includes(l.loanCode.toLowerCase()))
    );

    const lInflows = lTx.filter((t) => t.transactionType === "loan_inflow");
    const totalBorrowedBank = lInflows
      .filter((t) => t.mode === "Bank")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalBorrowedCash = lInflows
      .filter((t) => t.mode === "Cash")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalBorrowed =
      totalBorrowedBank + totalBorrowedCash || l.principalAmount || 0;

    const lRepayments = lTx.filter(
      (t) => t.transactionType === "loan_repayment"
    );
    const principalRepaidBank = lRepayments
      .filter((t) => t.mode === "Bank")
      .reduce((sum, t) => sum + t.amount, 0);
    const principalRepaidCash = lRepayments
      .filter((t) => t.mode === "Cash")
      .reduce((sum, t) => sum + t.amount, 0);
    const principalRepaidTotal = principalRepaidBank + principalRepaidCash;

    const lInterest = lTx.filter((t) => t.transactionType === "loan_interest");
    const interestPaidBank = lInterest
      .filter((t) => t.mode === "Bank")
      .reduce((sum, t) => sum + t.amount, 0);
    const interestPaidCash = lInterest
      .filter((t) => t.mode === "Cash")
      .reduce((sum, t) => sum + t.amount, 0);
    const interestPaidTotal = interestPaidBank + interestPaidCash;

    const lProfitShare = lTx.filter(
      (t) => t.transactionType === "loan_profit_share"
    );
    const profitSharePaidBank = lProfitShare
      .filter((t) => t.mode === "Bank")
      .reduce((sum, t) => sum + t.amount, 0);
    const profitSharePaidCash = lProfitShare
      .filter((t) => t.mode === "Cash")
      .reduce((sum, t) => sum + t.amount, 0);
    const profitSharePaidTotal = profitSharePaidBank + profitSharePaidCash;

    const totalFinanceCost = interestPaidTotal + profitSharePaidTotal;
    const outstandingPrincipal = Math.max(
      0,
      totalBorrowed - principalRepaidTotal
    );
    const repaymentProgressPct =
      totalBorrowed > 0
        ? Math.min(
            100,
            Math.round((principalRepaidTotal / totalBorrowed) * 100)
          )
        : 0;

    return {
      loan: l,
      totalBorrowedCash,
      totalBorrowedBank,
      totalBorrowed,
      principalRepaidCash,
      principalRepaidBank,
      principalRepaidTotal,
      interestPaidCash,
      interestPaidBank,
      interestPaidTotal,
      profitSharePaidCash,
      profitSharePaidBank,
      profitSharePaidTotal,
      totalFinanceCost,
      outstandingPrincipal,
      repaymentProgressPct,
      transactions: lTx.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  });

  const totalLiabilitiesAndObligations =
    totalPendingPayable + outstandingLoansPrincipal;

  return {
    capitalInjectedBank: Math.round(capitalInjectedBank),
    capitalInjectedCash: Math.round(capitalInjectedCash),
    capitalInjectedTotal: Math.round(capitalInjectedTotal),
    capitalWithdrawalsBank: Math.round(capitalWithdrawalsBank),
    capitalWithdrawalsCash: Math.round(capitalWithdrawalsCash),
    capitalWithdrawalsTotal: Math.round(capitalWithdrawalsTotal),
    netCapitalInjected: Math.round(netCapitalInjected),
    profitWithdrawalsBank: Math.round(profitWithdrawalsBank),
    profitWithdrawalsCash: Math.round(profitWithdrawalsCash),
    profitWithdrawalsTotal: Math.round(profitWithdrawalsTotal),
    outflowsBank: Math.round(outflowsBank),
    outflowsCash: Math.round(outflowsCash),
    outflowsTotal: Math.round(outflowsTotal),
    dealInflowsBank: Math.round(dealInflowsBank),
    dealInflowsCash: Math.round(dealInflowsCash),
    dealInflowsTotal: Math.round(dealInflowsTotal),
    loansBorrowedBank: Math.round(loansBorrowedBank),
    loansBorrowedCash: Math.round(loansBorrowedCash),
    loansBorrowedTotal: Math.round(loansBorrowedTotal),
    loansRepaidBank: Math.round(loansRepaidBank),
    loansRepaidCash: Math.round(loansRepaidCash),
    loansRepaidTotal: Math.round(loansRepaidTotal),
    loansInterestPaidBank: Math.round(loansInterestPaidBank),
    loansInterestPaidCash: Math.round(loansInterestPaidCash),
    loansInterestPaidTotal: Math.round(loansInterestPaidTotal),
    loansProfitSharePaidBank: Math.round(loansProfitSharePaidBank),
    loansProfitSharePaidCash: Math.round(loansProfitSharePaidCash),
    loansProfitSharePaidTotal: Math.round(loansProfitSharePaidTotal),
    totalFinanceCosts: Math.round(totalFinanceCosts),
    outstandingLoansPrincipal: Math.round(outstandingLoansPrincipal),
    totalLiabilitiesAndObligations: Math.round(totalLiabilitiesAndObligations),
    transfersBankToCash: Math.round(transfersBankToCash),
    transfersCashToBank: Math.round(transfersCashToBank),
    netBankLiquidity: Math.round(netBankLiquidity),
    netCashLiquidity: Math.round(netCashLiquidity),
    currentNetLiquidity: Math.round(currentNetLiquidity),
    totalAgreedBuyPrice: Math.round(totalAgreedBuyPrice),
    totalPropertyExpenses: Math.round(totalPropertyExpenses),
    totalProjectOutlay: Math.round(totalProjectOutlay),
    totalTargetSalePrice: Math.round(totalTargetSalePrice),
    totalAgreedSalePrice: Math.round(totalAgreedSalePrice),
    totalPendingPayable: Math.round(totalPendingPayable),
    totalPendingReceivable: Math.round(totalPendingReceivable),
    totalRealizedProfit: Math.round(totalRealizedProfit),
    totalProjectedProfit: Math.round(totalProjectedProfit),
    totalPendingProfit: Math.round(totalPendingProfit),
    propertyMetrics,
    loanMetrics,
  };
}

/**
 * Calculate Personal Real Estate Investment Metrics
 */
export function calculatePersonalMetrics(
  properties: SeedProperty[],
  transactions: SeedTransaction[]
): PersonalDashboardMetrics {
  const persProps = properties.filter((p) => p.type === "personal");
  const persTx = transactions.filter((t) => t.scope === "personal");

  const inTx = persTx.filter(
    (t) =>
      t.transactionType === "capital_inflow" ||
      t.transactionType === "deal_inflow"
  );
  const inflowsBank = inTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const inflowsCash = inTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const inflowsTotal = inflowsBank + inflowsCash;

  const outTx = persTx.filter((t) => t.transactionType === "outflow");
  const outflowsBank = outTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const outflowsCash = outTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const outflowsTotal = outflowsBank + outflowsCash;

  const wthTx = persTx.filter(
    (t) =>
      t.transactionType === "profit_withdrawal" ||
      t.transactionType === "capital_withdrawal"
  );
  const withdrawalsBank = wthTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const withdrawalsCash = wthTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const withdrawalsTotal = withdrawalsBank + withdrawalsCash;

  const trfTx = persTx.filter((t) => t.transactionType === "transfer");
  const cashToBank = trfTx
    .filter(
      (t) =>
        t.transferType === "Cash to Bank" ||
        t.transferType === "Cash Deposit to Bank"
    )
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const bankToCash = trfTx
    .filter(
      (t) =>
        t.transferType === "Bank to Cash" ||
        t.transferType === "Bank Withdrawal to Cash"
    )
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Exact formulas with personal withdrawals:
  // Current Cash = Total Cash Inflow - Total Cash Outflow - Total Cash Withdrawn - Cash to Bank + Bank to Cash
  const currentCashBalance =
    inflowsCash - outflowsCash - withdrawalsCash - cashToBank + bankToCash;

  // Current Bank = Total Bank Inflow - Total Bank Outflow - Total Bank Withdrawn + Cash to Bank - Bank to Cash
  const currentBankBalance =
    inflowsBank - outflowsBank - withdrawalsBank + cashToBank - bankToCash;

  const netPersonalLiquidity = currentBankBalance + currentCashBalance;
  const totalInvestmentDone = outflowsTotal;

  // Category-wise Breakdown
  const catMap = new Map<string, number>();
  outTx.forEach((t) => {
    const cur = catMap.get(t.category) || 0;
    catMap.set(t.category, cur + t.amount);
  });

  const categoryBreakdown = Array.from(catMap.entries()).map(
    ([category, amount]) => ({
      category,
      amount,
      percentage:
        totalInvestmentDone > 0
          ? Math.round((amount / totalInvestmentDone) * 100)
          : 0,
    })
  );

  const personalProperties = persProps.map((p) => {
    const pTx = persTx.filter(
      (t) =>
        t.propertyCode === p.propertyCode ||
        t.propertyCode === p.name ||
        (t.remarks && t.remarks.includes(p.name))
    );
    const totalInvested = pTx
      .filter((t) => t.transactionType === "outflow")
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingCommitment = Math.max(
      0,
      p.agreedPurchasePrice - totalInvested
    );

    return {
      property: p,
      totalInvested,
      pendingCommitment,
      transactions: pTx.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  });

  return {
    inflowsBank: Math.round(inflowsBank),
    inflowsCash: Math.round(inflowsCash),
    inflowsTotal: Math.round(inflowsTotal),
    outflowsBank: Math.round(outflowsBank),
    outflowsCash: Math.round(outflowsCash),
    outflowsTotal: Math.round(outflowsTotal),
    withdrawalsBank: Math.round(withdrawalsBank),
    withdrawalsCash: Math.round(withdrawalsCash),
    withdrawalsTotal: Math.round(withdrawalsTotal),
    cashToBank: Math.round(cashToBank),
    bankToCash: Math.round(bankToCash),
    currentBankBalance: Math.round(currentBankBalance),
    currentCashBalance: Math.round(currentCashBalance),
    netPersonalLiquidity: Math.round(netPersonalLiquidity),
    totalInvestmentDone: Math.round(totalInvestmentDone),
    categoryBreakdown,
    properties: personalProperties,
  };
}
