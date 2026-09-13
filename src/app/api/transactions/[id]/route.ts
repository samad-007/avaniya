import { NextRequest, NextResponse } from "next/server";
import { updateTransaction, deleteTransaction } from "@/lib/dataStore";
import { getSessionFromRequest } from "@/lib/auth";

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

    if (updates.amount !== undefined) {
      const parsedAmount = parseFloat(updates.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json(
          { success: false, error: "Amount must be a positive number" },
          { status: 400 }
        );
      }
      updates.amount = Math.round(parsedAmount);
    }

    if (updates.borneBy !== undefined) {
      if (!["self", "seller", "buyer", "split"].includes(updates.borneBy)) {
        updates.borneBy = "self";
      }
    }
    if (updates.amountSelf !== undefined) {
      updates.amountSelf = Math.round(parseFloat(updates.amountSelf) || 0);
    }
    if (updates.amountSeller !== undefined) {
      updates.amountSeller = Math.round(parseFloat(updates.amountSeller) || 0);
    }
    if (updates.amountBuyer !== undefined) {
      updates.amountBuyer = Math.round(parseFloat(updates.amountBuyer) || 0);
    }

    const updated = await updateTransaction(id, updates, datasetId);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Transaction not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to update transaction";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const deleted = await deleteTransaction(id, datasetId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Transaction not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to delete transaction";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
