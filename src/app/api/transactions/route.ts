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
  const datasetId = isSuperAdmin
    ? requestedDataset || session?.datasetId || "ds_yousuf_portfolio"
    : session?.datasetId || session?.userId || "fresh_user";

  const isAll = isSuperAdmin && requestedDataset === "all";

  try {
    const transactions = await getTransactions(
      datasetId,
      { scope, propertyCode, type },
      isAll
    );
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const isSuperAdmin = session?.role === "super_admin";
  const body = await req.json();

  const datasetId = isSuperAdmin && body.datasetId
    ? body.datasetId
    : session?.datasetId || session?.userId || "fresh_user";
  const userId = session?.userId || "user_default";

  try {
    if (!body.amount || !body.category || !body.mode) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount, Category, and Payment Mode are required",
        },
        { status: 400 }
      );
    }

    const newTx = await addTransaction(
      {
        scope: body.scope || "commercial",
        transactionType: body.transactionType || "outflow",
        transCode: body.transCode,
        propertyCode: body.propertyCode,
        date: body.date || new Date().toISOString().split("T")[0],
        category: body.category,
        mode: body.mode,
        transferType: body.transferType,
        amount: parseFloat(body.amount) || 0,
        recipientOrSource: body.recipientOrSource || "",
        remarks: body.remarks || "",
      },
      datasetId,
      userId
    );

    return NextResponse.json({ success: true, data: newTx });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
