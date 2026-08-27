import { NextRequest, NextResponse } from "next/server";
import { updateLoan, deleteLoan } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentication required to update loans" },
      { status: 401 }
    );
  }

  const resolvedParams = await params;
  const loanIdOrCode = decodeURIComponent(resolvedParams.id);
  const { searchParams } = new URL(req.url);
  const requestedDataset = searchParams.get("datasetId");

  const isSuperAdmin = session.role === "super_admin";
  const datasetId =
    isSuperAdmin && requestedDataset
      ? requestedDataset
      : session.datasetId || session.userId || "ds_yousuf_portfolio";

  try {
    const updates = await req.json();
    const updated = await updateLoan(loanIdOrCode, updates, datasetId);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Loan agreement not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to update loan";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentication required to delete loans" },
      { status: 401 }
    );
  }

  const resolvedParams = await params;
  const loanIdOrCode = decodeURIComponent(resolvedParams.id);
  const { searchParams } = new URL(req.url);
  const requestedDataset = searchParams.get("datasetId");

  const isSuperAdmin = session.role === "super_admin";
  const datasetId =
    isSuperAdmin && requestedDataset
      ? requestedDataset
      : session.datasetId || session.userId || "ds_yousuf_portfolio";

  try {
    const deleted = await deleteLoan(loanIdOrCode, datasetId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Loan agreement not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Loan facility removed successfully",
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to delete loan";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
