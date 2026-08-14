import { NextRequest, NextResponse } from "next/server";
import { getCategories, addCategory } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") as "commercial" | "personal" | null;
  const requestedDataset = searchParams.get("datasetId");

  const isSuperAdmin = session?.role === "super_admin";
  const datasetId = isSuperAdmin
    ? requestedDataset || session?.datasetId || "ds_yousuf_portfolio"
    : session?.datasetId || session?.userId || "fresh_user";

  const isAll = isSuperAdmin && requestedDataset === "all";

  try {
    const categories = await getCategories(datasetId, scope || undefined, isAll);
    return NextResponse.json({ success: true, data: categories });
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
    if (!body.name || !body.financialRole) {
      return NextResponse.json(
        {
          success: false,
          error: "Category Name and Financial Role mapping are required",
        },
        { status: 400 }
      );
    }

    const cat = await addCategory(
      {
        name: body.name,
        scope: body.scope || "both",
        type: body.type || "outflow",
        financialRole: body.financialRole,
      },
      datasetId,
      userId
    );

    return NextResponse.json({ success: true, data: cat });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
