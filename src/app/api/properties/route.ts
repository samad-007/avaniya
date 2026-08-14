import { NextRequest, NextResponse } from "next/server";
import { getProperties, addProperty } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const userId = session?.userId || "demo_businessman_1";
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") as "commercial" | "personal" | null;

  try {
    const properties = await getProperties(userId, scope || undefined);
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
  const userId = session?.userId || "demo_businessman_1";

  try {
    const body = await req.json();
    if (!body.name || !body.agreedPurchasePrice === undefined) {
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
