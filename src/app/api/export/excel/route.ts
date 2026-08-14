import { NextRequest, NextResponse } from "next/server";
import { getProperties, getTransactions, getCategories } from "@/lib/dataStore";
import { generateExcelWorkbook } from "@/lib/exportEngine";
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
    const [properties, transactions, categories] = await Promise.all([
      getProperties(datasetId, undefined, isAll),
      getTransactions(datasetId, undefined, isAll),
      getCategories(datasetId, undefined, isAll),
    ]);

    const buffer = await generateExcelWorkbook(properties, transactions, categories);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Avaniya_Real_Estate_Tracker_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to generate Excel export";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
