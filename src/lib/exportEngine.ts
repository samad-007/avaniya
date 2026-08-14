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
 * Generate multi-tab Excel (.xlsx) workbook matching and elevating reference spreadsheets
 */
export async function generateExcelWorkbook(
  properties: SeedProperty[],
  transactions: SeedTransaction[],
  categories: SeedCategory[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Real Estate Portfolio Engine";
  workbook.lastModifiedBy = "Samad";
  workbook.created = new Date();
  workbook.modified = new Date();

  // -------------------------------------------------------------
  // Sheet 1: Dashboard
  // -------------------------------------------------------------
  const wsDash = workbook.addWorksheet("Dashboard", {
    views: [{ showGridLines: true }],
  });

  wsDash.columns = [
    { width: 3 },
    { width: 36 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
  ];

  // Header Title
  wsDash.getCell("B2").value = "REAL ESTATE & LAND ASSET PORTFOLIO";
  wsDash.getCell("B2").font = { name: "Arial", size: 16, bold: true };

  // KPI Headers
  wsDash.getCell("B4").value = "NET BANK BALANCE";
  wsDash.getCell("C4").value = "NET CASH BALANCE";
  wsDash.getCell("D4").value = "TOTAL LIQUIDITY";
  wsDash.getCell("E4").value = "REALIZED PROFIT";

  ["B4", "C4", "D4", "E4"].forEach((coord) => {
    const c = wsDash.getCell(coord);
    c.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF777777" } };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF5F5F5" },
    };
    c.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
  });

  // KPI Formula Cells
  wsDash.getCell("B5").value = { formula: "C11-C12+C13-C14+C15" };
  wsDash.getCell("C5").value = { formula: "D11-D12+D13+D14-D15" };
  wsDash.getCell("D5").value = { formula: "B5+C5" };
  wsDash.getCell("E5").value = { formula: "SUM(Land_Master!Q4:Q30)" };

  ["B5", "C5", "D5", "E5"].forEach((coord) => {
    const c = wsDash.getCell(coord);
    c.font = { name: "Arial", size: 14, bold: true };
    c.numFmt = "₹ #,##,##0";
    c.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
  });

  // Breakdown Table Header
  wsDash.getCell("B9").value = "Liquidity Breakdown";
  wsDash.getCell("B9").font = { name: "Arial", size: 12, bold: true };

  wsDash.getCell("B10").value = "Metric";
  wsDash.getCell("C10").value = "Bank";
  wsDash.getCell("D10").value = "Cash";
  wsDash.getCell("E10").value = "Total Combined";

  ["B10", "C10", "D10", "E10"].forEach((coord) => {
    const c = wsDash.getCell(coord);
    c.font = { name: "Arial", size: 10, bold: true };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEAEAEA" },
    };
  });

  // Breakdown Rows with Live SUMIF formulas
  const breakdownRows = [
    {
      row: 11,
      label: "Capital Injected (External)",
      bankFormula: 'SUMIF(Capital_Inflows!D:D, "Bank", Capital_Inflows!E:E)',
      cashFormula: 'SUMIF(Capital_Inflows!D:D, "Cash", Capital_Inflows!E:E)',
    },
    {
      row: 12,
      label: "Less: Total Property Outflows",
      bankFormula: 'SUMIF(Outflows!E:E, "Bank", Outflows!F:F)',
      cashFormula: 'SUMIF(Outflows!E:E, "Cash", Outflows!F:F)',
    },
    {
      row: 13,
      label: "Add: Total Sale Receipts",
      bankFormula: 'SUMIF(Deal_Inflows!E:E, "Bank", Deal_Inflows!F:F)',
      cashFormula: 'SUMIF(Deal_Inflows!E:E, "Cash", Deal_Inflows!F:F)',
    },
    {
      row: 14,
      label: "Less/Add: Bank Withdrawals to Cash",
      bankFormula:
        'SUMIF(Transfers!C:C, "Bank Withdrawal to Cash", Transfers!D:D)',
      cashFormula:
        'SUMIF(Transfers!C:C, "Bank Withdrawal to Cash", Transfers!D:D)',
    },
    {
      row: 15,
      label: "Add/Less: Cash Deposits to Bank",
      bankFormula:
        'SUMIF(Transfers!C:C, "Cash Deposit to Bank", Transfers!D:D)',
      cashFormula:
        'SUMIF(Transfers!C:C, "Cash Deposit to Bank", Transfers!D:D)',
    },
  ];

  breakdownRows.forEach(({ row, label, bankFormula, cashFormula }) => {
    wsDash.getCell(`B${row}`).value = label;
    wsDash.getCell(`C${row}`).value = { formula: bankFormula };
    wsDash.getCell(`D${row}`).value = { formula: cashFormula };
    wsDash.getCell(`E${row}`).value = { formula: `C${row}+D${row}` };

    wsDash.getCell(`C${row}`).numFmt = "₹ #,##,##0";
    wsDash.getCell(`D${row}`).numFmt = "₹ #,##,##0";
    wsDash.getCell(`E${row}`).numFmt = "₹ #,##,##0";
  });

  // Current Net Liquidity Row
  wsDash.getCell("B16").value = "CURRENT NET LIQUIDITY";
  wsDash.getCell("B16").font = { bold: true };
  wsDash.getCell("C16").value = { formula: "B5" };
  wsDash.getCell("D16").value = { formula: "C5" };
  wsDash.getCell("E16").value = { formula: "D5" };

  ["B16", "C16", "D16", "E16"].forEach((coord) => {
    const c = wsDash.getCell(coord);
    c.font = { bold: true };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0FDF4" },
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
    { header: "Land ID", key: "code", width: 12 },
    { header: "Property / Location", key: "name", width: 26 },
    { header: "Acquisition Date", key: "date", width: 16 },
    { header: "Agreed Purchase Price", key: "buy", width: 22 },
    { header: "Target Sale Price", key: "target", width: 20 },
    { header: "Agreed Selling Price", key: "sale", width: 20 },
    { header: "Status", key: "status", width: 16 },
    { header: "Purchase Paid (Cash)", key: "paid_cash", width: 20 },
    { header: "Purchase Paid (Bank)", key: "paid_bank", width: 20 },
    { header: "Property Expenses", key: "expenses", width: 20 },
    { header: "Total Outflows Paid", key: "total_out", width: 20 },
    { header: "Receipts (Cash)", key: "rec_cash", width: 18 },
    { header: "Receipts (Bank)", key: "rec_bank", width: 18 },
    { header: "Total Receipts Collected", key: "total_rec", width: 22 },
    { header: "Pending Outflow", key: "pending_out", width: 20 },
    { header: "Pending Inflow", key: "pending_in", width: 20 },
    { header: "Net Profit / Loss", key: "pnl", width: 20 },
  ];

  // Title Row
  wsLand.spliceRows(1, 0, ["Land Inventory & Deal Master"]);
  wsLand.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsLand.spliceRows(2, 0, []);

  // Header styling (Row 3)
  const headerRow = wsLand.getRow(3);
  headerRow.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  const commProps = properties.filter((p) => p.type === "commercial");
  commProps.forEach((p, index) => {
    const rowNum = 4 + index;
    wsLand.addRow([
      p.propertyCode,
      p.name,
      p.acquisitionDate,
      p.agreedPurchasePrice,
      p.targetSalePrice || 0,
      p.agreedSellingPrice || 0,
      p.status,
      {
        formula: `SUMIFS(Outflows!F:F, Outflows!C:C, A${rowNum}, Outflows!E:E, "Cash", Outflows!D:D, "Purchase*")`,
      },
      {
        formula: `SUMIFS(Outflows!F:F, Outflows!C:C, A${rowNum}, Outflows!E:E, "Bank", Outflows!D:D, "Purchase*")`,
      },
      {
        formula: `SUMIFS(Outflows!F:F, Outflows!C:C, A${rowNum}, Outflows!D:D, "<>Purchase*")`,
      },
      { formula: `SUM(H${rowNum}:J${rowNum})` },
      {
        formula: `SUMIFS(Deal_Inflows!F:F, Deal_Inflows!C:C, A${rowNum}, Deal_Inflows!E:E, "Cash")`,
      },
      {
        formula: `SUMIFS(Deal_Inflows!F:F, Deal_Inflows!C:C, A${rowNum}, Deal_Inflows!E:E, "Bank")`,
      },
      { formula: `SUM(L${rowNum}:M${rowNum})` },
      { formula: `IF(D${rowNum}>0, D${rowNum}-(H${rowNum}+I${rowNum}), 0)` },
      { formula: `IF(F${rowNum}>0, F${rowNum}-N${rowNum}, 0)` },
      { formula: `IF(N${rowNum}>0, N${rowNum}-K${rowNum}, 0)` },
    ]);

    const r = wsLand.getRow(rowNum);
    ["D", "E", "F", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"].forEach(
      (col) => {
        r.getCell(col).numFmt = "₹ #,##,##0";
      }
    );
  });

  // Total Row in Land Master
  const totalLandRow = 4 + commProps.length;
  wsLand.addRow([
    "Total",
    "",
    "",
    { formula: `SUM(D4:D${totalLandRow - 1})` },
    { formula: `SUM(E4:E${totalLandRow - 1})` },
    { formula: `SUM(F4:F${totalLandRow - 1})` },
    "",
    { formula: `SUM(H4:H${totalLandRow - 1})` },
    { formula: `SUM(I4:I${totalLandRow - 1})` },
    { formula: `SUM(J4:J${totalLandRow - 1})` },
    { formula: `SUM(K4:K${totalLandRow - 1})` },
    { formula: `SUM(L4:L${totalLandRow - 1})` },
    { formula: `SUM(M4:M${totalLandRow - 1})` },
    { formula: `SUM(N4:N${totalLandRow - 1})` },
    { formula: `SUM(O4:O${totalLandRow - 1})` },
    { formula: `SUM(P4:P${totalLandRow - 1})` },
    { formula: `SUM(Q4:Q${totalLandRow - 1})` },
  ]);

  const tRow = wsLand.getRow(totalLandRow);
  tRow.font = { bold: true };
  ["D", "E", "F", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"].forEach(
    (col) => {
      tRow.getCell(col).numFmt = "₹ #,##,##0";
    }
  );

  // -------------------------------------------------------------
  // Sheet 3: Outflows
  // -------------------------------------------------------------
  const wsOut = workbook.addWorksheet("Outflows", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 3, showGridLines: true }],
  });
  wsOut.columns = [
    { header: "Trans ID", width: 12 },
    { header: "Date", width: 14 },
    { header: "Land ID", width: 14 },
    { header: "Category", width: 24 },
    { header: "Payment Mode", width: 16 },
    { header: "Amount Paid", width: 20 },
    { header: "Paid To / Notes", width: 36 },
  ];
  wsOut.spliceRows(1, 0, ["Property Outflows Log"]);
  wsOut.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsOut.spliceRows(2, 0, []);
  wsOut.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  wsOut.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  const commOutflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "outflow"
  );
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

  // Total Outflows Row
  const totalOutRow = 4 + commOutflows.length;
  wsOut.addRow([
    "Total",
    "",
    "",
    "",
    "",
    { formula: `SUM(F4:F${totalOutRow - 1})` },
    "",
  ]);
  wsOut.getRow(totalOutRow).font = { bold: true };
  wsOut.getRow(totalOutRow).getCell(6).numFmt = "₹ #,##,##0";

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
    { header: "Receipt Type", width: 22 },
    { header: "Payment Mode", width: 16 },
    { header: "Amount Received", width: 20 },
    { header: "Received From / Notes", width: 36 },
  ];
  wsIn.spliceRows(1, 0, ["Property Sale Receipts Log"]);
  wsIn.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsIn.spliceRows(2, 0, []);
  wsIn.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  wsIn.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  const dealInflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "deal_inflow"
  );
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
  const totalDealInRow = 4 + dealInflows.length;
  wsIn.addRow([
    "Total",
    "",
    "",
    "",
    "",
    { formula: `SUM(F4:F${Math.max(4, totalDealInRow - 1)})` },
    "",
  ]);
  wsIn.getRow(totalDealInRow).font = { bold: true };
  wsIn.getRow(totalDealInRow).getCell(6).numFmt = "₹ #,##,##0";

  // -------------------------------------------------------------
  // Sheet 5: Capital_Inflows
  // -------------------------------------------------------------
  const wsCap = workbook.addWorksheet("Capital_Inflows", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 3, showGridLines: true }],
  });
  wsCap.columns = [
    { header: "Inflow ID", width: 14 },
    { header: "Date", width: 14 },
    { header: "Source / Description", width: 28 },
    { header: "Payment Mode", width: 16 },
    { header: "Amount", width: 20 },
    { header: "Notes", width: 36 },
  ];
  wsCap.spliceRows(1, 0, ["Capital Funding Log"]);
  wsCap.getCell("A1").font = { name: "Arial", size: 14, bold: true };
  wsCap.spliceRows(2, 0, []);
  wsCap.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  wsCap.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111111" },
  };

  const capInflows = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "capital_inflow"
  );
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

  const totalCapRow = 4 + capInflows.length;
  wsCap.addRow([
    "Total",
    "",
    "",
    "",
    { formula: `SUM(E4:E${totalCapRow - 1})` },
    "",
  ]);
  wsCap.getRow(totalCapRow).font = { bold: true };
  wsCap.getRow(totalCapRow).getCell(5).numFmt = "₹ #,##,##0";

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
    { header: "Amount", width: 20 },
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

  const transfers = transactions.filter(
    (t) => t.scope === "commercial" && t.transactionType === "transfer"
  );
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

  const totalTrfRow = 4 + transfers.length;
  wsTrf.addRow([
    "Total",
    "",
    "",
    { formula: `SUM(D4:D${totalTrfRow - 1})` },
    "",
    "",
  ]);
  wsTrf.getRow(totalTrfRow).font = { bold: true };
  wsTrf.getRow(totalTrfRow).getCell(4).numFmt = "₹ #,##,##0";

  // Write workbook to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate Executive Deal Statement PDF
 */
