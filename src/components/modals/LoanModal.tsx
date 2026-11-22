"use client";

import React, { useState, useEffect } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import { SeedLoan, SeedProperty } from "@/lib/seedData";
import { X, Landmark, Users, HandCoins, Trash2 } from "lucide-react";

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
      await onDelete(loan.id || loan.loanCode);
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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-md-surface-lowest dark:bg-md-surface-low rounded-[28px] max-w-lg w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6 shadow-m3-3 my-auto flex flex-col gap-5 animate-modal min-w-0"
      >
        <div className="flex items-start justify-between pb-4 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-[14px] bg-md-primary-container text-md-on-primary-container flex items-center justify-center flex-shrink-0">
              <HandCoins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-bold text-md-on-surface tracking-tight break-words">
                {isEditing ? `Edit Loan (${loan.loanCode})` : "Add a Loan"}
              </h2>
              <p className="text-xs text-md-on-surface-variant">
                Track money borrowed from a bank, friend, or financier.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface-variant">
              Who are you borrowing from?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: "bank", label: "Bank / NBFC", icon: Landmark },
                  { id: "family_friend", label: "Family / Friend", icon: Users },
                  {
                    id: "private_financier",
                    label: "Financier",
                    icon: HandCoins,
                  },
                  { id: "other", label: "Other", icon: null },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const active = lenderType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLenderType(item.id)}
                    className={`py-2 px-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-w-0 ${ active ? "bg-md-primary text-md-on-primary  shadow-m3-1" : "bg-md-surface-low text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container" }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2 flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Lender Name
              </label>
              <input
                type="text"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                placeholder="e.g. HDFC Bank, Ramesh Uncle"
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant/60 text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary focus:ring-2 focus:ring-md-primary/20 min-w-0"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Short Code
              </label>
              <input
                type="text"
                value={loanCode}
                onChange={(e) => setLoanCode(e.target.value)}
                placeholder="Auto"
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant/60 font-mono text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface-variant">
              Total Loan Amount (₹)
            </label>
            <input
              type="number"
              value={principalAmount || ""}
              onChange={(e) =>
                setPrincipalAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-3 text-xl font-mono font-bold text-md-on-surface outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary focus:ring-2 focus:ring-md-primary/20"
              required
            />
            <div className="text-xs font-mono text-md-on-warning-container bg-md-warning-container rounded-xl px-3 py-1.5 font-semibold">
              {amountToVerbalSummary(principalAmount)}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {[500000, 1000000, 2500000, 5000000, 10000000].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleIncrementAmount(chip)}
                  className="px-3 py-1 rounded-full bg-md-surface-container hover:bg-md-surface-high text-xs font-mono font-semibold text-md-on-surface transition-colors"
                >
                  +
                  {chip >= 10000000
                    ? `${chip / 10000000} Cr`
                    : `${chip / 100000} L`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-md-surface-low p-4 rounded-[20px] min-w-0">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Interest Rate (% per year)
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
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface font-mono text-sm outline-none focus:ring-2 focus:ring-md-primary min-w-0"
              />
              <span className="text-[11px] text-md-on-surface-variant">
                Leave blank if interest-free
              </span>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-primary">
                Profit Share (% of gain)
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
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface font-mono text-sm outline-none focus:ring-2 focus:ring-md-primary min-w-0"
              />
              <span className="text-[11px] text-md-on-surface-variant">
                Optional, for partner loans
              </span>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5 pt-2 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Profit Share Terms (Optional)
              </label>
              <input
                type="text"
                value={profitShareTerms}
                onChange={(e) => setProfitShareTerms(e.target.value)}
                placeholder="e.g. 15% of net profit when plot is sold"
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface text-xs outline-none focus:ring-2 focus:ring-md-primary min-w-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Duration (Months)
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
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface font-mono text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Linked Property
              </label>
              <select
                value={linkedPropertyCode}
                onChange={(e) => setLinkedPropertyCode(e.target.value)}
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0 truncate"
              >
                <option value="">General Portfolio</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.propertyCode}>
                    {p.propertyCode} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface-variant">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "active" | "closed" | "defaulted")
              }
              className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0 truncate"
            >
              <option value="active">Active (Still Repaying)</option>
              <option value="closed">Closed (Fully Repaid)</option>
              <option value="defaulted">Overdue / Disputed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface-variant">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. EMI due on 5th of every month..."
              rows={2}
              className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-2xl p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant/60 text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary resize-none min-w-0"
            />
          </div>

          <div className="flex items-center justify-between gap-2.5 pt-3 flex-wrap">
            {isEditing && onDelete ? (
              <div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2.5 rounded-full bg-md-error-container text-md-on-error-container hover:brightness-95 transition-all"
                    title="Delete loan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 rounded-full bg-md-error text-md-on-error text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="m3-btn-outlined px-3 py-2 text-xs"
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
                className="m3-btn-outlined px-4 py-2.5 text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="m3-btn-filled px-5 py-2.5 text-xs sm:text-sm disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Save Loan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
