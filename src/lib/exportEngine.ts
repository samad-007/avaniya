import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SeedProperty, SeedTransaction, SeedCategory } from "./seedData";
import {
  calculateCommercialMetrics,
  calculatePersonalMetrics,
} from "./formulaEngine";
import { formatINR } from "./formatters";

/**
 * Generate multi-tab Excel (.xlsx) workbook with zero circular references,
 * exact bounded formula ranges, cached evaluation results, and complete portfolio coverage.
 */
export async function generateExcelWorkbook(
  properties: SeedProperty[],
  transactions: SeedTransaction[],
  categories?: SeedCategory[]
): Promise<Buffer> {
  const commMetrics = calculateCommercialMetrics(properties, transactions, categories || []);
  const persMetrics = calculatePersonalMetrics(properties, transactions);

  const commProps = properties.filter((p) => p.type === "commercial");
  const persProps = properties.filter((p) => p.type === "personal");

  const commOutflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "outflow"
  );
  const dealInflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "deal_inflow"
  );
  const capInflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "capital_inflow"
  );
  const transfers = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "transfer"
  );
  const persTransactions = transactions.filter((t) => t.scope === "personal");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Avaniya Portfolio Management Engine";
  workbook.lastModifiedBy = "Samad";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Bounded row counts for exact formula ranges (prevents whole-column cycles)
  const outStart = 4;
  const outEnd = Math.max(outStart, outStart + commOutflows.length - 1);
  const outTotalRow = outEnd + 1;

  const dealInStart = 4;
  const dealInEnd = Math.max(dealInStart, dealInStart + dealInflows.length - 1);
  const dealInTotalRow = dealInEnd + 1;

  const capInStart = 4;
  const capInEnd = Math.max(capInStart, capInStart + capInflows.length - 1);
  const capInTotalRow = capInEnd + 1;

  const trfStart = 4;
  const trfEnd = Math.max(trfStart, trfStart + transfers.length - 1);
  const trfTotalRow = trfEnd + 1;

  const landStart = 4;
  const landEnd = Math.max(landStart, landStart + commProps.length - 1);
  const landTotalRow = landEnd + 1;

  // -------------------------------------------------------------
  // Sheet 1: Dashboard
  // -------------------------------------------------------------
  const wsDash = workbook.addWorksheet("Dashboard", {
    views: [{ showGridLines: true }],
  });

  wsDash.columns = [
    { width: 3 },
    { width: 38 },
    { width: 22 },
    { width: 22 },
    { width: 24 },
  ];

  // Header Title
  wsDash.getCell("B2").value = "AVANIYA — REAL ESTATE & LAND ASSET PORTFOLIO";
  wsDash.getCell("B2").font = { name: "Arial", size: 16, bold: true, color: { argb: "FF0A0A0A" } };

  wsDash.getCell("B3").value = `Executive Liquidity & Deal Statement • Generated on ${new Date().toLocaleDateString("en-IN")}`;
  wsDash.getCell("B3").font = { name: "Arial", size: 9, italic: true, color: { argb: "FF71717A" } };

  // KPI Header Cards
  wsDash.getCell("B5").value = "NET BANK LIQUIDITY";
  wsDash.getCell("C5").value = "NET CASH BALANCE";
  wsDash.getCell("D5").value = "TOTAL LIQUIDITY";
  wsDash.getCell("E5").value = "REALIZED NET PROFIT";

  ["B5", "C5", "D5", "E5"].forEach((coord) => {
    const c = wsDash.getCell(coord);
    c.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF555555" } };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF4F4F5" },
    };
    c.border = {
      top: { style: "thin", color: { argb: "FFE4E4E7" } },
      left: { style: "thin", color: { argb: "FFE4E4E7" } },
      right: { style: "thin", color: { argb: "FFE4E4E7" } },
      bottom: { style: "thin", color: { argb: "FFE4E4E7" } },
    };
  });

  // KPI Value Cells with Bounded Formulas + Precomputed Results
  wsDash.getCell("B6").value = {
    formula: "C12-C13+C14-C15+C16",
    result: commMetrics.netBankLiquidity,
  };
  wsDash.getCell("C6").value = {
    formula: "D12-D13+D14+D15-D16",
    result: commMetrics.netCashLiquidity,
  };
  wsDash.getCell("D6").value = {
    formula: "B6+C6",
    result: commMetrics.currentNetLiquidity,
  };
  wsDash.getCell("E6").value = {
    formula: `Land_Master!Q${landTotalRow}`,
    result: commMetrics.totalRealizedProfit,
  };

  ["B6", "C6", "D6", "E6"].forEach((coord) => {
    const c = wsDash.getCell(coord);
    c.font = { name: "Arial", size: 13, bold: true, color: { argb: "FF0A0A0A" } };
    c.numFmt = "₹ #,##,##0";
    c.border = {
      top: { style: "thin", color: { argb: "FFE4E4E7" } },
      left: { style: "thin", color: { argb: "FFE4E4E7" } },
      right: { style: "thin", color: { argb: "FFE4E4E7" } },
      bottom: { style: "thin", color: { argb: "FFE4E4E7" } },
    };
  });

  // Breakdown Table Header
  wsDash.getCell("B10").value = "Commercial Liquidity Breakdown Matrix";
  wsDash.getCell("B10").font = { name: "Arial", size: 12, bold: true, color: { argb: "FF0A0A0A" } };

  wsDash.getCell("B11").value = "Portfolio Financial Component";
  wsDash.getCell("C11").value = "Bank Account (₹)";
  wsDash.getCell("D11").value = "Cash in Hand (₹)";
  wsDash.getCell("E11").value = "Total Combined (₹)";

  ["B11", "C11", "D11", "E11"].forEach((coord) => {
    const c = wsDash.getCell(coord);
    c.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF18181B" },
    };
  });

  // Bounded Breakdown Rows
  const breakdownRows = [
    {
      row: 12,
      label: "1. Capital Injected (External Funding)",
      bankFormula: `SUMIF(Capital_Inflows!D$${capInStart}:D$${capInEnd}, "Bank", Capital_Inflows!E$${capInStart}:E$${capInEnd})`,
      cashFormula: `SUMIF(Capital_Inflows!D$${capInStart}:D$${capInEnd}, "Cash", Capital_Inflows!E$${capInStart}:E$${capInEnd})`,
      bankVal: commMetrics.capitalInjectedBank,
      cashVal: commMetrics.capitalInjectedCash,
    },
    {
      row: 13,
      label: "2. Less: Total Property Outflows & Expenses",
      bankFormula: `SUMIF(Outflows!E$${outStart}:E$${outEnd}, "Bank", Outflows!F$${outStart}:F$${outEnd})`,
      cashFormula: `SUMIF(Outflows!E$${outStart}:E$${outEnd}, "Cash", Outflows!F$${outStart}:F$${outEnd})`,
      bankVal: commMetrics.outflowsBank,
      cashVal: commMetrics.outflowsCash,
    },
    {
      row: 14,
      label: "3. Add: Total Property Sale Receipts",
      bankFormula: `SUMIF(Deal_Inflows!E$${dealInStart}:E$${dealInEnd}, "Bank", Deal_Inflows!F$${dealInStart}:F$${dealInEnd})`,
      cashFormula: `SUMIF(Deal_Inflows!E$${dealInStart}:E$${dealInEnd}, "Cash", Deal_Inflows!F$${dealInStart}:F$${dealInEnd})`,
      bankVal: commMetrics.dealInflowsBank,
      cashVal: commMetrics.dealInflowsCash,
    },
    {
      row: 15,
      label: "4. Less/Add: Bank Withdrawals to Cash",
      bankFormula: `SUMIF(Transfers!C$${trfStart}:C$${trfEnd}, "Bank Withdrawal to Cash", Transfers!D$${trfStart}:D$${trfEnd})`,
      cashFormula: `SUMIF(Transfers!C$${trfStart}:C$${trfEnd}, "Bank Withdrawal to Cash", Transfers!D$${trfStart}:D$${trfEnd})`,
      bankVal: commMetrics.transfersBankToCash,
      cashVal: commMetrics.transfersBankToCash,
    },
    {
      row: 16,
      label: "5. Add/Less: Cash Deposits to Bank",
      bankFormula: `SUMIF(Transfers!C$${trfStart}:C$${trfEnd}, "Cash Deposit to Bank", Transfers!D$${trfStart}:D$${trfEnd})`,
      cashFormula: `SUMIF(Transfers!C$${trfStart}:C$${trfEnd}, "Cash Deposit to Bank", Transfers!D$${trfStart}:D$${trfEnd})`,
      bankVal: commMetrics.transfersCashToBank,
      cashVal: commMetrics.transfersCashToBank,
    },
  ];

  breakdownRows.forEach(({ row, label, bankFormula, cashFormula, bankVal, cashVal }) => {
    wsDash.getCell(`B${row}`).value = label;
    wsDash.getCell(`C${row}`).value = { formula: bankFormula, result: bankVal };
    wsDash.getCell(`D${row}`).value = { formula: cashFormula, result: cashVal };
    wsDash.getCell(`E${row}`).value = {
      formula: `C${row}+D${row}`,
      result: bankVal + cashVal,
    };

    wsDash.getCell(`C${row}`).numFmt = "₹ #,##,##0";
    wsDash.getCell(`D${row}`).numFmt = "₹ #,##,##0";
    wsDash.getCell(`E${row}`).numFmt = "₹ #,##,##0";
  });

  // Current Net Liquidity Summary Row
  wsDash.getCell("B17").value = "CURRENT NET LIQUIDITY AVAILABLE";
  wsDash.getCell("B17").font = { bold: true, color: { argb: "FF166534" } };
  wsDash.getCell("C17").value = { formula: "C12-C13+C14-C15+C16", result: commMetrics.netBankLiquidity };
  wsDash.getCell("D17").value = { formula: "D12-D13+D14+D15-D16", result: commMetrics.netCashLiquidity };
  wsDash.getCell("E17").value = { formula: "C17+D17", result: commMetrics.currentNetLiquidity };

  ["B17", "C17", "D17", "E17"].forEach((coord) => {
    const c = wsDash.getCell(coord);
    c.font = { bold: true };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDCFCE7" },
    };
    c.numFmt = "₹ #,##,##0";
  });

  // -------------------------------------------------------------
  // Sheet 2: Land_Master
  // -------------------------------------------------------------
  const wsLand = workbook.addWorksheet("Land_Master", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 3, showGridLines: true }],
  });

  wsLand.columns = [
    { header: "Land ID", key: "code", width: 14 },
    { header: "Property / Location", key: "name", width: 28 },
    { header: "Acquisition Date", key: "date", width: 16 },
    { header: "Agreed Purchase Price", key: "buy", width: 22 },
    { header: "Target Sale Price", key: "target", width: 20 },
    { header: "Agreed Selling Price", key: "sale", width: 20 },
    { header: "Status", key: "status", width: 16 },
    { header: "Purchase Paid (Cash)", key: "paid_cash", width: 22 },
    { header: "Purchase Paid (Bank)", key: "paid_bank", width: 22 },
    { header: "Property Expenses", key: "expenses", width: 20 },
    { header: "Total Outflows Paid", key: "total_out", width: 22 },
    { header: "Receipts (Cash)", key: "rec_cash", width: 20 },
    { header: "Receipts (Bank)", key: "rec_bank", width: 20 },
    { header: "Total Receipts Collected", key: "total_rec", width: 24 },
    { header: "Pending to Seller", key: "pending_out", width: 22 },
    { header: "Pending from Buyer", key: "pending_in", width: 22 },
    { header: "Realized Profit / Loss", key: "pnl", width: 22 },
  ];

  wsLand.spliceRows(1, 0, ["Commercial Land Inventory & Deal Master Ledger"]);
  wsLand.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsLand.spliceRows(2, 0, []);

  const headerRow = wsLand.getRow(3);
  headerRow.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  commProps.forEach((p, index) => {
    const rowNum = 4 + index;
    const pm = commMetrics.propertyMetrics.find(
      (m) => m.property.propertyCode === p.propertyCode
    );

    wsLand.addRow([
      p.propertyCode,
      p.name,
      p.acquisitionDate || "-",
      p.agreedPurchasePrice,
      p.targetSalePrice || 0,
      p.agreedSellingPrice || 0,
      p.status.toUpperCase(),
      {
        formula: `SUMIFS(Outflows!F$${outStart}:F$${outEnd}, Outflows!C$${outStart}:C$${outEnd}, A${rowNum}, Outflows!E$${outStart}:E$${outEnd}, "Cash", Outflows!D$${outStart}:D$${outEnd}, "Purchase*")`,
        result: pm?.purchasePaidCash || 0,
      },
      {
        formula: `SUMIFS(Outflows!F$${outStart}:F$${outEnd}, Outflows!C$${outStart}:C$${outEnd}, A${rowNum}, Outflows!E$${outStart}:E$${outEnd}, "Bank", Outflows!D$${outStart}:D$${outEnd}, "Purchase*")`,
        result: pm?.purchasePaidBank || 0,
      },
      {
        formula: `SUMIFS(Outflows!F$${outStart}:F$${outEnd}, Outflows!C$${outStart}:C$${outEnd}, A${rowNum}, Outflows!D$${outStart}:D$${outEnd}, "<>Purchase*")`,
        result: pm?.propertyExpenses || 0,
      },
      {
        formula: `H${rowNum}+I${rowNum}+J${rowNum}`,
        result: pm?.totalOutflowsPaid || 0,
      },
      {
        formula: `SUMIFS(Deal_Inflows!F$${dealInStart}:F$${dealInEnd}, Deal_Inflows!C$${dealInStart}:C$${dealInEnd}, A${rowNum}, Deal_Inflows!E$${dealInStart}:E$${dealInEnd}, "Cash")`,
        result: pm?.receiptsReceivedCash || 0,
      },
      {
        formula: `SUMIFS(Deal_Inflows!F$${dealInStart}:F$${dealInEnd}, Deal_Inflows!C$${dealInStart}:C$${dealInEnd}, A${rowNum}, Deal_Inflows!E$${dealInStart}:E$${dealInEnd}, "Bank")`,
        result: pm?.receiptsReceivedBank || 0,
      },
      {
        formula: `L${rowNum}+M${rowNum}`,
        result: pm?.totalReceiptsCollected || 0,
      },
      {
        formula: `IF(D${rowNum}>0, D${rowNum}-(H${rowNum}+I${rowNum}), 0)`,
        result: pm?.pendingOutflow || 0,
      },
      {
        formula: `IF(F${rowNum}>0, F${rowNum}-N${rowNum}, 0)`,
        result: pm?.pendingInflow || 0,
      },
      {
        formula: `IF(N${rowNum}>0, N${rowNum}-K${rowNum}, 0)`,
        result: pm?.realizedProfit || 0,
      },
    ]);

    const r = wsLand.getRow(rowNum);
    ["D", "E", "F", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"].forEach((col) => {
      r.getCell(col).numFmt = "₹ #,##,##0";
    });
  });

  // Total Row in Land Master
  wsLand.addRow([
    "Total Commercial Portfolio",
    "",
    "",
    { formula: `SUM(D$4:D$${landEnd})`, result: commMetrics.totalAgreedBuyPrice },
    { formula: `SUM(E$4:E$${landEnd})`, result: commMetrics.totalTargetSalePrice },
    { formula: `SUM(F$4:F$${landEnd})`, result: commMetrics.totalAgreedSalePrice },
    "",
    { formula: `SUM(H$4:H$${landEnd})`, result: commMetrics.propertyMetrics.reduce((s, pm) => s + pm.purchasePaidCash, 0) },
    { formula: `SUM(I$4:I$${landEnd})`, result: commMetrics.propertyMetrics.reduce((s, pm) => s + pm.purchasePaidBank, 0) },
    { formula: `SUM(J$4:J$${landEnd})`, result: commMetrics.totalPropertyExpenses },
    { formula: `SUM(K$4:K$${landEnd})`, result: commMetrics.outflowsTotal },
    { formula: `SUM(L$4:L$${landEnd})`, result: commMetrics.dealInflowsCash },
    { formula: `SUM(M$4:M$${landEnd})`, result: commMetrics.dealInflowsBank },
    { formula: `SUM(N$4:N$${landEnd})`, result: commMetrics.dealInflowsTotal },
    { formula: `SUM(O$4:O$${landEnd})`, result: commMetrics.totalPendingPayable },
    { formula: `SUM(P$4:P$${landEnd})`, result: commMetrics.totalPendingReceivable },
    { formula: `SUM(Q$4:Q$${landEnd})`, result: commMetrics.totalRealizedProfit },
  ]);

  const tLandRow = wsLand.getRow(landTotalRow);
  tLandRow.font = { bold: true };
  tLandRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF4F4F5" },
  };
  ["D", "E", "F", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"].forEach((col) => {
    tLandRow.getCell(col).numFmt = "₹ #,##,##0";
  });

  // -------------------------------------------------------------
  // Sheet 3: Outflows
  // -------------------------------------------------------------
  const wsOut = workbook.addWorksheet("Outflows", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 3, showGridLines: true }],
  });
  wsOut.columns = [
    { header: "Trans ID", width: 14 },
    { header: "Date", width: 14 },
    { header: "Land ID", width: 14 },
    { header: "Category", width: 26 },
    { header: "Payment Mode", width: 16 },
    { header: "Amount Paid", width: 22 },
    { header: "Paid To / Notes", width: 38 },
  ];
  wsOut.spliceRows(1, 0, ["Commercial Land Outflows & Expenses Log"]);
  wsOut.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsOut.spliceRows(2, 0, []);
  wsOut.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  wsOut.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  commOutflows.forEach((t) => {
    wsOut.addRow([
      t.transCode,
      t.date,
      t.propertyCode,
      t.category,
      t.mode,
      t.amount,
      t.remarks || t.recipientOrSource || "",
    ]);
  });
  wsOut.eachRow((row, rowNum) => {
    if (rowNum >= 4) {
      row.getCell(6).numFmt = "₹ #,##,##0";
    }
  });

  wsOut.addRow([
    "Total Commercial Outflows",
    "",
    "",
    "",
    "",
    { formula: `SUM(F$4:F$${outEnd})`, result: commMetrics.outflowsTotal },
    "",
  ]);
  wsOut.getRow(outTotalRow).font = { bold: true };
  wsOut.getRow(outTotalRow).getCell(6).numFmt = "₹ #,##,##0";

  // -------------------------------------------------------------
  // Sheet 4: Deal_Inflows
  // -------------------------------------------------------------
  const wsIn = workbook.addWorksheet("Deal_Inflows", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 3, showGridLines: true }],
  });
  wsIn.columns = [
    { header: "Receipt ID", width: 14 },
    { header: "Date", width: 14 },
    { header: "Land ID", width: 14 },
    { header: "Receipt Type", width: 24 },
    { header: "Payment Mode", width: 16 },
    { header: "Amount Received", width: 22 },
    { header: "Received From / Notes", width: 38 },
  ];
  wsIn.spliceRows(1, 0, ["Property Sale Receipts & Deal Collections Log"]);
  wsIn.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsIn.spliceRows(2, 0, []);
  wsIn.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  wsIn.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  dealInflows.forEach((t) => {
    wsIn.addRow([
      t.transCode,
      t.date,
      t.propertyCode,
      t.category,
      t.mode,
      t.amount,
      t.remarks || t.recipientOrSource || "",
    ]);
  });
  wsIn.eachRow((row, rowNum) => {
    if (rowNum >= 4) {
      row.getCell(6).numFmt = "₹ #,##,##0";
    }
  });

  wsIn.addRow([
    "Total Deal Receipts Collected",
    "",
    "",
    "",
    "",
    { formula: `SUM(F$4:F$${dealInEnd})`, result: commMetrics.dealInflowsTotal },
    "",
  ]);
  wsIn.getRow(dealInTotalRow).font = { bold: true };
  wsIn.getRow(dealInTotalRow).getCell(6).numFmt = "₹ #,##,##0";

  // -------------------------------------------------------------
  // Sheet 5: Capital_Inflows
  // -------------------------------------------------------------
  const wsCap = workbook.addWorksheet("Capital_Inflows", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 3, showGridLines: true }],
  });
  wsCap.columns = [
    { header: "Inflow ID", width: 14 },
    { header: "Date", width: 14 },
    { header: "Source / Description", width: 30 },
    { header: "Payment Mode", width: 16 },
    { header: "Amount", width: 22 },
    { header: "Notes", width: 38 },
  ];
  wsCap.spliceRows(1, 0, ["External Capital Funding Log"]);
  wsCap.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsCap.spliceRows(2, 0, []);
  wsCap.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  wsCap.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  capInflows.forEach((t) => {
    wsCap.addRow([
      t.transCode,
      t.date,
      t.recipientOrSource,
      t.mode,
      t.amount,
      t.remarks || "",
    ]);
  });
  wsCap.eachRow((row, rowNum) => {
    if (rowNum >= 4) {
      row.getCell(5).numFmt = "₹ #,##,##0";
    }
  });

  wsCap.addRow([
    "Total Capital Injected",
    "",
    "",
    "",
    { formula: `SUM(E$4:E$${capInEnd})`, result: commMetrics.capitalInjectedTotal },
    "",
  ]);
  wsCap.getRow(capInTotalRow).font = { bold: true };
  wsCap.getRow(capInTotalRow).getCell(5).numFmt = "₹ #,##,##0";

  // -------------------------------------------------------------
  // Sheet 6: Transfers
  // -------------------------------------------------------------
  const wsTrf = workbook.addWorksheet("Transfers", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 3, showGridLines: true }],
  });
  wsTrf.columns = [
    { header: "Transfer ID", width: 14 },
    { header: "Date", width: 14 },
    { header: "Transfer Type", width: 28 },
    { header: "Amount", width: 22 },
    { header: "Reference / Purpose", width: 36 },
    { header: "Notes", width: 36 },
  ];
  wsTrf.spliceRows(1, 0, ["Internal Cash & Bank Transfers Log"]);
  wsTrf.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsTrf.spliceRows(2, 0, []);
  wsTrf.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  wsTrf.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  transfers.forEach((t) => {
    wsTrf.addRow([
      t.transCode,
      t.date,
      t.transferType || "Bank Withdrawal to Cash",
      t.amount,
      t.recipientOrSource,
      t.remarks || "",
    ]);
  });
  wsTrf.eachRow((row, rowNum) => {
    if (rowNum >= 4) {
      row.getCell(4).numFmt = "₹ #,##,##0";
    }
  });

  wsTrf.addRow([
    "Total Internal Transfers",
    "",
    "",
    { formula: `SUM(D$4:D$${trfEnd})`, result: transfers.reduce((s, t) => s + t.amount, 0) },
    "",
    "",
  ]);
  wsTrf.getRow(trfTotalRow).font = { bold: true };
  wsTrf.getRow(trfTotalRow).getCell(4).numFmt = "₹ #,##,##0";

  // -------------------------------------------------------------
  // Sheet 7: Personal_Master (Personal Assets & Milestone Schedule)
  // -------------------------------------------------------------
  const wsPers = workbook.addWorksheet("Personal_Master", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 3, showGridLines: true }],
  });
  wsPers.columns = [
    { header: "Property Code", key: "code", width: 14 },
    { header: "Asset Name", key: "name", width: 28 },
    { header: "Location", key: "loc", width: 24 },
    { header: "Agreed Price", key: "buy", width: 22 },
    { header: "Total Paid", key: "paid", width: 22 },
    { header: "Balance Payable", key: "bal", width: 22 },
    { header: "Status", key: "status", width: 16 },
    { header: "Milestone Details / Remarks", key: "notes", width: 44 },
  ];

  wsPers.spliceRows(1, 0, ["Personal Real Estate & Construction Milestones Master"]);
  wsPers.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsPers.spliceRows(2, 0, []);
  wsPers.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  wsPers.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  const totalPersAgreed = persProps.reduce((sum, p) => sum + (p.agreedPurchasePrice || 0), 0);
  const totalPersPending = Math.max(0, totalPersAgreed - persMetrics.totalInvestmentDone);

  persProps.forEach((p) => {
    const pm = persMetrics.properties.find((m) => m.property.propertyCode === p.propertyCode || m.property.id === p.id);
    const msSummary = (p.milestones || [])
      .map((m) => `${m.name}: ₹${(m.paidAmount || 0).toLocaleString("en-IN")}/${(m.targetAmount || 0).toLocaleString("en-IN")} (${m.status})`)
      .join(" | ");

    wsPers.addRow([
      p.propertyCode,
      p.name,
      p.location || "-",
      p.agreedPurchasePrice,
      pm?.totalInvested || 0,
      pm?.pendingCommitment || 0,
      p.status.toUpperCase(),
      msSummary || p.notes || "",
    ]);
  });
  wsPers.eachRow((row, rowNum) => {
    if (rowNum >= 4) {
      row.getCell(4).numFmt = "₹ #,##,##0";
      row.getCell(5).numFmt = "₹ #,##,##0";
      row.getCell(6).numFmt = "₹ #,##,##0";
    }
  });

  const persEnd = Math.max(4, 4 + persProps.length - 1);
  const persTotalRow = persEnd + 1;
  wsPers.addRow([
    "Total Personal Real Estate",
    "",
    "",
    { formula: `SUM(D$4:D$${persEnd})`, result: totalPersAgreed },
    { formula: `SUM(E$4:E$${persEnd})`, result: persMetrics.totalInvestmentDone },
    { formula: `SUM(F$4:F$${persEnd})`, result: totalPersPending },
    "",
    "",
  ]);
  wsPers.getRow(persTotalRow).font = { bold: true };
  wsPers.getRow(persTotalRow).getCell(4).numFmt = "₹ #,##,##0";
  wsPers.getRow(persTotalRow).getCell(5).numFmt = "₹ #,##,##0";
  wsPers.getRow(persTotalRow).getCell(6).numFmt = "₹ #,##,##0";

  // -------------------------------------------------------------
  // Sheet 8: Personal_Transactions
  // -------------------------------------------------------------
  const wsPersTx = workbook.addWorksheet("Personal_Transactions", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 3, showGridLines: true }],
  });
  wsPersTx.columns = [
    { header: "Date", width: 14 },
    { header: "Type", width: 18 },
    { header: "Category", width: 28 },
    { header: "Property Code", width: 16 },
    { header: "Payment Mode", width: 16 },
    { header: "Amount", width: 22 },
    { header: "Paid To / Notes", width: 38 },
  ];
  wsPersTx.spliceRows(1, 0, ["Personal Asset Transactions Log"]);
  wsPersTx.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsPersTx.spliceRows(2, 0, []);
  wsPersTx.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  wsPersTx.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  persTransactions.forEach((t) => {
    wsPersTx.addRow([
      t.date,
      t.transactionType === "outflow" ? "Personal Outflow" : "Personal Funding",
      t.category,
      t.propertyCode || "-",
      t.mode,
      t.amount,
      t.remarks || t.recipientOrSource || "",
    ]);
  });
  wsPersTx.eachRow((row, rowNum) => {
    if (rowNum >= 4) {
      row.getCell(6).numFmt = "₹ #,##,##0";
    }
  });

  const persTxEnd = Math.max(4, 4 + persTransactions.length - 1);
  const persTxTotalRow = persTxEnd + 1;
  wsPersTx.addRow([
    "Total Personal Activity",
    "",
    "",
    "",
    "",
    { formula: `SUM(F$4:F$${persTxEnd})`, result: persTransactions.reduce((s, t) => s + t.amount, 0) },
    "",
  ]);
  wsPersTx.getRow(persTxTotalRow).font = { bold: true };
  wsPersTx.getRow(persTxTotalRow).getCell(6).numFmt = "₹ #,##,##0";

  // Write workbook to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate Comprehensive Multi-Page Executive Statement PDF
 * Contains complete financial breakdown, land deals, personal assets, and itemized transaction ledgers.
 */
