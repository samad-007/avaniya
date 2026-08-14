import { NextRequest, NextResponse } from "next/server";
import { getProperties, getTransactions } from "@/lib/dataStore";
import { generateExecutivePDF } from "@/lib/exportEngine";
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
    const [properties, transactions] = await Promise.all([
      getProperties(datasetId, undefined, isAll),
      getTransactions(datasetId, undefined, isAll),
    ]);

    const buffer = generateExecutivePDF(properties, transactions);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Avaniya_Executive_Statement_${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to generate PDF export";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
