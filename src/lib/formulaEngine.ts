import {
  SeedProperty,
  SeedTransaction,
  SeedCategory,
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
  transactions: SeedTransaction[];
}

export interface CommercialDashboardMetrics {
  capitalInjectedBank: number;
  capitalInjectedCash: number;
  capitalInjectedTotal: number;
  outflowsBank: number;
  outflowsCash: number;
  outflowsTotal: number;
  dealInflowsBank: number;
  dealInflowsCash: number;
  dealInflowsTotal: number;
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
  propertyMetrics: PropertyFinancialMetrics[];
}

export interface PersonalDashboardMetrics {
  inflowsBank: number;
  inflowsCash: number;
  inflowsTotal: number;
  outflowsBank: number;
  outflowsCash: number;
  outflowsTotal: number;
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
  categories: SeedCategory[] = []
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
    return catName.toLowerCase().startsWith("purchase");
  };

  // Capital Inflows
  const capTx = commTx.filter((t) => t.transactionType === "capital_inflow");
  const capitalInjectedBank = capTx
    .filter((t) => t.mode === "Bank")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const capitalInjectedCash = capTx
    .filter((t) => t.mode === "Cash")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const capitalInjectedTotal = capitalInjectedBank + capitalInjectedCash;

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

  // Exact formulas from Land_Business_Tracker.xlsx Dashboard:
  // Net Bank = C10 - C11 + C12 - C13 + C14
  const netBankLiquidity =
    capitalInjectedBank -
    outflowsBank +
    dealInflowsBank -
    transfersBankToCash +
    transfersCashToBank;

  // Net Cash = D10 - D11 + D12 + D13 - D14
  const netCashLiquidity =
    capitalInjectedCash -
    outflowsCash +
    dealInflowsCash +
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

    const realizedProfit =
      totalReceiptsCollected > 0
        ? totalReceiptsCollected - totalOutflowsPaid
        : 0;

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

  return {
    capitalInjectedBank,
    capitalInjectedCash,
    capitalInjectedTotal,
    outflowsBank,
    outflowsCash,
    outflowsTotal,
    dealInflowsBank,
    dealInflowsCash,
    dealInflowsTotal,
    transfersBankToCash,
    transfersCashToBank,
    netBankLiquidity,
    netCashLiquidity,
    currentNetLiquidity,
    totalAgreedBuyPrice,
    totalPropertyExpenses,
    totalProjectOutlay,
    totalTargetSalePrice,
    totalAgreedSalePrice,
    totalPendingPayable,
    totalPendingReceivable,
    totalRealizedProfit,
    propertyMetrics,
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

  // Exact formulas from New Apartment Expense Tracker.xlsx Calc_Data:
  // Current Cash = Total Cash Inflow - Total Cash Outflow - Cash to Bank + Bank to Cash
  const currentCashBalance =
    inflowsCash - outflowsCash - cashToBank + bankToCash;

  // Current Bank = Total Bank Inflow - Total Bank Outflow + Cash to Bank - Bank to Cash
  const currentBankBalance =
    inflowsBank - outflowsBank + cashToBank - bankToCash;

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
    inflowsBank,
    inflowsCash,
    inflowsTotal,
    outflowsBank,
    outflowsCash,
    outflowsTotal,
    cashToBank,
    bankToCash,
    currentBankBalance,
    currentCashBalance,
    netPersonalLiquidity,
    totalInvestmentDone,
    categoryBreakdown,
    properties: personalProperties,
  };
}
