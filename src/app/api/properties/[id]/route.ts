import { NextRequest, NextResponse } from "next/server";
import { getPropertyByCode, updateProperty, getTransactions } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getSessionFromRequest(req);
  const datasetId =
    session?.datasetId || session?.userId || "ds_yousuf_portfolio";

  try {
    const property = await getPropertyByCode(id, datasetId);
    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    const txs = await getTransactions(datasetId, { propertyCode: property.propertyCode });
    return NextResponse.json({ success: true, data: { property, transactions: txs } });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch property details";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const url = new URL(req.url);
  const queryDs = url.searchParams.get("datasetId");

  const datasetId =
    session.role === "super_admin" && queryDs
      ? queryDs
      : session.datasetId || session.userId || "ds_yousuf_portfolio";

  try {
    const updates = await req.json();
    const updated = await updateProperty(id, updates, datasetId);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Property not found or access denied" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to update property";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
