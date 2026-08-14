import { NextRequest, NextResponse } from "next/server";
import { getCommercialMetrics, getPersonalMetrics } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const userId = session?.userId || "demo_businessman_1";
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "all";

  try {
    const commercial =
      scope === "all" || scope === "commercial"
        ? await getCommercialMetrics(userId)
        : null;

    const personal =
      scope === "all" || scope === "personal"
        ? await getPersonalMetrics(userId)
        : null;

    return NextResponse.json({
      success: true,
      data: { commercial, personal },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
