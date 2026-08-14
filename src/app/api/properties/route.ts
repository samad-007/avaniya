import { NextRequest, NextResponse } from "next/server";
import { getProperties, addProperty } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") as "commercial" | "personal" | null;
  const requestedDataset = searchParams.get("datasetId");

  // Super Admin can switch dataset or view all; regular users are locked to their own dataset
  const isSuperAdmin = session?.role === "super_admin";
  const datasetId = isSuperAdmin
    ? requestedDataset || session?.datasetId || "ds_yousuf_portfolio"
    : session?.datasetId || session?.userId || "fresh_user";

  const isAll = isSuperAdmin && requestedDataset === "all";

  try {
    const properties = await getProperties(datasetId, scope || undefined, isAll);
    return NextResponse.json({ success: true, data: properties });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const isSuperAdmin = session?.role === "super_admin";
  const body = await req.json();

  const datasetId = isSuperAdmin && body.datasetId
    ? body.datasetId
    : session?.datasetId || session?.userId || "fresh_user";
  const userId = session?.userId || "user_default";

  try {
    if (!body.name || body.agreedPurchasePrice === undefined) {
      return NextResponse.json(
        { success: false, error: "Property name and purchase price are required" },
        { status: 400 }
      );
    }

    const newProp = await addProperty(
      {
        type: body.type || "commercial",
        propertyCode: body.propertyCode,
        name: body.name,
        location: body.location || "",
        acquisitionDate: body.acquisitionDate || new Date().toISOString().split("T")[0],
        sqftArea: parseFloat(body.sqftArea) || 0,
        ratePerSqft: parseFloat(body.ratePerSqft) || 0,
        agreedPurchasePrice: parseFloat(body.agreedPurchasePrice) || 0,
        targetSalePrice: parseFloat(body.targetSalePrice) || 0,
        agreedSellingPrice: parseFloat(body.agreedSellingPrice) || 0,
        status: body.status || "open",
        notes: body.notes || "",
        milestones: body.milestones || [],
      },
      datasetId,
      userId
    );

    return NextResponse.json({ success: true, data: newProp });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
