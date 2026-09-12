"use client";

import React, { useState, useEffect } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import { SeedLoan, SeedProperty } from "@/lib/seedData";
import { X, Landmark, Users, HandCoins, Building, Trash2 } from "lucide-react";

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan?: SeedLoan | null;
  properties?: SeedProperty[];
  defaultScope?: "commercial" | "personal";
  onSave: (
    loanData: Omit<SeedLoan, "id" | "loanCode"> & {
      id?: string;
      loanCode?: string;
    }
  ) => Promise<void>;
  onDelete?: (loanIdOrCode: string) => Promise<void>;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  loan,
  properties = [],
  defaultScope = "commercial",
  onSave,
  onDelete,
}) => {
  const isEditing = !!loan;

  const [scope, setScope] = useState<"commercial" | "personal">(
    loan?.scope || defaultScope
  );
  const [loanCode, setLoanCode] = useState(loan?.loanCode || "");
  const [lenderName, setLenderName] = useState(loan?.lenderName || "");
  const [lenderType, setLenderType] = useState<
    "bank" | "family_friend" | "private_financier" | "other"
  >(loan?.lenderType || "bank");
  const [principalAmount, setPrincipalAmount] = useState<number>(
    loan?.principalAmount || 0
  );
  const [interestRatePct, setInterestRatePct] = useState<number | "">(
    loan?.interestRatePct ?? ""
  );
  const [profitSharePct, setProfitSharePct] = useState<number | "">(
    loan?.profitSharePct ?? ""
  );
  const [profitShareTerms, setProfitShareTerms] = useState(
    loan?.profitShareTerms || ""
  );
  const [startDate, setStartDate] = useState(
    loan?.startDate || new Date().toISOString().split("T")[0]
  );
  const [tenureMonths, setTenureMonths] = useState<number | "">(
    loan?.tenureMonths || 12
  );
  const [linkedPropertyCode, setLinkedPropertyCode] = useState(
    loan?.linkedPropertyCode || ""
  );
  const [status, setStatus] = useState<"active" | "closed" | "defaulted">(
    loan?.status || "active"
  );
  const [notes, setNotes] = useState(loan?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (loan) {
      setScope(loan.scope);
      setLoanCode(loan.loanCode);
      setLenderName(loan.lenderName);
      setLenderType(loan.lenderType);
      setPrincipalAmount(loan.principalAmount);
      setInterestRatePct(loan.interestRatePct ?? "");
      setProfitSharePct(loan.profitSharePct ?? "");
      setProfitShareTerms(loan.profitShareTerms || "");
      setStartDate(loan.startDate);
      setTenureMonths(loan.tenureMonths || 12);
      setLinkedPropertyCode(loan.linkedPropertyCode || "");
      setStatus(loan.status);
      setNotes(loan.notes || "");
    } else {
      setScope(defaultScope);
      setLoanCode("");
      setLenderName("");
      setLenderType("bank");
      setPrincipalAmount(0);
      setInterestRatePct("");
      setProfitSharePct("");
      setProfitShareTerms("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setTenureMonths(12);
      setLinkedPropertyCode("");
      setStatus("active");
      setNotes("");
    }
    setShowDeleteConfirm(false);
  }, [loan, defaultScope, isOpen]);

  if (!isOpen) return null;

  const handleIncrementAmount = (addition: number) => {
    setPrincipalAmount((prev) => Math.max(0, (Number(prev) || 0) + addition));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lenderName || principalAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: loan?.id,
        loanCode: loanCode.trim() || undefined,
        scope,
        lenderName: lenderName.trim(),
        lenderType,
        principalAmount: Math.round(principalAmount),
        interestRatePct:
          interestRatePct === "" ? 0 : Math.max(0, Number(interestRatePct)),
        profitSharePct:
          profitSharePct === "" ? 0 : Math.max(0, Number(profitSharePct)),
        profitShareTerms: profitShareTerms.trim(),
        startDate,
        tenureMonths: tenureMonths === "" ? 12 : Number(tenureMonths),
        linkedPropertyCode: linkedPropertyCode.trim() || undefined,
        status,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error("Failed to save loan", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!loan || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(loan.loanCode || loan.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete loan", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full max-w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 shadow-2xl my-auto flex flex-col gap-4 sm:gap-5 animate-modal min-w-0"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#262626] pb-3.5 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <HandCoins className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight break-words">
              {isEditing ? `Edit Loan (${loan.loanCode})` : "+ Add New Loan / Borrowing Facility"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {/* Lender Type Selector */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Lender Category / Financing Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setLenderType("bank")}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-w-0 ${
                  lenderType === "bank"
                    ? "bg-[#262626] text-white border-white font-bold"
                    : "bg-[#111111] text-[#A1A1AA] border-[#262626] hover:text-white"
                }`}
              >
                <Landmark className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Bank / NBFC</span>
              </button>

              <button
                type="button"
                onClick={() => setLenderType("family_friend")}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-w-0 ${
                  lenderType === "family_friend"
                    ? "bg-[#262626] text-white border-white font-bold"
                    : "bg-[#111111] text-[#A1A1AA] border-[#262626] hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Family / Friend</span>
              </button>

              <button
                type="button"
                onClick={() => setLenderType("private_financier")}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-w-0 ${
                  lenderType === "private_financier"
                    ? "bg-[#262626] text-white border-white font-bold"
                    : "bg-[#111111] text-[#A1A1AA] border-[#262626] hover:text-white"
                }`}
              >
                <HandCoins className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Financier</span>
              </button>

              <button
                type="button"
                onClick={() => setLenderType("other")}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-w-0 ${
                  lenderType === "other"
                    ? "bg-[#262626] text-white border-white font-bold"
                    : "bg-[#111111] text-[#A1A1AA] border-[#262626] hover:text-white"
                }`}
              >
                <span className="truncate">Other Debt</span>
              </button>
            </div>
          </div>

          {/* Lender Name & Custom Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2 flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Lender / Financier Name
              </label>
              <input
                type="text"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                placeholder="e.g. HDFC Bank, Farooq Bhai, Private Financier"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Loan Code
              </label>
              <input
                type="text"
                value={loanCode}
                onChange={(e) => setLoanCode(e.target.value)}
                placeholder="LOAN-001"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white font-mono text-sm outline-none focus:border-[#555555] min-w-0"
              />
            </div>
          </div>

          {/* Sanctioned Principal Amount & Quick Increment Chips */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Sanctioned Loan Principal (₹ INR)
            </label>
            <input
              type="number"
              value={principalAmount || ""}
              onChange={(e) =>
                setPrincipalAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-xl font-mono font-bold text-white outline-none focus:border-[#555555]"
              required
            />
            {/* Live Indian Verbal Summary */}
            <div className="text-xs font-mono text-[#F59E0B] font-medium">
              {amountToVerbalSummary(principalAmount)}
            </div>

            {/* Quick Preset Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {[500000, 1000000, 2500000, 5000000, 10000000].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleIncrementAmount(chip)}
                  className="px-2 py-1 rounded-md bg-[#161616] hover:bg-[#222222] border border-[#2a2a2a] text-[11px] font-mono text-[#D4D4D8] transition-all"
                >
                  +{chip >= 10000000 ? `${chip / 10000000}Cr` : `${chip / 100000}L`}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate & Profit Share Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#050505] p-3.5 rounded-lg border border-[#222222] min-w-0">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRatePct}
                onChange={(e) =>
                  setInterestRatePct(
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
                }
                placeholder="e.g. 10.5"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white font-mono text-sm outline-none focus:border-[#555555] min-w-0"
              />
              <span className="text-[11px] text-[#71717A]">
                Annual bank or lender interest rate
              </span>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider">
                Profit Share (% On Gain)
              </label>
              <input
                type="number"
                step="0.5"
                value={profitSharePct}
                onChange={(e) =>
                  setProfitSharePct(
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
                }
                placeholder="e.g. 15"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white font-mono text-sm outline-none focus:border-[#555555] min-w-0"
              />
              <span className="text-[11px] text-[#71717A]">
                For partner/friendly debt structures
              </span>
            </div>

            {/* Profit Share Terms Clause */}
            <div className="sm:col-span-2 flex flex-col gap-1.5 pt-1 border-t border-[#1a1a1a] min-w-0">
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Profit Share Terms &amp; Conditions (Optional)
              </label>
              <input
                type="text"
                value={profitShareTerms}
                onChange={(e) => setProfitShareTerms(e.target.value)}
                placeholder="e.g. 15% net profit share upon sale exit of Kalaimal Nagar"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2 text-white text-xs outline-none focus:border-[#555555] min-w-0"
              />
            </div>
          </div>

          {/* Start Date, Tenure & Linked Property */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Tenure (Months)
              </label>
              <input
                type="number"
                value={tenureMonths}
                onChange={(e) =>
                  setTenureMonths(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10)
                  )
                }
                placeholder="12"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white font-mono text-sm outline-none focus:border-[#555555] min-w-0"
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Linked Land Deal
              </label>
              <select
                value={linkedPropertyCode}
                onChange={(e) => setLinkedPropertyCode(e.target.value)}
                className="w-full max-w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0 truncate"
              >
                <option value="">General Portfolio Debt</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.propertyCode}>
                    {p.propertyCode} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Loan Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "active" | "closed" | "defaulted"
                )
              }
              className="w-full max-w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0 truncate"
            >
              <option value="active">Active Facility (Outstanding Principal)</option>
              <option value="closed">Closed / Fully Repaid</option>
              <option value="defaulted">Defaulted / Disputed</option>
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Notes &amp; Banking Details
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Disbursed via cheque to current account, EMI on 5th of each month..."
              rows={2}
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555] resize-none min-w-0"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-2.5 border-t border-[#262626] flex-wrap">
            {isEditing && onDelete ? (
              <div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2.5 rounded-lg bg-rose-950/30 text-rose-400 border border-rose-900/40 hover:bg-rose-900/40 transition-colors"
                    title="Delete Loan Facility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-2 rounded-lg bg-[#161616] text-[#A1A1AA] text-xs font-medium hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg bg-[#161616] text-white border border-[#2a2a2a] text-xs sm:text-sm font-medium hover:bg-[#222222] transition-all duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-action-primary px-5 py-2.5 rounded-lg text-xs sm:text-sm disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Create Loan Facility"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
