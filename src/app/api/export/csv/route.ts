import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/dataStore";
import { generateCSV } from "@/lib/exportEngine";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please sign in to export data." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const requestedDataset = searchParams.get("datasetId");
  const isSuperAdmin = session.role === "super_admin";

  const datasetId = isSuperAdmin && requestedDataset
    ? requestedDataset
    : session.datasetId || session.userId || "ds_yousuf_portfolio";

  const isAll = isSuperAdmin && requestedDataset === "all";

  try {
    const transactions = await getTransactions(datasetId, undefined, isAll);
    const csvData = generateCSV(transactions);

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Avaniya_Transactions_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to generate CSV export";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