export function generateExecutivePDF(
  properties: SeedProperty[],
  transactions: SeedTransaction[]
): Buffer {
  const commMetrics = calculateCommercialMetrics(properties, transactions);
  const persMetrics = calculatePersonalMetrics(properties, transactions);

  const commProps = properties.filter((p) => p.type === "commercial");
  const persProps = properties.filter((p) => p.type === "personal");

  const commOutflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "outflow"
  );
  const dealInflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "deal_inflow"
  );
  const capInflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "capital_inflow"
  );
  const transfers = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "transfer"
  );
  const persTransactions = transactions.filter((t) => t.scope === "personal");

  const totalPersAgreed = persProps.reduce((sum, p) => sum + (p.agreedPurchasePrice || 0), 0);
  const totalPersPending = Math.max(0, totalPersAgreed - persMetrics.totalInvestmentDone);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const drawHeader = (title: string, subtitle: string) => {
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, 14, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(180, 180, 180);
    doc.text(subtitle, 14, 20);
  };

  // =========================================================================
  // PAGE 1: EXECUTIVE PORTFOLIO SUMMARY & LIQUIDITY MATRIX
  // =========================================================================
  drawHeader(
    "AVANIYA — REAL ESTATE ASSET & LAND PORTFOLIO",
    `Comprehensive Portfolio Audit & Financial Statement • Generated: ${new Date().toLocaleDateString("en-IN")}`
  );

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Executive Liquidity Overview", 14, 34);

  // 4 Top Metric Cards
  const cards = [
    { label: "Net Bank Liquidity", val: formatINR(commMetrics.netBankLiquidity) },
    { label: "Net Cash Balance", val: formatINR(commMetrics.netCashLiquidity) },
    { label: "Total Net Liquidity", val: formatINR(commMetrics.currentNetLiquidity) },
    { label: "Pending to Sellers", val: formatINR(commMetrics.totalPendingPayable) },
  ];

  const cardWidth = (pageWidth - 28 - 9) / 4;
  cards.forEach((c, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    const y = 38;
    doc.setFillColor(248, 248, 250);
    doc.setDrawColor(228, 228, 231);
    doc.roundedRect(x, y, cardWidth, 18, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(c.label.toUpperCase(), x + 3, y + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(c.val, x + 3, y + 13.5);
  });

  // Liquidity Breakdown Table
  const breakdownData = [
    [
      "1. Capital Injected (External Funding)",
      formatINR(commMetrics.capitalInjectedBank),
      formatINR(commMetrics.capitalInjectedCash),
      formatINR(commMetrics.capitalInjectedTotal),
    ],
    [
      "2. Less: Total Property Outflows Paid",
      formatINR(commMetrics.outflowsBank),
      formatINR(commMetrics.outflowsCash),
      formatINR(commMetrics.outflowsTotal),
    ],
    [
      "3. Add: Total Property Sale Receipts",
      formatINR(commMetrics.dealInflowsBank),
      formatINR(commMetrics.dealInflowsCash),
      formatINR(commMetrics.dealInflowsTotal),
    ],
    [
      "4. Bank Withdrawals to Cash",
      `- ${formatINR(commMetrics.transfersBankToCash)}`,
      `+ ${formatINR(commMetrics.transfersBankToCash)}`,
      "₹ 0 (Internal)",
    ],
    [
      "5. Cash Deposits to Bank",
      `+ ${formatINR(commMetrics.transfersCashToBank)}`,
      `- ${formatINR(commMetrics.transfersCashToBank)}`,
      "₹ 0 (Internal)",
    ],
  ];

  autoTable(doc, {
    startY: 61,
    margin: { left: 14, right: 14 },
    head: [["Financial Flow Component", "Bank Account (₹)", "Cash in Hand (₹)", "Combined Net (₹)"]],
    body: breakdownData,
    foot: [
      [
        "CURRENT NET LIQUIDITY AVAILABLE",
        formatINR(commMetrics.netBankLiquidity),
        formatINR(commMetrics.netCashLiquidity),
        formatINR(commMetrics.currentNetLiquidity),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30], cellPadding: 2.5 },
    footStyles: { fillColor: [220, 252, 231], textColor: [22, 101, 52], fontStyle: "bold", fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 74 },
      1: { cellWidth: 36, halign: "right" },
      2: { cellWidth: 36, halign: "right" },
      3: { cellWidth: 36, halign: "right", fontStyle: "bold" },
    },
  });

  // Portfolio Overview Summary Table
  const portfolioSummaryY = (doc as any).lastAutoTable.finalY + 8;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Portfolio Asset Allocation Summary", 14, portfolioSummaryY);

  const allocationData = [
    [
      "Commercial Land Deals",
      `${commProps.length} Land Assets`,
      formatINR(commMetrics.totalAgreedBuyPrice),
      formatINR(commMetrics.outflowsTotal),
      formatINR(commMetrics.totalPendingPayable),
      formatINR(commMetrics.totalPendingReceivable),
    ],
    [
      "Personal Asset Investments",
      `${persProps.length} Residential Units`,
      formatINR(totalPersAgreed),
      formatINR(persMetrics.totalInvestmentDone),
      formatINR(totalPersPending),
      "N/A (Personal)",
    ],
  ];

  autoTable(doc, {
    startY: portfolioSummaryY + 4,
    margin: { left: 14, right: 14 },
    head: [["Asset Portfolio Scope", "Asset Count", "Total Value / Buy (₹)", "Paid to Date (₹)", "Pending Payable (₹)", "Receivables (₹)"]],
    body: allocationData,
    foot: [
      [
        "Total Portfolio Aggregation",
        `${commProps.length + persProps.length} Total Assets`,
        formatINR(commMetrics.totalAgreedBuyPrice + totalPersAgreed),
        formatINR(commMetrics.outflowsTotal + persMetrics.totalInvestmentDone),
        formatINR(commMetrics.totalPendingPayable + totalPersPending),
        formatINR(commMetrics.totalPendingReceivable),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [39, 39, 42], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30], cellPadding: 2.5 },
    footStyles: { fillColor: [244, 244, 245], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 28 },
      2: { cellWidth: 28, halign: "right" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 28, halign: "right" },
    },
  });

  // =========================================================================
  // PAGE 2: COMMERCIAL LAND MASTER LEDGER
  // =========================================================================
  doc.addPage();
  drawHeader("COMMERCIAL LAND DEALS MASTER LEDGER", "Itemized valuations, outflows, receipts, payables, and realized profits");

  const landData = commMetrics.propertyMetrics.map((pm) => [
    pm.property.propertyCode,
    pm.property.name,
    pm.property.status.toUpperCase(),
    formatINR(pm.property.agreedPurchasePrice),
    formatINR(pm.totalOutflowsPaid),
    formatINR(pm.pendingOutflow),
    pm.property.targetSalePrice ? formatINR(pm.property.targetSalePrice) : "-",
    formatINR(pm.totalReceiptsCollected),
    formatINR(pm.pendingInflow),
    pm.realizedProfit !== 0 ? formatINR(pm.realizedProfit) : "-",
  ]);

  autoTable(doc, {
    startY: 32,
    margin: { left: 14, right: 14 },
    head: [
      [
        "Land ID",
        "Property Name",
        "Status",
        "Buy Price",
        "Total Paid",
        "Pending Pay",
        "Target Exit",
        "Receipts",
        "Receivable",
        "Profit/Loss",
      ],
    ],
    body: landData,
    foot: [
      [
        "Total",
        "All Land Deals",
        "-",
        formatINR(commMetrics.totalAgreedBuyPrice),
        formatINR(commMetrics.outflowsTotal),
        formatINR(commMetrics.totalPendingPayable),
        formatINR(commMetrics.totalTargetSalePrice),
        formatINR(commMetrics.dealInflowsTotal),
        formatINR(commMetrics.totalPendingReceivable),
        formatINR(commMetrics.totalRealizedProfit),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [30, 30, 30], cellPadding: 2 },
    footStyles: { fillColor: [244, 244, 245], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: "bold" },
      1: { cellWidth: 30 },
      2: { cellWidth: 15 },
      3: { cellWidth: 17, halign: "right" },
      4: { cellWidth: 17, halign: "right" },
      5: { cellWidth: 17, halign: "right" },
      6: { cellWidth: 17, halign: "right" },
      7: { cellWidth: 17, halign: "right" },
      8: { cellWidth: 17, halign: "right" },
      9: { cellWidth: 19, halign: "right", fontStyle: "bold" },
    },
  });

  // =========================================================================
  // PAGE 3: PERSONAL REAL ESTATE & MILESTONE SCHEDULE
  // =========================================================================
  doc.addPage();
  drawHeader("PERSONAL REAL ESTATE & MILESTONE SCHEDULE", "Residential assets, construction installments, and payment stages");

  const persData = persProps.map((p) => {
    const pm = persMetrics.properties.find((m) => m.property.propertyCode === p.propertyCode || m.property.id === p.id);
    const msCount = (p.milestones || []).length;
    const msDone = (p.milestones || []).filter((m) => m.status === "completed").length;

    return [
      p.propertyCode,
      p.name,
      p.location || "-",
      p.status.toUpperCase(),
      formatINR(p.agreedPurchasePrice),
      formatINR(pm?.totalInvested || 0),
      formatINR(pm?.pendingCommitment || 0),
      msCount > 0 ? `${msDone} / ${msCount} Stages Done` : "No Stages",
    ];
  });

  autoTable(doc, {
    startY: 32,
    margin: { left: 14, right: 14 },
    head: [["Property Code", "Property Name", "Location", "Status", "Agreed Cost", "Paid to Date", "Balance Due", "Milestones"]],
    body: persData,
    foot: [
      [
        "Total",
        "Personal Assets",
        "-",
        "-",
        formatINR(totalPersAgreed),
        formatINR(persMetrics.totalInvestmentDone),
        formatINR(totalPersPending),
        "-",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 30, 30], cellPadding: 2.5 },
    footStyles: { fillColor: [244, 244, 245], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: "bold" },
      1: { cellWidth: 36 },
      2: { cellWidth: 26 },
      3: { cellWidth: 16 },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
      7: { cellWidth: 24 },
    },
  });

  // =========================================================================
  // PAGE 4: COMMERCIAL OUTFLOWS & EXPENSES LEDGER
  // =========================================================================
  doc.addPage();
  drawHeader("COMMERCIAL PROPERTY OUTFLOWS LEDGER", "Chronological record of land purchases, advances, and legal expenses");

  const outflowsData = commOutflows.map((t) => [
    t.date,
    t.transCode || "-",
    t.propertyCode || "-",
    t.category,
    t.mode,
    formatINR(t.amount),
    t.remarks || t.recipientOrSource || "-",
  ]);

  autoTable(doc, {
    startY: 32,
    margin: { left: 14, right: 14 },
    head: [["Date", "Trans Code", "Land ID", "Category", "Mode", "Amount Paid", "Beneficiary / Remarks"]],
    body: outflowsData,
    foot: [["Total Outflows Paid", "", "", "", "", formatINR(commMetrics.outflowsTotal), ""]],
    theme: "grid",
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [30, 30, 30], cellPadding: 1.8 },
    footStyles: { fillColor: [244, 244, 245], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 18 },
      2: { cellWidth: 18 },
      3: { cellWidth: 32 },
      4: { cellWidth: 14 },
      5: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      6: { cellWidth: 58 },
    },
  });

  // =========================================================================
  // PAGE 5: RECEIPTS & CAPITAL FUNDING LEDGER
  // =========================================================================
  doc.addPage();
  drawHeader("RECEIPTS & CAPITAL FUNDING LEDGER", "Chronological record of buyer collections, booking tokens, and capital funding");

  const receiptsAndFunding = [
    ...dealInflows.map((t) => ({ ...t, kind: "Deal Receipt" })),
    ...capInflows.map((t) => ({ ...t, kind: "Capital Inflow" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const receiptsData = receiptsAndFunding.map((t) => [
    t.date,
    t.transCode || "-",
    t.kind,
    t.propertyCode || "-",
    t.category,
    t.mode,
    formatINR(t.amount),
    t.remarks || t.recipientOrSource || "-",
  ]);

  autoTable(doc, {
    startY: 32,
    margin: { left: 14, right: 14 },
    head: [["Date", "Code", "Type", "Land ID", "Category", "Mode", "Amount (₹)", "Source / Payer / Remarks"]],
    body: receiptsData,
    foot: [
      [
        "Total Inward Collections",
        "",
        "",
        "",
        "",
        "",
        formatINR(commMetrics.dealInflowsTotal + commMetrics.capitalInjectedTotal),
        "",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [30, 30, 30], cellPadding: 1.8 },
    footStyles: { fillColor: [244, 244, 245], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 16 },
      1: { cellWidth: 16 },
      2: { cellWidth: 20 },
      3: { cellWidth: 16 },
      4: { cellWidth: 28 },
      5: { cellWidth: 14 },
      6: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      7: { cellWidth: 48 },
    },
  });

  // =========================================================================
  // PAGE 6: PERSONAL TRANSACTIONS & INTERNAL TRANSFERS
  // =========================================================================
  doc.addPage();
  drawHeader("PERSONAL TRANSACTIONS & INTERNAL TRANSFERS", "Personal asset outflows, savings allocations, and bank-cash transfers");

  const persAndTransfers = [
    ...persTransactions.map((t) => ({
      date: t.date,
      type: t.transactionType === "outflow" ? "Personal Outflow" : "Personal Funding",
      code: t.propertyCode || "-",
      category: t.category,
      mode: t.mode,
      amount: t.amount,
      notes: t.remarks || t.recipientOrSource || "-",
    })),
    ...transfers.map((t) => ({
      date: t.date,
      type: "Internal Transfer",
      code: t.transCode || "-",
      category: t.transferType || "Bank Withdrawal to Cash",
      mode: "Bank ↔ Cash",
      amount: t.amount,
      notes: t.remarks || t.recipientOrSource || "-",
    })),
  ];

  const persTrfData = persAndTransfers.map((t) => [
    t.date,
    t.type,
    t.code,
    t.category,
    t.mode,
    formatINR(t.amount),
    t.notes,
  ]);

  autoTable(doc, {
    startY: 32,
    margin: { left: 14, right: 14 },
    head: [["Date", "Activity Type", "Ref / Asset", "Category / Transfer Type", "Mode", "Amount (₹)", "Remarks"]],
    body: persTrfData,
    theme: "grid",
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [30, 30, 30], cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 26 },
      2: { cellWidth: 18 },
      3: { cellWidth: 36 },
      4: { cellWidth: 20 },
      5: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      6: { cellWidth: 40 },
    },
  });

  // Running Page Footers (Page X of Y)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text(
      "Avaniya Portfolio Tracker • Strictly Confidential • Generated for Executive Review",
      14,
      pageHeight - 8
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14 - 18,
      pageHeight - 8
    );
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/**
 * Generate Universal Tabular CSV with UTF-8 BOM encoding
 */
export function generateCSV(transactions: SeedTransaction[]): string {
  const headers = [
    "Trans ID",
    "Scope",
    "Type",
    "Date",
    "Property Code",
    "Category",
    "Payment Mode",
    "Transfer Type",
    "Amount (INR)",
    "Recipient / Source",
    "Remarks",
  ];

  const rows = transactions.map((t) => [
    `"${t.transCode || ""}"`,
    `"${t.scope}"`,
    `"${t.transactionType}"`,
    `"${t.date}"`,
    `"${t.propertyCode || ""}"`,
    `"${t.category}"`,
    `"${t.mode}"`,
    `"${t.transferType || ""}"`,
    t.amount,
    `"${(t.recipientOrSource || "").replace(/"/g, '""')}"`,
    `"${(t.remarks || "").replace(/"/g, '""')}"`,
  ]);

  return (
    "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  );
}
