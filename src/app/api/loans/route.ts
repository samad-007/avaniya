import { NextRequest, NextResponse } from "next/server";
import { getLoans, addLoan } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") as "commercial" | "personal" | null;
  const requestedDataset = searchParams.get("datasetId");

  const isSuperAdmin = session?.role === "super_admin";
  const datasetId =
    isSuperAdmin && requestedDataset
      ? requestedDataset
      : session?.datasetId || session?.userId || "ds_yousuf_portfolio";

  const isAll = isSuperAdmin && requestedDataset === "all";

  try {
    const loans = await getLoans(datasetId, scope || undefined, isAll);
    return NextResponse.json({ success: true, data: loans });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch loans";
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
      { success: false, error: "Authentication required to create loans" },
      { status: 401 }
    );
  }

  const isSuperAdmin = session.role === "super_admin";
  const body = await req.json();

  const datasetId =
    isSuperAdmin && body.datasetId
      ? body.datasetId
      : session.datasetId || session.userId || "ds_yousuf_portfolio";
  const userId = session.userId || "user_default";

  try {
    const lenderName = body.lenderName ? String(body.lenderName).trim() : "";
    const principalAmount = parseFloat(body.principalAmount);

    if (!lenderName || isNaN(principalAmount) || principalAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid lender name and positive principal amount are required",
        },
        { status: 400 }
      );
    }

    const newLoan = await addLoan(
      {
        scope: body.scope === "personal" ? "personal" : "commercial",
        loanCode: body.loanCode ? String(body.loanCode).trim() : undefined,
        lenderName,
        lenderType: body.lenderType || "bank",
        principalAmount: Math.round(principalAmount),
        interestRatePct: Math.max(0, parseFloat(body.interestRatePct) || 0),
        profitSharePct: Math.max(0, parseFloat(body.profitSharePct) || 0),
        profitShareTerms: body.profitShareTerms
          ? String(body.profitShareTerms).trim()
          : "",
        startDate:
          body.startDate || new Date().toISOString().split("T")[0],
        endDate: body.endDate || undefined,
        tenureMonths: Math.max(1, parseInt(body.tenureMonths, 10) || 12),
        linkedPropertyCode: body.linkedPropertyCode
          ? String(body.linkedPropertyCode).trim()
          : "",
        status: body.status || "active",
        notes: body.notes ? String(body.notes).trim() : "",
      },
      datasetId,
      userId
    );

    return NextResponse.json({ success: true, data: newLoan });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to create loan facility";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
