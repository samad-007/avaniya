import { NextRequest, NextResponse } from "next/server";
import { getCategories, addCategory } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const userId = session?.userId || "demo_businessman_1";
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") as "commercial" | "personal" | null;

  try {
    const categories = await getCategories(userId, scope || undefined);
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
  const userId = session?.userId || "demo_businessman_1";

  try {
    const body = await req.json();
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
