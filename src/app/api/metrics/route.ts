import { NextRequest, NextResponse } from "next/server";
import { getCommercialMetrics, getPersonalMetrics } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "all";
  const requestedDataset = searchParams.get("datasetId");

  const isSuperAdmin = session?.role === "super_admin";
  const datasetId = isSuperAdmin
    ? requestedDataset || session?.datasetId || "ds_yousuf_portfolio"
    : session?.datasetId || session?.userId || "fresh_user";

  const isAll = isSuperAdmin && requestedDataset === "all";

  try {
    const commercial =
      scope === "all" || scope === "commercial"
        ? await getCommercialMetrics(datasetId, isAll)
        : null;

    const personal =
      scope === "all" || scope === "personal"
        ? await getPersonalMetrics(datasetId, isAll)
        : null;

    return NextResponse.json({
      success: true,
      data: { commercial, personal },
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to calculate metrics";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
