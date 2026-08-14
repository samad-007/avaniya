import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/dataStore";
import { generateCSV } from "@/lib/exportEngine";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const userId = session?.userId || "demo_businessman_1";

  try {
    const transactions = await getTransactions(userId);
    const csvData = generateCSV(transactions);

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Real_Estate_Transactions_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
