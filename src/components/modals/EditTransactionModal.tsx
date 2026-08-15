"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Save, Trash2, Calendar, AlertTriangle, ArrowRightLeft, DollarSign } from "lucide-react";
import { SeedTransaction, SeedProperty, SeedCategory } from "@/lib/seedData";
import { formatINRCompact } from "@/lib/formatters";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: SeedTransaction | null;
  properties: SeedProperty[];
  categories: SeedCategory[];
  onSave: (transIdOrCode: string, updates: Partial<SeedTransaction>) => Promise<void>;
  onDelete?: (transIdOrCode: string) => Promise<void>;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  properties,
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
        category: transaction.category || "",
        mode: transaction.mode || "Bank",
        transferType: transaction.transferType,
        amount: transaction.amount || 0,
        recipientOrSource: transaction.recipientOrSource || "",
        remarks: transaction.remarks || "",
      });
      setErrorMsg("");
      setShowDeleteConfirm(false);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const scopeMatches =
        c.scope === "both" ||
        c.scope === formData.scope ||
        (!formData.scope && c.scope === "commercial");
      const typeMatches =
        formData.transactionType === "transfer"
          ? c.type === "transfer"
          : formData.transactionType === "deal_inflow" ||
            formData.transactionType === "capital_inflow"
          ? c.type === "inflow"
          : c.type === "outflow";
      return scopeMatches && typeMatches;
    });
  }, [categories, formData.scope, formData.transactionType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category?.trim()) {
      setErrorMsg("Please select or enter a Category");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      setErrorMsg("Amount must be a positive number greater than ₹0");
      return;
    }

    setErrorMsg("");
    setIsSaving(true);

    try {
      const transIdOrCode = transaction.id || transaction.transCode || "";
      await onSave(transIdOrCode, formData);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to update transaction"
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
        err instanceof Error ? err.message : "Failed to delete transaction"
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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-xl w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto max-h-[92vh] overflow-y-auto animate-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#161616] border border-[#333333] text-white flex items-center justify-center font-mono font-bold text-xs">
              {transaction.transCode ? transaction.transCode.slice(0, 3) : "TX"}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Edit Transaction</span>
                {transaction.transCode && (
                  <span className="text-xs font-mono font-semibold text-[#A1A1AA] bg-[#161616] border border-[#262626] px-2 py-0.5 rounded">
                    {transaction.transCode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#A1A1AA] font-medium">
                Correct financial amounts, categories, modes, and dates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white p-1 rounded-md transition-all duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs px-3.5 py-2 rounded-md font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-sm">
          {/* Row 1: Scope & Transaction Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Portfolio Scope
              </label>
              <select
                value={formData.scope || "commercial"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scope: e.target.value as "commercial" | "personal",
                  })
                }
                className="bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
              >
                <option value="commercial">Commercial Land Business</option>
                <option value="personal">Personal Asset Investment</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Transaction Type
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
                      | "transfer",
                  })
                }
                className="bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
              >
                <option value="outflow">Property Outflow / Expense</option>
                <option value="deal_inflow">Property Sale Receipt</option>
                <option value="capital_inflow">External Capital Inflow</option>
                <option value="transfer">Internal Bank / Cash Transfer</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Transaction Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Amount (₹ INR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm font-mono font-bold outline-none focus:border-[#555555]"
                  placeholder="e.g. 500000"
                  required
                />
              </div>
              <span className="text-xs text-[#22C55E] font-mono font-semibold">
                {formData.amount ? formatINRCompact(formData.amount) : "₹ 0"}
              </span>
            </div>
          </div>

          {/* Row 3: Linked Property & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Linked Property
              </label>
              <select
                value={formData.propertyCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, propertyCode: e.target.value })
                }
                className="bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
              >
                <option value="">(None / General Liquidity)</option>
                {properties
                  .filter((p) => p.type === formData.scope)
                  .map((p) => (
                    <option key={p.id} value={p.propertyCode}>
                      {p.propertyCode} - {p.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Category
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Select or enter category..."
                className="bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
                required
              />
              <datalist id="category-suggestions">
                {filteredCategories.map((c, i) => (
                  <option key={i} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 4: Mode & Transfer Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
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
                className="bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
              >
                <option value="Bank">Bank Account (NEFT / RTGS / Cheque)</option>
                <option value="Cash">Cash in Hand</option>
              </select>
            </div>

            {formData.transactionType === "transfer" ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
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
                  className="bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
                >
                  <option value="Bank Withdrawal to Cash">
                    Bank Withdrawal to Cash (-Bank / +Cash)
                  </option>
                  <option value="Cash Deposit to Bank">
                    Cash Deposit to Bank (-Cash / +Bank)
                  </option>
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                  Beneficiary / Source Name
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
                  placeholder="e.g. Land Owner, Advocate, Contractor"
                  className="bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
                />
              </div>
            )}
          </div>

          {/* Row 5: Remarks / Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Remarks &amp; Audit Notes
            </label>
            <textarea
              rows={2}
              value={formData.remarks || ""}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="e.g. Advance paid against survey no. 442/1B, Cheque #004521"
              className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
            />
          </div>

          {/* Delete Confirmation Alert */}
          {showDeleteConfirm && (
            <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-lg flex flex-col gap-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Confirm Permanent Deletion?</span>
              </div>
              <p className="text-xs text-rose-200/80">
                This will remove transaction{" "}
                <strong className="text-white font-mono">{transaction.transCode || transaction.id}</strong> (
                {formData.amount ? formatINRCompact(formData.amount) : "₹ 0"}) and immediately recalculate portfolio liquidity.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Transaction"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[#262626] mt-1">
            {onDelete && !showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg text-[#71717A] hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-all duration-150 flex items-center gap-1.5 text-xs font-medium"
                title="Delete this transaction"
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
                className="px-4 py-2 rounded-lg bg-[#141414] text-white text-xs sm:text-sm font-medium border border-[#282828] hover:bg-[#202020] transition-all duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-action-primary px-5 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Transaction"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
