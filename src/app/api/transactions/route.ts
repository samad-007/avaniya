import { NextRequest, NextResponse } from "next/server";
import { getTransactions, addTransaction } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const userId = session?.userId || "demo_businessman_1";
  const { searchParams } = new URL(req.url);

  const scope = searchParams.get("scope") || undefined;
  const propertyCode = searchParams.get("propertyCode") || undefined;
  const type = searchParams.get("type") || undefined;

  try {
    const transactions = await getTransactions(userId, {
      scope,
      propertyCode,
      type,
    });
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
  const userId = session?.userId || "demo_businessman_1";

  try {
    const body = await req.json();
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
