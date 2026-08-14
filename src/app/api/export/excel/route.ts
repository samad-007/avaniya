import { NextRequest, NextResponse } from "next/server";
import { getProperties, getTransactions, getCategories } from "@/lib/dataStore";
import { generateExcelWorkbook } from "@/lib/exportEngine";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const userId = session?.userId || "demo_businessman_1";

  try {
    const properties = await getProperties(userId);
    const transactions = await getTransactions(userId);
    const categories = await getCategories(userId);

    const buffer = await generateExcelWorkbook(properties, transactions, categories);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Real_Estate_Land_Tracker_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
