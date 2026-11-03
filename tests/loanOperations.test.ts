import { describe, it, expect, beforeEach } from "vitest";
import {
  addLoan,
  updateLoan,
  deleteLoan,
  getLoans,
  getLoanByCode,
} from "../src/lib/dataStore";

describe("Loan Operations & Lifecycle", () => {
  const testDataset = "ds_test_loan_lifecycle";

  beforeEach(() => {
    delete process.env.MONGODB_URI;
  });

  it("creates a new loan facility with a custom loanCode in offline / memory mode", async () => {
    const loan = await addLoan(
      {
        scope: "commercial",
        loanCode: "CUSTOM-LOAN-999",
        lenderName: "Friendly Financier",
        lenderType: "family_friend",
        principalAmount: 250000,
        interestRatePct: 0,
        profitSharePct: 15,
        profitShareTerms: "15% on net profit",
        startDate: "2026-03-01",
        tenureMonths: 12,
        status: "active",
        notes: "Mutual fund withdrawal",
      },
      testDataset
    );

    expect(loan).toBeDefined();
    expect(loan.id).toBeDefined();
    expect(loan.loanCode).toBe("CUSTOM-LOAN-999");
    expect(loan.principalAmount).toBe(250000);
    expect(loan.notes).toBe("Mutual fund withdrawal");

    const found = await getLoanByCode("CUSTOM-LOAN-999", testDataset);
    expect(found).not.toBeNull();
    expect(found?.lenderName).toBe("Friendly Financier");
  });

  it("updates an existing loan with case-insensitive loanCode matching", async () => {
    const created = await addLoan(
      {
        scope: "commercial",
        loanCode: "LOAN-CASE-TEST",
        lenderName: "HDFC Facility",
        lenderType: "bank",
        principalAmount: 500000,
        interestRatePct: 10.5,
        startDate: "2026-01-15",
        status: "active",
      },
      testDataset
    );

    // Update using lowercase version of loanCode
    const updated = await updateLoan(
      "loan-case-test",
      {
        principalAmount: 450000,
        notes: "Updated interest terms",
      },
      testDataset
    );

    expect(updated).not.toBeNull();
    expect(updated?.principalAmount).toBe(450000);
    expect(updated?.notes).toBe("Updated interest terms");
  });

  it("updates an existing loan by id even if id field is included in updates", async () => {
    const created = await addLoan(
      {
        scope: "commercial",
        loanCode: "LOAN-ID-TEST",
        lenderName: "Private Financier",
        lenderType: "private_financier",
        principalAmount: 1000000,
        startDate: "2026-02-01",
        status: "active",
      },
      testDataset
    );

    const updated = await updateLoan(
      created.id,
      {
        id: created.id, // Ensure having id in updates does not corrupt memory/database update
        lenderName: "Renamed Financier",
      },
      testDataset
    );

    expect(updated).not.toBeNull();
    expect(updated?.lenderName).toBe("Renamed Financier");
  });

  it("deletes a loan facility by loanCode case-insensitively and removes from dataset", async () => {
    const created = await addLoan(
      {
        scope: "commercial",
        loanCode: "LOAN-DELETE-TEST",
        lenderName: "To Delete",
        lenderType: "other",
        principalAmount: 100000,
        startDate: "2026-03-01",
        status: "active",
      },
      testDataset
    );

    const deleted = await deleteLoan("loan-delete-test", testDataset);
    expect(deleted).toBe(true);

    const check = await getLoanByCode("LOAN-DELETE-TEST", testDataset);
    expect(check).toBeNull();
  });
});
