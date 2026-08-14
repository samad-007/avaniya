import { NextRequest, NextResponse } from "next/server";
import { getProperties, addProperty } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") as "commercial" | "personal" | null;
  const requestedDataset = searchParams.get("datasetId");

  const isSuperAdmin = session?.role === "super_admin";
  const datasetId = isSuperAdmin && requestedDataset
    ? requestedDataset
    : session?.datasetId || session?.userId || "ds_yousuf_portfolio";

  const isAll = isSuperAdmin && requestedDataset === "all";

  try {
    const properties = await getProperties(datasetId, scope || undefined, isAll);
    return NextResponse.json({ success: true, data: properties });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch properties";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentication required to create properties" },
      { status: 401 }
    );
  }

  const isSuperAdmin = session.role === "super_admin";
  const body = await req.json();

  const datasetId = isSuperAdmin && body.datasetId
    ? body.datasetId
    : session.datasetId || session.userId || "ds_yousuf_portfolio";
  const userId = session.userId || "user_default";

  try {
    const trimmedName = body.name ? String(body.name).trim() : "";
    const purchasePrice = parseFloat(body.agreedPurchasePrice);

    if (!trimmedName || isNaN(purchasePrice) || purchasePrice < 0) {
      return NextResponse.json(
        { success: false, error: "Valid property name and non-negative purchase price are required" },
        { status: 400 }
      );
    }

    const newProp = await addProperty(
      {
        type: body.type === "personal" ? "personal" : "commercial",
        propertyCode: body.propertyCode ? String(body.propertyCode).trim() : undefined,
        name: trimmedName,
        location: body.location ? String(body.location).trim() : "",
        acquisitionDate: body.acquisitionDate || new Date().toISOString().split("T")[0],
        sqftArea: Math.max(0, parseFloat(body.sqftArea) || 0),
        ratePerSqft: Math.max(0, parseFloat(body.ratePerSqft) || 0),
        agreedPurchasePrice: Math.round(purchasePrice),
        targetSalePrice: Math.max(0, Math.round(parseFloat(body.targetSalePrice) || 0)),
        agreedSellingPrice: Math.max(0, Math.round(parseFloat(body.agreedSellingPrice) || 0)),
        status: body.status || "open",
        notes: body.notes ? String(body.notes).trim() : "",
        milestones: Array.isArray(body.milestones) ? body.milestones : [],
      },
      datasetId,
      userId
    );

    return NextResponse.json({ success: true, data: newProp });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to create property";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
