import { NextRequest, NextResponse } from "next/server";
import { getTransactions, addTransaction } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const { searchParams } = new URL(req.url);

  const scope = searchParams.get("scope") || undefined;
  const propertyCode = searchParams.get("propertyCode") || undefined;
  const type = searchParams.get("type") || undefined;
  const requestedDataset = searchParams.get("datasetId");

  const isSuperAdmin = session?.role === "super_admin";
  const datasetId = isSuperAdmin && requestedDataset
    ? requestedDataset
    : session?.datasetId || session?.userId || "ds_yousuf_portfolio";

  const isAll = isSuperAdmin && requestedDataset === "all";

  try {
    const transactions = await getTransactions(
      datasetId,
      { scope, propertyCode, type },
      isAll
    );
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch transactions";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentication required to log transactions" },
      { status: 401 }
    );
  }

  const isSuperAdmin = session.role === "super_admin";
  const body = await req.json();

  const datasetId = isSuperAdmin && body.datasetId
    ? body.datasetId
    : session.datasetId || session.userId || "ds_yousuf_portfolio";
  const userId = session.userId || "user_default";

  try {
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0 || !body.category || !body.mode) {
      return NextResponse.json(
        {
          success: false,
          error: "A positive Amount, valid Category, and Payment Mode (Bank or Cash) are required",
        },
        { status: 400 }
      );
    }

    const roundedAmount = Math.round(amount);

    let borneBy: "self" | "seller" | "buyer" | "split" = "self";
    if (body.borneBy && ["self", "seller", "buyer", "split"].includes(body.borneBy)) {
      borneBy = body.borneBy;
    }

    let amountSelf = 0;
    let amountSeller = 0;
    let amountBuyer = 0;

    if (body.transactionType === "outflow") {
      if (borneBy === "seller") {
        amountSeller = roundedAmount;
      } else if (borneBy === "buyer") {
        amountBuyer = roundedAmount;
      } else if (borneBy === "split") {
        amountSelf = Math.round(parseFloat(body.amountSelf) || 0);
        amountSeller = Math.round(parseFloat(body.amountSeller) || 0);
        amountBuyer = Math.round(parseFloat(body.amountBuyer) || 0);

        if (amountSelf + amountSeller + amountBuyer !== roundedAmount) {
          return NextResponse.json(
            {
              success: false,
              error: `Split amounts (Self: ₹${amountSelf}, Seller: ₹${amountSeller}, Buyer: ₹${amountBuyer}) must sum up exactly to total amount (₹${roundedAmount})`,
            },
            { status: 400 }
          );
        }
      } else {
        amountSelf = roundedAmount;
      }
    }

    const newTx = await addTransaction(
      {
        scope: body.scope === "personal" ? "personal" : "commercial",
        transactionType: body.transactionType || "outflow",
        transCode: body.transCode ? String(body.transCode).trim() : undefined,
        loanId: body.loanId ? String(body.loanId).trim() : undefined,
        loanCode: body.loanCode ? String(body.loanCode).trim() : undefined,
        propertyCode: body.propertyCode ? String(body.propertyCode).trim() : undefined,
        subPlotNumber: body.subPlotNumber ? String(body.subPlotNumber).trim() : undefined,
        attachmentUrl: body.attachmentUrl ? String(body.attachmentUrl).trim() : undefined,
        date: body.date || new Date().toISOString().split("T")[0],
        category: String(body.category).trim(),
        mode: body.mode === "Cash" ? "Cash" : "Bank",
        transferType: body.transferType,
        amount: roundedAmount,
        borneBy,
        amountSelf,
        amountSeller,
        amountBuyer,
        recipientOrSource: body.recipientOrSource ? String(body.recipientOrSource).trim() : "",
        remarks: body.remarks ? String(body.remarks).trim() : "",
      },
      datasetId,
      userId
    );

    return NextResponse.json({ success: true, data: newTx });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to record transaction";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
