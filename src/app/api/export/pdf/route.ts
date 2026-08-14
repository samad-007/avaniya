import { NextRequest, NextResponse } from "next/server";
import { getProperties, getTransactions } from "@/lib/dataStore";
import { generateExecutivePDF } from "@/lib/exportEngine";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const userId = session?.userId || "demo_businessman_1";

  try {
    const properties = await getProperties(userId);
    const transactions = await getTransactions(userId);

    const buffer = generateExecutivePDF(properties, transactions);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Executive_Portfolio_Statement_${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
