import { describe, it, expect } from "vitest";
import {
  calculateCommercialMetrics,
  calculatePersonalMetrics,
} from "../src/lib/formulaEngine";
import {
  INITIAL_PROPERTIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CATEGORIES,
  SeedProperty,
  SeedTransaction,
} from "../src/lib/seedData";
import { generateCSV, generateExcelWorkbook, generateExecutivePDF } from "../src/lib/exportEngine";
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from "../src/lib/auth";

describe("Financial Formula Engine & Export Tests", () => {
  it("computes commercial mode spreadsheet formulas accurately", () => {
    const commMetrics = calculateCommercialMetrics(
      INITIAL_PROPERTIES,
      INITIAL_TRANSACTIONS,
      INITIAL_CATEGORIES
    );

    expect(commMetrics.netBankLiquidity).toBe(2924297);
    expect(commMetrics.netCashLiquidity).toBe(1993500);
    expect(commMetrics.currentNetLiquidity).toBe(4917797);
    expect(commMetrics.totalAgreedBuyPrice).toBe(53018800);
    expect(commMetrics.outflowsTotal).toBe(12572203);
    expect(commMetrics.totalPendingPayable).toBe(41127598);
    expect(commMetrics.totalPendingReceivable).toBe(12150000);
  });

  it("computes personal mode spreadsheet formulas accurately", () => {
    const persMetrics = calculatePersonalMetrics(
      INITIAL_PROPERTIES,
      INITIAL_TRANSACTIONS
    );

    expect(persMetrics.totalInvestmentDone).toBe(200000);
    expect(persMetrics.currentBankBalance).toBe(142000);
    expect(persMetrics.currentCashBalance).toBe(0);
  });

  it("generates Excel, PDF, and CSV exports with bounded formulas", async () => {
    const excelBuf = await generateExcelWorkbook(
      INITIAL_PROPERTIES,
      INITIAL_TRANSACTIONS,
      INITIAL_CATEGORIES
    );
    expect(excelBuf.length).toBeGreaterThan(0);

    const pdfBuf = generateExecutivePDF(
      INITIAL_PROPERTIES,
      INITIAL_TRANSACTIONS
    );
    expect(pdfBuf.length).toBeGreaterThan(0);

    const csvStr = generateCSV(INITIAL_TRANSACTIONS);
    expect(csvStr.includes("OUT-001")).toBe(true);
  });

  it("correctly reconciles profit and capital withdrawals against liquidity and equity", () => {
    const commMetrics = calculateCommercialMetrics(
      INITIAL_PROPERTIES,
      INITIAL_TRANSACTIONS,
      INITIAL_CATEGORIES
    );

    const sampleWithdrawals = [
      ...INITIAL_TRANSACTIONS,
      {
        id: "tx-draw-1",
        scope: "commercial" as const,
        transactionType: "profit_withdrawal" as const,
        transCode: "WTH-001",
        date: "2026-08-25",
        category: "Partner Profit Drawing",
        mode: "Bank" as const,
        amount: 500000,
        recipientOrSource: "Partner Personal Account",
        remarks: "Real estate profit drawn to fund textiles venture",
      },
      {
        id: "tx-draw-2",
        scope: "commercial" as const,
        transactionType: "capital_withdrawal" as const,
        transCode: "WTH-002",
        date: "2026-08-26",
        category: "Partner Capital Refund",
        mode: "Cash" as const,
        amount: 200000,
        recipientOrSource: "Sakthi Vinay",
        remarks: "Capital refund / investment reduction",
      },
    ];

    const wthMetrics = calculateCommercialMetrics(
      INITIAL_PROPERTIES,
      sampleWithdrawals,
      INITIAL_CATEGORIES
    );

    expect(wthMetrics.profitWithdrawalsTotal).toBe(500000);
    expect(wthMetrics.capitalWithdrawalsTotal).toBe(200000);
    expect(wthMetrics.netCapitalInjected).toBe(wthMetrics.capitalInjectedTotal - 200000);
    expect(wthMetrics.netBankLiquidity).toBe(2924297 - 500000);
    expect(wthMetrics.netCashLiquidity).toBe(1993500 - 200000);
    expect(wthMetrics.totalProjectOutlay).toBe(commMetrics.totalProjectOutlay);
  });

  it("correctly reconciles loans, principal repayments, interest, and profit sharing", () => {
    const sampleLoans = [
      {
        id: "loan-1",
        scope: "commercial" as const,
        loanCode: "LOAN-001",
        lenderName: "HDFC Business Term Loan",
        lenderType: "bank" as const,
        principalAmount: 3000000,
        interestRatePct: 11,
        startDate: "2026-08-01",
        status: "active" as const,
      },
      {
        id: "loan-2",
        scope: "commercial" as const,
        loanCode: "LOAN-002",
        lenderName: "Farooq Bhai (Friend Venture)",
        lenderType: "family_friend" as const,
        principalAmount: 2000000,
        profitSharePct: 15,
        profitShareTerms: "15% of net profit on LND-002",
        startDate: "2026-08-05",
        status: "active" as const,
      },
    ];

    const sampleLoanTxs = [
      ...INITIAL_TRANSACTIONS,
      // 1. Borrowing Inflows
      {
        id: "tx-loan-1",
        scope: "commercial" as const,
        transactionType: "loan_inflow" as const,
        transCode: "LOAN-INF-01",
        loanId: "loan-1",
        loanCode: "LOAN-001",
        date: "2026-08-01",
        category: "Bank Loan Borrowing",
        mode: "Bank" as const,
        amount: 3000000,
        recipientOrSource: "HDFC Bank Disbursal",
        remarks: "Disbursal of ₹30L working capital term loan",
      },
      {
        id: "tx-loan-2",
        scope: "commercial" as const,
        transactionType: "loan_inflow" as const,
        transCode: "LOAN-INF-02",
        loanId: "loan-2",
        loanCode: "LOAN-002",
        date: "2026-08-05",
        category: "Family / Friend Loan Borrowing",
        mode: "Cash" as const,
        amount: 2000000,
        recipientOrSource: "Farooq Bhai",
        remarks: "Cash advance for project development",
      },
      // 2. Principal Repayment
      {
        id: "tx-loan-3",
        scope: "commercial" as const,
        transactionType: "loan_repayment" as const,
        transCode: "LOAN-REP-01",
        loanId: "loan-1",
        loanCode: "LOAN-001",
        date: "2026-08-20",
        category: "Bank Loan EMI / Principal Repaid",
        mode: "Bank" as const,
        amount: 500000,
        recipientOrSource: "HDFC Bank",
        remarks: "Principal part-payment",
      },
      // 3. Interest Payment
      {
        id: "tx-loan-4",
        scope: "commercial" as const,
        transactionType: "loan_interest" as const,
        transCode: "LOAN-INT-01",
        loanId: "loan-1",
        loanCode: "LOAN-001",
        date: "2026-08-20",
        category: "Loan Interest Payment",
        mode: "Bank" as const,
        amount: 55000,
        recipientOrSource: "HDFC Bank",
        remarks: "Monthly interest on ₹30L",
      },
      // 4. Profit Share Distribution
      {
        id: "tx-loan-5",
        scope: "commercial" as const,
        transactionType: "loan_profit_share" as const,
        transCode: "LOAN-PRF-01",
        loanId: "loan-2",
        loanCode: "LOAN-002",
        date: "2026-08-25",
        category: "Lender / Partner Profit Share Paid",
        mode: "Cash" as const,
        amount: 150000,
        recipientOrSource: "Farooq Bhai",
        remarks: "Interim 15% profit bonus distribution",
      },
    ];

    const baseMetrics = calculateCommercialMetrics(
      INITIAL_PROPERTIES,
      INITIAL_TRANSACTIONS,
      INITIAL_CATEGORIES
    );

    const loanMetrics = calculateCommercialMetrics(
      INITIAL_PROPERTIES,
      sampleLoanTxs,
      INITIAL_CATEGORIES,
      sampleLoans
    );

    // Assert Borrowings & Repayments
    expect(loanMetrics.loansBorrowedBank).toBe(3000000);
    expect(loanMetrics.loansBorrowedCash).toBe(2000000);
    expect(loanMetrics.loansBorrowedTotal).toBe(5000000);

    expect(loanMetrics.loansRepaidBank).toBe(500000);
    expect(loanMetrics.loansRepaidCash).toBe(0);
    expect(loanMetrics.loansRepaidTotal).toBe(500000);

    // Outstanding debt = 50L borrowed - 5L repaid = 45L
    expect(loanMetrics.outstandingLoansPrincipal).toBe(4500000);

    // Finance Costs = 55k interest + 150k profit share = 205k
    expect(loanMetrics.loansInterestPaidTotal).toBe(55000);
    expect(loanMetrics.loansProfitSharePaidTotal).toBe(150000);
    expect(loanMetrics.totalFinanceCosts).toBe(205000);

    // Total Business Obligations = Pending to Sellers + Outstanding Loans
    expect(loanMetrics.totalLiabilitiesAndObligations).toBe(
      loanMetrics.totalPendingPayable + 4500000
    );

    // Owner Equity (Net Capital Injected) is NOT inflated or diluted by debt
    expect(loanMetrics.netCapitalInjected).toBe(baseMetrics.netCapitalInjected);

    // Liquidity Reconciliation:
    // Net Bank = base (29,24,297) + 30L (borrowed) - 5L (repaid) - 55k (interest) = 53,69,297
    expect(loanMetrics.netBankLiquidity).toBe(2924297 + 3000000 - 500000 - 55000);

    // Net Cash = base (19,93,500) + 20L (borrowed) - 0 (repaid) - 1.5L (profit share) = 38,43,500
    expect(loanMetrics.netCashLiquidity).toBe(1993500 + 2000000 - 150000);

    // Per-loan metric breakdown
    const hdfcMetric = loanMetrics.loanMetrics.find((m) => m.loan.loanCode === "LOAN-001");
    expect(hdfcMetric).toBeDefined();
    expect(hdfcMetric?.outstandingPrincipal).toBe(2500000);
    expect(hdfcMetric?.interestPaidTotal).toBe(55000);
    expect(hdfcMetric?.repaymentProgressPct).toBe(17); // 5L / 30L = 16.66% -> 17%

    const farooqMetric = loanMetrics.loanMetrics.find((m) => m.loan.loanCode === "LOAN-002");
    expect(farooqMetric).toBeDefined();
    expect(farooqMetric?.outstandingPrincipal).toBe(2000000);
    expect(farooqMetric?.profitSharePaidTotal).toBe(150000);
  });

  it("ensures in-progress assets do NOT calculate realized profit even with partial token receipts", () => {
    const inProgressProps: typeof INITIAL_PROPERTIES = [
      {
        id: "prop-test-ip-1",
        type: "commercial",
        propertyCode: "LND-TEST-01",
        name: "Emerald Acres",
        acquisitionDate: "2026-01-01",
        agreedPurchasePrice: 10000000, // 1 Cr
        targetSalePrice: 14000000,     // 1.4 Cr
        agreedSellingPrice: 0,
        status: "in_progress",
      },
    ];

    const inProgressTxs: typeof INITIAL_TRANSACTIONS = [
      // Paid 20L purchase principal
      {
        id: "tx-test-out-1",
        scope: "commercial",
        transactionType: "outflow",
        propertyCode: "LND-TEST-01",
        date: "2026-01-05",
        category: "Land Purchase Principal",
        mode: "Bank",
        amount: 2000000,
      },
      // Received 30L token advance from interested party
      {
        id: "tx-test-in-1",
        scope: "commercial",
        transactionType: "deal_inflow",
        propertyCode: "LND-TEST-01",
        date: "2026-01-20",
        category: "Advance Payment / Token Money",
        mode: "Bank",
        amount: 3000000,
      },
    ];

    const metrics = calculateCommercialMetrics(
      inProgressProps,
      inProgressTxs,
      INITIAL_CATEGORIES
    );

    const pm = metrics.propertyMetrics[0];
    // Under the old bug: realizedProfit = 30L - 20L = 10L profit!
    // Under the intended behavior: status is "in_progress", so realizedProfit MUST be 0!
    expect(pm.realizedProfit).toBe(0);
    expect(metrics.totalRealizedProfit).toBe(0);

    // Projected profit should still be 1.4 Cr - 1.0 Cr = 40 Lakhs
    expect(pm.projectedProfit).toBe(4000000);
    expect(metrics.totalProjectedProfit).toBe(4000000);
  });

  it("calculates realized profit only upon sale completion using cost-recovery basis and tracks pending profit", () => {
    const soldProps: typeof INITIAL_PROPERTIES = [
      {
        id: "prop-test-sold-1",
        type: "commercial",
        propertyCode: "LND-TEST-02",
        name: "Sapphire Enclave",
        acquisitionDate: "2026-02-01",
        agreedPurchasePrice: 5000000, // 50L buy
        targetSalePrice: 7500000,
        agreedSellingPrice: 7500000,  // 75L agreed sell (25L total profit potential)
        status: "sold",
      },
    ];

    // Case A: Buyer paid 40L (less than 50L total project outlay) -> Realized profit = 0
    const partialTxs: typeof INITIAL_TRANSACTIONS = [
      {
        id: "tx-test-out-2",
        scope: "commercial",
        transactionType: "outflow",
        propertyCode: "LND-TEST-02",
        date: "2026-02-05",
        category: "Land Purchase Principal",
        mode: "Bank",
        amount: 5000000,
      },
      {
        id: "tx-test-in-2",
        scope: "commercial",
        transactionType: "deal_inflow",
        propertyCode: "LND-TEST-02",
        date: "2026-02-15",
        category: "Sale Agreement Advance",
        mode: "Bank",
        amount: 4000000,
      },
    ];

    const metricsCaseA = calculateCommercialMetrics(
      soldProps,
      partialTxs,
      INITIAL_CATEGORIES
    );
    const pmCaseA = metricsCaseA.propertyMetrics[0];
    expect(pmCaseA.realizedProfit).toBe(0); // Cost not yet recovered
    expect(pmCaseA.pendingProfit).toBe(2500000); // Entire 25L profit is still pending to be received

    // Case B: Buyer paid 65L (exceeds 50L outlay by 15L) -> Realized profit = 15L, Pending profit = 10L
    const surplusTxs: typeof INITIAL_TRANSACTIONS = [
      ...partialTxs,
      {
        id: "tx-test-in-3",
        scope: "commercial",
        transactionType: "deal_inflow",
        propertyCode: "LND-TEST-02",
        date: "2026-02-25",
        category: "Part Sale Consideration",
        mode: "Bank",
        amount: 2500000, // 40L + 25L = 65L collected
      },
    ];

    const metricsCaseB = calculateCommercialMetrics(
      soldProps,
      surplusTxs,
      INITIAL_CATEGORIES
    );
    const pmCaseB = metricsCaseB.propertyMetrics[0];
    expect(pmCaseB.realizedProfit).toBe(1500000); // 65L - 50L = 15L profit in hand
    expect(pmCaseB.pendingProfit).toBe(1000000);  // 25L total profit - 15L realized = 10L pending
    expect(metricsCaseB.totalRealizedProfit).toBe(1500000);

    // Because this deal is sold, it should NOT be in active pipeline projected profit
    expect(metricsCaseB.totalProjectedProfit).toBe(0);
  });

  it("verifies bcryptjs password hashing and verification compatibility", async () => {
    const rawPassword = "TestSecurePassword2026!";
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(rawPassword);

    const isValid = await verifyPassword(rawPassword, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("WrongPassword!", hashed);
    expect(isInvalid).toBe(false);
  });

  it("verifies jose JWT session token generation and tamper verification", async () => {
    const testPayload = {
      userId: "user_test_999",
      email: "samad@avaniya.com",
      name: "Samad",
      role: "super_admin" as const,
      datasetId: "ds_yousuf_portfolio",
    };

    const token = await signSessionToken(testPayload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifySessionToken(token);
    expect(verified).toBeDefined();
    expect(verified?.userId).toBe(testPayload.userId);
    expect(verified?.email).toBe(testPayload.email);
    expect(verified?.role).toBe("super_admin");
    expect(verified?.datasetId).toBe("ds_yousuf_portfolio");

    const tamperedToken = token.slice(0, -10) + "XXXXXXXXXX";
    const tamperedVerified = await verifySessionToken(tamperedToken);
    expect(tamperedVerified).toBeNull();
  });

  it("correctly computes agreement deadlines, sub-plot stats, and JV partner allocations", () => {
    const testProps = [
      {
        id: "prop-deadlines-test",
        type: "commercial" as const,
        propertyCode: "LND-DEADLINE-01",
        name: "Hosur Highway Layout",
        acquisitionDate: "2026-01-10",
        agreedPurchasePrice: 10000000,
        targetSalePrice: 15000000,
        status: "open" as const,
        // Set agreement due date in 10 days (urgent)
        agreementDueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        subPlots: [
          { id: "sp-1", plotNumber: "Plot 1", sqftArea: 1200, targetPrice: 1800000, status: "available" as const },
          { id: "sp-2", plotNumber: "Plot 2", sqftArea: 1500, targetPrice: 2200000, status: "booked" as const, buyerName: "Ramesh" },
          { id: "sp-3", plotNumber: "Plot 3", sqftArea: 2000, targetPrice: 3000000, status: "sold" as const, buyerName: "Suresh" },
        ],
        partners: [
          { name: "Mohammed Yousuf", equityPct: 60 },
          { name: "Farooq Partner", equityPct: 40 },
        ],
      },
    ];

    const testTxs = [
      {
        id: "tx-out-fencing",
        scope: "commercial" as const,
        transactionType: "outflow" as const,
        propertyCode: "LND-DEADLINE-01",
        date: "2026-01-15",
        category: "Boundary Fencing & Development",
        mode: "Bank" as const,
        amount: 1000000, // 10L expense -> Outlay = 1.10 Cr
      },
    ];

    const metrics = calculateCommercialMetrics(testProps, testTxs, INITIAL_CATEGORIES);
    const pm = metrics.propertyMetrics[0];

    // 1. Deadline verification
    expect(pm.deadlineStatus).toBe("urgent");
    expect(pm.daysToDeadline).toBeGreaterThanOrEqual(9);
    expect(pm.daysToDeadline).toBeLessThanOrEqual(11);
    expect(metrics.upcomingDeadlinesCount).toBe(1);
    expect(metrics.deadlineAlerts.length).toBe(1);
    expect(metrics.deadlineAlerts[0].status).toBe("urgent");

    // 2. Sub-Plot stats verification
    expect(pm.subPlotStats).toBeDefined();
    expect(pm.subPlotStats?.totalPlots).toBe(3);
    expect(pm.subPlotStats?.available).toBe(1);
    expect(pm.subPlotStats?.booked).toBe(1);
    expect(pm.subPlotStats?.sold).toBe(1);
    expect(pm.subPlotStats?.totalAreaSqft).toBe(4700);
    expect(pm.subPlotStats?.targetRevenue).toBe(7000000);

    // 3. JV Partner Allocations (Outlay = 1.10 Cr, Projected Profit = 1.50 Cr - 1.10 Cr = 40 Lakhs)
    expect(pm.partnerAllocations).toBeDefined();
    expect(pm.partnerAllocations?.length).toBe(2);
    // Partner 1 (60%): 60% of 1.10 Cr = 66 Lakhs cost share, 60% of 40L = 24 Lakhs projected profit
    expect(pm.partnerAllocations?.[0].costShare).toBe(6600000);
    expect(pm.partnerAllocations?.[0].projectedProfitShare).toBe(2400000);
    // Partner 2 (40%): 40% of 1.10 Cr = 44 Lakhs cost share, 40% of 40L = 16 Lakhs projected profit
    expect(pm.partnerAllocations?.[1].costShare).toBe(4400000);
    expect(pm.partnerAllocations?.[1].projectedProfitShare).toBe(1600000);
  });

  it("should safely handle properties without deadline or with invalid dates", () => {
    const propsWithoutDeadlines: SeedProperty[] = [
      {
        id: "prop-no-deadline",
        type: "commercial",
        propertyCode: "LND-NO-DEADLINE",
        name: "Plot Without Due Date",
        acquisitionDate: "2026-01-01",
        agreedPurchasePrice: 5000000,
        status: "open",
      },
      {
        id: "prop-invalid-deadline",
        type: "commercial",
        propertyCode: "LND-INVALID-DEADLINE",
        name: "Plot With Corrupted Date",
        acquisitionDate: "2026-01-01",
        agreedPurchasePrice: 5000000,
        agreementDueDate: "invalid-date-string",
        status: "open",
      },
    ];

    const metrics = calculateCommercialMetrics(
      propsWithoutDeadlines,
      [],
      INITIAL_CATEGORIES
    );

    expect(metrics.propertyMetrics[0].deadlineStatus).toBe("none");
    expect(metrics.propertyMetrics[0].daysToDeadline).toBeUndefined();

    expect(metrics.propertyMetrics[1].deadlineStatus).toBe("none");
    expect(metrics.propertyMetrics[1].daysToDeadline).toBeUndefined();

    expect(metrics.deadlineAlerts.length).toBe(0);
    expect(metrics.upcomingDeadlinesCount).toBe(0);
    expect(metrics.overdueDeadlinesCount).toBe(0);
  });

  it("correctly deducts expenses borne by seller from pending seller consideration", () => {
    const testProp: SeedProperty = {
      id: "prop-seller-test",
      type: "commercial",
      propertyCode: "LND-SELLER-1",
      name: "Seller Deduction Land",
      acquisitionDate: "2026-01-01",
      agreedPurchasePrice: 5000000,
      agreedSellingPrice: 7000000,
      status: "in_progress",
    };

    const testTxs: SeedTransaction[] = [
      {
        id: "tx-buy-1",
        scope: "commercial",
        transactionType: "outflow",
        propertyCode: "LND-SELLER-1",
        date: "2026-01-05",
        category: "Token Advance / Purchase",
        mode: "Bank",
        amount: 1000000,
      },
      {
        id: "tx-seller-exp-1",
        scope: "commercial",
        transactionType: "outflow",
        propertyCode: "LND-SELLER-1",
        date: "2026-01-10",
        category: "Legal & Court Clearance",
        mode: "Bank",
        amount: 150000,
        borneBy: "seller",
        amountSeller: 150000,
        amountSelf: 0,
        amountBuyer: 0,
      },
    ];

    const metrics = calculateCommercialMetrics(
      [testProp],
      testTxs,
      INITIAL_CATEGORIES
    );

    const pm = metrics.propertyMetrics[0];
    expect(pm.purchasePaidTotal).toBe(1000000);
    expect(pm.propertyExpenses).toBe(0);
    expect(pm.sellerPaidExpenses).toBe(150000);
    expect(pm.pendingOutflow).toBe(3850000);
    expect(pm.totalProjectOutlay).toBe(5000000);
  });

  it("correctly adds expenses borne by buyer to pending buyer receivables", () => {
    const testProp: SeedProperty = {
      id: "prop-buyer-test",
      type: "commercial",
      propertyCode: "LND-BUYER-1",
      name: "Buyer Receivable Land",
      acquisitionDate: "2026-01-01",
      agreedPurchasePrice: 2000000,
      agreedSellingPrice: 3000000,
      status: "in_progress",
    };

    const testTxs: SeedTransaction[] = [
      {
        id: "tx-rec-1",
        scope: "commercial",
        transactionType: "deal_inflow",
        propertyCode: "LND-BUYER-1",
        date: "2026-01-05",
        category: "Sale Advance",
        mode: "Bank",
        amount: 500000,
      },
      {
        id: "tx-buyer-exp-1",
        scope: "commercial",
        transactionType: "outflow",
        propertyCode: "LND-BUYER-1",
        date: "2026-01-10",
        category: "Stamp Duty & Registration",
        mode: "Bank",
        amount: 250000,
        borneBy: "buyer",
        amountBuyer: 250000,
        amountSelf: 0,
        amountSeller: 0,
      },
    ];

    const metrics = calculateCommercialMetrics(
      [testProp],
      testTxs,
      INITIAL_CATEGORIES
    );

    const pm = metrics.propertyMetrics[0];
    expect(pm.propertyExpenses).toBe(0);
    expect(pm.buyerPaidExpenses).toBe(250000);
    expect(pm.adjustedBuyerObligation).toBe(3250000);
    expect(pm.totalReceiptsCollected).toBe(500000);
    expect(pm.pendingInflow).toBe(2750000);
  });

  it("accurately handles 3-way split expenses across self, seller, and buyer", () => {
    const testProp: SeedProperty = {
      id: "prop-split-test",
      type: "commercial",
      propertyCode: "LND-SPLIT-1",
      name: "Split Expense Land",
      acquisitionDate: "2026-01-01",
      agreedPurchasePrice: 4000000,
      agreedSellingPrice: 6000000,
      status: "in_progress",
    };

    const testTxs: SeedTransaction[] = [
      {
        id: "tx-split-1",
        scope: "commercial",
        transactionType: "outflow",
        propertyCode: "LND-SPLIT-1",
        date: "2026-01-12",
        category: "Joint Survey & Verification",
        mode: "Bank",
        amount: 60000,
        borneBy: "split",
        amountSelf: 20000,
        amountSeller: 20000,
        amountBuyer: 20000,
      },
    ];

    const metrics = calculateCommercialMetrics(
      [testProp],
      testTxs,
      INITIAL_CATEGORIES
    );

    const pm = metrics.propertyMetrics[0];
    expect(pm.propertyExpenses).toBe(20000);
    expect(pm.sellerPaidExpenses).toBe(20000);
    expect(pm.buyerPaidExpenses).toBe(20000);
    expect(pm.pendingOutflow).toBe(3980000);
    expect(pm.adjustedBuyerObligation).toBe(6020000);
    expect(pm.pendingInflow).toBe(6020000);
    expect(pm.totalProjectOutlay).toBe(4020000);
  });
});