export function generateExecutivePDF(
  properties: SeedProperty[],
  transactions: SeedTransaction[]
): Buffer {
  const commMetrics = calculateCommercialMetrics(properties, transactions);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("REAL ESTATE ASSET & LAND PORTFOLIO", 14, 14);
  doc.setFontSize(9);
  doc.text(
    `Executive Liquidity & Deal Statement • Generated: ${new Date().toLocaleDateString("en-IN")}`,
    14,
    22
  );

  // Liquidity Summary Cards
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.text("Portfolio Liquidity Overview", 14, 38);

  const cardY = 42;
  const cards = [
    { label: "Net Bank Liquidity", val: formatINR(commMetrics.netBankLiquidity) },
    { label: "Net Cash In Hand", val: formatINR(commMetrics.netCashLiquidity) },
    { label: "Total Liquidity", val: formatINR(commMetrics.currentNetLiquidity) },
    { label: "Pending to Sellers", val: formatINR(commMetrics.totalPendingPayable) },
  ];

  cards.forEach((c, idx) => {
    const x = 14 + idx * 46;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, cardY, 44, 20, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(c.label, x + 3, cardY + 6);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(c.val, x + 3, cardY + 15);
  });

  // Table of Active Land Deals
  const tableData = commMetrics.propertyMetrics.map((pm) => [
    pm.property.propertyCode,
    pm.property.name,
    formatINR(pm.property.agreedPurchasePrice),
    formatINR(pm.totalOutflowsPaid),
    formatINR(pm.pendingOutflow),
    pm.property.targetSalePrice ? formatINR(pm.property.targetSalePrice) : "-",
    pm.property.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: 70,
    head: [
      [
        "Land ID",
        "Property Location",
        "Buy Price",
        "Total Paid",
        "Pending Payable",
        "Target Exit",
        "Status",
      ],
    ],
    body: tableData,
    foot: [
      [
        "Total",
        "Across All Deals",
        formatINR(commMetrics.totalAgreedBuyPrice),
        formatINR(commMetrics.outflowsTotal),
        formatINR(commMetrics.totalPendingPayable),
        formatINR(commMetrics.totalTargetSalePrice),
        "-",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [15, 15, 15], textColor: [255, 255, 255] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/**
 * Generate Universal Tabular CSV
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

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
