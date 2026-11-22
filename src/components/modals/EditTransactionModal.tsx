"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Save,
  Trash2,
  Calendar,
  AlertTriangle,
  Link2,
  ExternalLink,
} from "lucide-react";
import {
  SeedTransaction,
  SeedProperty,
  SeedCategory,
  SeedLoan,
} from "@/lib/seedData";
import { formatINRCompact } from "@/lib/formatters";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: SeedTransaction | null;
  properties: SeedProperty[];
  loans?: SeedLoan[];
  categories: SeedCategory[];
  onSave: (
    transIdOrCode: string,
    updates: Partial<SeedTransaction>
  ) => Promise<void>;
  onDelete?: (transIdOrCode: string) => Promise<void>;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  properties,
  loans = [],
  categories,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<SeedTransaction>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date || new Date().toISOString().split("T")[0],
        scope: transaction.scope || "commercial",
        transactionType: transaction.transactionType || "outflow",
        propertyCode: transaction.propertyCode || "",
        subPlotNumber: transaction.subPlotNumber || "",
        attachmentUrl: transaction.attachmentUrl || "",
        loanId: transaction.loanId,
        loanCode: transaction.loanCode || "",
        category: transaction.category || "",
        mode: transaction.mode || "Bank",
        transferType: transaction.transferType,
        amount: transaction.amount || 0,
        borneBy: transaction.borneBy || "self",
        amountSelf:
          transaction.amountSelf !== undefined
            ? transaction.amountSelf
            : transaction.borneBy === "self" || !transaction.borneBy
            ? transaction.amount || 0
            : 0,
        amountSeller:
          transaction.amountSeller !== undefined
            ? transaction.amountSeller
            : transaction.borneBy === "seller"
            ? transaction.amount || 0
            : 0,
        amountBuyer:
          transaction.amountBuyer !== undefined
            ? transaction.amountBuyer
            : transaction.borneBy === "buyer"
            ? transaction.amount || 0
            : 0,
        recipientOrSource: transaction.recipientOrSource || "",
        remarks: transaction.remarks || "",
      });
      setErrorMsg("");
      setShowDeleteConfirm(false);
    }
  }, [transaction]);

  const selectedProp = useMemo(() => {
    if (!formData.propertyCode) return null;
    return (
      properties.find(
        (p) =>
          p.propertyCode.toLowerCase() ===
          (formData.propertyCode || "").toLowerCase()
      ) || null
    );
  }, [properties, formData.propertyCode]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((c) => {
      const scopeMatches =
        c.scope === "both" ||
        c.scope === formData.scope ||
        (!formData.scope && c.scope === "commercial");
      const typeMatches =
        formData.transactionType === "transfer"
          ? c.type === "transfer"
          : formData.transactionType === "profit_withdrawal"
          ? c.financialRole === "profit_withdrawal"
          : formData.transactionType === "capital_withdrawal"
          ? c.financialRole === "capital_withdrawal"
          : formData.transactionType === "loan_inflow"
          ? c.financialRole === "loan_principal_borrowed"
          : formData.transactionType === "loan_repayment"
          ? c.financialRole === "loan_principal_repaid"
          : formData.transactionType === "loan_interest"
          ? c.financialRole === "loan_interest_expense"
          : formData.transactionType === "loan_profit_share"
          ? c.financialRole === "loan_profit_distribution"
          : formData.transactionType === "deal_inflow" ||
            formData.transactionType === "capital_inflow"
          ? c.type === "inflow"
          : c.type === "outflow";
      return scopeMatches && typeMatches;
    });
  }, [categories, formData.scope, formData.transactionType]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category?.trim()) {
      setErrorMsg("Please select or enter a Category");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      setErrorMsg("Amount must be greater than ₹0");
      return;
    }

    if (
      formData.transactionType === "outflow" &&
      formData.borneBy === "split"
    ) {
      const self = formData.amountSelf || 0;
      const seller = formData.amountSeller || 0;
      const buyer = formData.amountBuyer || 0;
      if (self + seller + buyer !== formData.amount) {
        setErrorMsg(
          `Split amounts (₹${self + seller + buyer}) must equal total amount (₹${formData.amount})`
        );
        return;
      }
    }

    setErrorMsg("");
    setIsSaving(true);

    try {
      const transIdOrCode = transaction.id || transaction.transCode || "";
      const payload: Partial<SeedTransaction> = {
        ...formData,
        borneBy:
          formData.transactionType === "outflow"
            ? formData.borneBy || "self"
            : "self",
        amountSelf:
          formData.transactionType === "outflow"
            ? formData.borneBy === "split"
              ? formData.amountSelf || 0
              : formData.borneBy === "self"
              ? formData.amount || 0
              : 0
            : 0,
        amountSeller:
          formData.transactionType === "outflow"
            ? formData.borneBy === "split"
              ? formData.amountSeller || 0
              : formData.borneBy === "seller"
              ? formData.amount || 0
              : 0
            : 0,
        amountBuyer:
          formData.transactionType === "outflow"
            ? formData.borneBy === "split"
              ? formData.amountBuyer || 0
              : formData.borneBy === "buyer"
              ? formData.amount || 0
              : 0
            : 0,
      };
      await onSave(transIdOrCode, payload);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to update entry"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    setErrorMsg("");

    try {
      const transIdOrCode = transaction.id || transaction.transCode || "";
      await onDelete(transIdOrCode);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to delete entry"
      );
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
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-modal flex flex-col gap-4 my-auto max-h-[92vh] overflow-y-auto overflow-x-hidden animate-modal min-w-0"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
              {transaction.transCode ? transaction.transCode.slice(0, 3) : "TX"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                <span>Edit Entry</span>
                {transaction.transCode && (
                  <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex-shrink-0">
                    {transaction.transCode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update the amount, date, category, or notes for this entry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-sm">
          {/* Row 1: Portfolio & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">
                Portfolio
              </label>
              <select
                value={formData.scope || "commercial"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scope: e.target.value as "commercial" | "personal",
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0"
              >
                <option value="commercial">Business Deals</option>
                <option value="personal">Personal Homes</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">
                Entry Type
              </label>
              <select
                value={formData.transactionType || "outflow"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transactionType: e.target.value as
                      | "outflow"
                      | "deal_inflow"
                      | "capital_inflow"
                      | "transfer"
                      | "profit_withdrawal"
                      | "capital_withdrawal"
                      | "loan_inflow"
                      | "loan_repayment"
                      | "loan_interest"
                      | "loan_profit_share",
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0 truncate"
              >
                <option value="outflow">Payment Made (Expense)</option>
                <option value="deal_inflow">Buyer Sale Receipt</option>
                <option value="capital_inflow">Capital / Funds Added</option>
                <option value="loan_inflow">Loan Borrowed</option>
                <option value="loan_repayment">Loan Principal Repaid</option>
                <option value="loan_interest">Loan Interest Paid</option>
                <option value="loan_profit_share">Loan Profit Share Paid</option>
                <option value="profit_withdrawal">Profit Withdrawn</option>
                <option value="capital_withdrawal">Capital Refunded</option>
                <option value="transfer">Bank ↔ Cash Transfer</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">
                Amount (₹)
              </label>
              <input
                type="number"
                value={formData.amount ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm font-mono font-bold outline-none focus:bg-white focus:border-emerald-500 min-w-0"
                placeholder="e.g. 500000"
                required
              />
              <span className="text-xs text-emerald-700 font-mono font-semibold">
                {formData.amount ? formatINRCompact(formData.amount) : "₹ 0"}
              </span>
            </div>
          </div>

          {/* Row 3: Property / Loan & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.transactionType?.startsWith("loan_") ? (
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-slate-700">
                  Linked Loan
                </label>
                <select
                  value={formData.loanCode || ""}
                  onChange={(e) => {
                    const selectedCode = e.target.value;
                    const matched = loans.find(
                      (l) => l.loanCode === selectedCode
                    );
                    setFormData({
                      ...formData,
                      loanCode: selectedCode,
                      loanId: matched?.id,
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0 truncate"
                >
                  <option value="">(Unlinked Loan)</option>
                  {loans.map((l) => (
                    <option key={l.id} value={l.loanCode}>
                      {l.loanCode} : {l.lenderName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-slate-700">
                  Linked Property
                </label>
                <select
                  value={formData.propertyCode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyCode: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0 truncate"
                >
                  <option value="">(General Portfolio)</option>
                  {properties
                    .filter((p) => p.type === formData.scope)
                    .map((p) => (
                      <option key={p.id} value={p.propertyCode}>
                        {p.propertyCode} - {p.name}
                      </option>
                    ))}
                </select>

                {selectedProp?.subPlots && selectedProp.subPlots.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1 min-w-0">
                    <label className="text-[11px] font-semibold text-emerald-700">
                      Sub-Plot (Optional)
                    </label>
                    <select
                      value={formData.subPlotNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subPlotNumber: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs outline-none focus:border-emerald-500 cursor-pointer min-w-0 truncate"
                    >
                      <option value="">(Whole Property)</option>
                      {selectedProp.subPlots.map((sp) => (
                        <option key={sp.id} value={sp.plotNumber}>
                          Plot #{sp.plotNumber} (
                          {sp.sqftArea.toLocaleString("en-IN")} sqft -{" "}
                          {sp.status.toUpperCase()}
                          {sp.buyerName ? ` - ${sp.buyerName}` : ""})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">
                Category
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Select or type category..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0"
                required
              />
              <datalist id="category-suggestions">
                {filteredCategories.map((c, i) => (
                  <option key={i} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 4: Mode & Person/Transfer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">
                Payment Mode
              </label>
              <select
                value={formData.mode || "Bank"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mode: e.target.value as "Bank" | "Cash",
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0"
              >
                <option value="Bank">Bank / UPI / Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {formData.transactionType === "transfer" ? (
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-slate-700">
                  Transfer Direction
                </label>
                <select
                  value={formData.transferType || "Bank Withdrawal to Cash"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transferType: e.target.value as
                        | "Bank Withdrawal to Cash"
                        | "Cash Deposit to Bank",
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0 truncate"
                >
                  <option value="Bank Withdrawal to Cash">
                    Bank → Cash (Withdrawal)
                  </option>
                  <option value="Cash Deposit to Bank">
                    Cash → Bank (Deposit)
                  </option>
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-slate-700">
                  Person / Party
                </label>
                <input
                  type="text"
                  value={formData.recipientOrSource || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientOrSource: e.target.value,
                    })
                  }
                  placeholder="e.g. Seller, Lawyer, Buyer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0"
                />
              </div>
            )}
          </div>

          {/* Cost Allocation (Outflows) */}
          {formData.transactionType === "outflow" && (
            <div className="flex flex-col gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Who bears this cost?
                </label>
                <span className="text-[11px] text-slate-500">
                  {formData.borneBy === "self"
                    ? "Your own project expense"
                    : formData.borneBy === "seller"
                    ? "Deducted from seller balance"
                    : formData.borneBy === "buyer"
                    ? "Added to buyer bill"
                    : "Split between parties"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => {
                    const amt = formData.amount || 0;
                    setFormData({
                      ...formData,
                      borneBy: "self",
                      amountSelf: amt,
                      amountSeller: 0,
                      amountBuyer: 0,
                    });
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    (formData.borneBy || "self") === "self"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Myself
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const amt = formData.amount || 0;
                    setFormData({
                      ...formData,
                      borneBy: "seller",
                      amountSeller: amt,
                      amountSelf: 0,
                      amountBuyer: 0,
                    });
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    formData.borneBy === "seller"
                      ? "bg-amber-100 text-amber-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  For Seller
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const amt = formData.amount || 0;
                    setFormData({
                      ...formData,
                      borneBy: "buyer",
                      amountBuyer: amt,
                      amountSelf: 0,
                      amountSeller: 0,
                    });
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    formData.borneBy === "buyer"
                      ? "bg-blue-100 text-blue-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  For Buyer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const amt = formData.amount || 0;
                    const curSelf = formData.amountSelf || 0;
                    const curSeller = formData.amountSeller || 0;
                    const curBuyer = formData.amountBuyer || 0;
                    setFormData({
                      ...formData,
                      borneBy: "split",
                      amountSelf:
                        curSelf + curSeller + curBuyer === amt ? curSelf : amt,
                      amountSeller:
                        curSelf + curSeller + curBuyer === amt ? curSeller : 0,
                      amountBuyer:
                        curSelf + curSeller + curBuyer === amt ? curBuyer : 0,
                    });
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    formData.borneBy === "split"
                      ? "bg-violet-100 text-violet-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Split Cost
                </button>
              </div>

              {formData.borneBy === "split" && (
                <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-200/70">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        My Share (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.amountSelf || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amountSelf: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:border-violet-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-amber-700">
                        Seller Share (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.amountSeller || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amountSeller: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-amber-800 font-mono focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-blue-700">
                        Buyer Share (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.amountBuyer || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amountBuyer: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-800 font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-slate-700">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.remarks || ""}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="e.g. Advance paid, Cheque #004521"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0 resize-none"
            />
          </div>

          {/* Attachment URL */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Receipt / Proof Link (Optional)</span>
              </label>
              {formData.attachmentUrl && (
                <a
                  href={formData.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Link</span>
                </a>
              )}
            </div>
            <input
              type="url"
              value={formData.attachmentUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, attachmentUrl: e.target.value })
              }
              placeholder="https://drive.google.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:border-emerald-500 min-w-0"
            />
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Delete this entry permanently?</span>
              </div>
              <p className="text-xs text-rose-700 break-words">
                This will remove{" "}
                <strong className="font-mono">
                  {transaction.transCode || transaction.id}
                </strong>{" "}
                ({formData.amount ? formatINRCompact(formData.amount) : "₹ 0"})
                and recalculate your balances immediately.
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-action-secondary px-3 py-1.5 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100 mt-1 flex-wrap">
            {onDelete && !showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-action-secondary px-4 py-2 rounded-xl text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSaving ||
                  (formData.transactionType === "outflow" &&
                    formData.borneBy === "split" &&
                    (formData.amountSelf || 0) +
                      (formData.amountSeller || 0) +
                      (formData.amountBuyer || 0) !==
                      (formData.amount || 0))
                }
                className="btn-action-brand px-5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
