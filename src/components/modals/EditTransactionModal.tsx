"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Save, Trash2, Calendar, AlertTriangle, ArrowRightLeft, DollarSign, Link2, ExternalLink } from "lucide-react";
import { SeedTransaction, SeedProperty, SeedCategory, SeedLoan } from "@/lib/seedData";
import { formatINRCompact } from "@/lib/formatters";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: SeedTransaction | null;
  properties: SeedProperty[];
  loans?: SeedLoan[];
  categories: SeedCategory[];
  onSave: (transIdOrCode: string, updates: Partial<SeedTransaction>) => Promise<void>;
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
      setErrorMsg("Amount must be a positive number greater than ₹0");
      return;
    }

    if (formData.transactionType === "outflow" && formData.borneBy === "split") {
      const self = formData.amountSelf || 0;
      const seller = formData.amountSeller || 0;
      const buyer = formData.amountBuyer || 0;
      if (self + seller + buyer !== formData.amount) {
        setErrorMsg(
          `Split amounts (Self: ₹${self}, Seller: ₹${seller}, Buyer: ₹${buyer}) must equal total amount (₹${formData.amount})`
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
        borneBy: formData.transactionType === "outflow" ? formData.borneBy || "self" : "self",
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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-xl w-full max-w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto max-h-[92vh] overflow-y-auto overflow-x-hidden animate-modal min-w-0"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#262626] gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-[#161616] border border-[#333333] text-white flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
              {transaction.transCode ? transaction.transCode.slice(0, 3) : "TX"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span className="break-words">Edit Transaction</span>
                {transaction.transCode && (
                  <span className="text-xs font-mono font-semibold text-[#A1A1AA] bg-[#161616] border border-[#262626] px-2 py-0.5 rounded flex-shrink-0">
                    {transaction.transCode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#A1A1AA] font-medium break-words mt-0.5">
                Correct financial amounts, categories, modes, and dates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white p-1 rounded-md transition-all duration-150 flex-shrink-0"
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
            <div className="flex flex-col gap-1.5 min-w-0">
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
                className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0"
              >
                <option value="commercial">Commercial Land Business</option>
                <option value="personal">Personal Asset Investment</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
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
                      | "transfer"
                      | "profit_withdrawal"
                      | "capital_withdrawal"
                      | "loan_inflow"
                      | "loan_repayment"
                      | "loan_interest"
                      | "loan_profit_share",
                  })
                }
                className="w-full max-w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0 truncate"
              >
                <option value="outflow">Property Outflow / Expense</option>
                <option value="deal_inflow">Property Sale Receipt</option>
                <option value="capital_inflow">External Capital Inflow</option>
                <option value="loan_inflow">Loan Borrowing Inflow (+ Liquidity)</option>
                <option value="loan_repayment">Loan Principal Repaid (- Liquidity)</option>
                <option value="loan_interest">Loan Interest Paid (- Finance Expense)</option>
                <option value="loan_profit_share">Loan Profit Share Paid (- Profit Bonus)</option>
                <option value="profit_withdrawal">Profit Drawing / Business Draw</option>
                <option value="capital_withdrawal">Investment Capital Refund</option>
                <option value="transfer">Internal Bank / Cash Transfer</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 min-w-0">
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
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
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
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm font-mono font-bold outline-none focus:border-[#555555] min-w-0"
                  placeholder="e.g. 500000"
                  required
                />
              </div>
              <span className="text-xs text-[#22C55E] font-mono font-semibold">
                {formData.amount ? formatINRCompact(formData.amount) : "₹ 0"}
              </span>
            </div>
          </div>

          {/* Row 3: Linked Property / Loan & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.transactionType?.startsWith("loan_") ? (
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                  Linked Loan Agreement
                </label>
                <select
                  value={formData.loanCode || ""}
                  onChange={(e) => {
                    const selectedCode = e.target.value;
                    const matched = loans.find((l) => l.loanCode === selectedCode);
                    setFormData({
                      ...formData,
                      loanCode: selectedCode,
                      loanId: matched?.id,
                    });
                  }}
                  className="w-full max-w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-emerald-500 min-w-0 truncate"
                >
                  <option value="">(None / Unlinked Debt)</option>
                  {loans.map((l) => (
                    <option key={l.id} value={l.loanCode}>
                      {l.loanCode} : {l.lenderName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                  Linked Property
                </label>
                <select
                  value={formData.propertyCode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyCode: e.target.value })
                  }
                  className="w-full max-w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0 truncate"
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

                {/* Sub-Plot Dropdown (if land deal has sub-plots) */}
                {selectedProp?.subPlots && selectedProp.subPlots.length > 0 && (
                  <div className="flex flex-col gap-1 mt-2 min-w-0">
                    <label className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Tag to Sub-Plot
                    </label>
                    <select
                      value={formData.subPlotNumber || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, subPlotNumber: e.target.value })
                      }
                      className="w-full max-w-full bg-[#161616] border border-[#333333] rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-emerald-500 cursor-pointer min-w-0 truncate"
                    >
                      <option value="">(None / Deal Level)</option>
                      {selectedProp.subPlots.map((sp) => (
                        <option key={sp.id} value={sp.plotNumber}>
                          Plot #{sp.plotNumber} ({sp.sqftArea.toLocaleString("en-IN")} sqft - {sp.status.toUpperCase()}{sp.buyerName ? ` - ${sp.buyerName}` : ""})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5 min-w-0">
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
                className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0"
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
            <div className="flex flex-col gap-1.5 min-w-0">
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
                className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0"
              >
                <option value="Bank">Bank Account (NEFT / RTGS / Cheque)</option>
                <option value="Cash">Cash in Hand</option>
              </select>
            </div>

            {formData.transactionType === "transfer" ? (
              <div className="flex flex-col gap-1.5 min-w-0">
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
                  className="w-full max-w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0 truncate"
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
              <div className="flex flex-col gap-1.5 min-w-0">
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
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0"
                />
              </div>
            )}
          </div>

          {/* Expense Allocation / Borne By (Only for Outflows) */}
          {formData.transactionType === "outflow" && (
            <div className="flex flex-col gap-2 bg-[#0c0c0c] p-3 rounded-lg border border-[#222222]">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                  Cost Borne By / Allocation
                </label>
                <span className="text-[11px] text-[#71717A] font-mono">
                  {formData.borneBy === "self"
                    ? "Developer project cost"
                    : formData.borneBy === "seller"
                    ? "Deducted from seller dues"
                    : formData.borneBy === "buyer"
                    ? "Added to buyer receivables"
                    : "Multi-party apportioned"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#141414] p-1 rounded-lg border border-[#262626]">
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
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 ${
                    (formData.borneBy || "self") === "self"
                      ? "bg-[#262626] text-white font-bold shadow-sm"
                      : "text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  Self (Project)
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
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 ${
                    formData.borneBy === "seller"
                      ? "bg-amber-950/60 border border-amber-600/50 text-amber-300 font-bold shadow-sm"
                      : "text-[#A1A1AA] hover:text-white"
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
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 ${
                    formData.borneBy === "buyer"
                      ? "bg-blue-950/60 border border-blue-600/50 text-blue-300 font-bold shadow-sm"
                      : "text-[#A1A1AA] hover:text-white"
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
                      amountSelf: curSelf + curSeller + curBuyer === amt ? curSelf : amt,
                      amountSeller: curSelf + curSeller + curBuyer === amt ? curSeller : 0,
                      amountBuyer: curSelf + curSeller + curBuyer === amt ? curBuyer : 0,
                    });
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 ${
                    formData.borneBy === "split"
                      ? "bg-purple-950/60 border border-purple-600/50 text-purple-300 font-bold shadow-sm"
                      : "text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  Custom Split
                </button>
              </div>

              {/* Context Explanation */}
              <div className="text-[11px] text-[#888888] leading-relaxed">
                {(formData.borneBy || "self") === "self" && (
                  <span>
                    Regular project expenditure. Increases project outlay and directly reduces deal net profit.
                  </span>
                )}
                {formData.borneBy === "seller" && (
                  <span className="text-amber-300/90">
                    Paid on behalf of seller. Deducted from pending consideration dues to seller.
                  </span>
                )}
                {formData.borneBy === "buyer" && (
                  <span className="text-blue-300/90">
                    Paid on behalf of buyer. Added to outstanding customer receivable.
                  </span>
                )}
                {formData.borneBy === "split" && (
                  <span className="text-purple-300/90">
                    Disbursed from bank/cash, divided between developer outlay, seller deduction, and buyer billing.
                  </span>
                )}
              </div>

              {/* Split Inputs & Presets (Only when borneBy === "split") */}
              {formData.borneBy === "split" && (
                <div className="flex flex-col gap-2.5 pt-2 border-t border-[#1e1e1e]">
                  {/* Presets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-[#71717A] uppercase font-semibold mr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const amt = formData.amount || 0;
                        const half = Math.round(amt * 0.5);
                        setFormData({
                          ...formData,
                          amountSelf: half,
                          amountSeller: amt - half,
                          amountBuyer: 0,
                        });
                      }}
                      className="px-2 py-0.5 rounded bg-[#181818] border border-[#2c2c2c] text-[11px] text-[#D4D4D8] hover:text-white hover:border-[#555]"
                    >
                      50/50 Self &amp; Seller
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const amt = formData.amount || 0;
                        const half = Math.round(amt * 0.5);
                        setFormData({
                          ...formData,
                          amountBuyer: half,
                          amountSeller: amt - half,
                          amountSelf: 0,
                        });
                      }}
                      className="px-2 py-0.5 rounded bg-[#181818] border border-[#2c2c2c] text-[11px] text-[#D4D4D8] hover:text-white hover:border-[#555]"
                    >
                      50/50 Buyer &amp; Seller
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const amt = formData.amount || 0;
                        const third = Math.floor(amt / 3);
                        setFormData({
                          ...formData,
                          amountSelf: third,
                          amountSeller: third,
                          amountBuyer: amt - (third * 2),
                        });
                      }}
                      className="px-2 py-0.5 rounded bg-[#181818] border border-[#2c2c2c] text-[11px] text-[#D4D4D8] hover:text-white hover:border-[#555]"
                    >
                      Equal 3-Way
                    </button>
                  </div>

                  {/* 3 Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-white">Self Share (₹)</label>
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
                        className="bg-[#141414] border border-[#282828] rounded-md px-2.5 py-1.5 text-xs text-white font-mono focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-amber-400">Seller Share (₹)</label>
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
                        className="bg-[#141414] border border-[#282828] rounded-md px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-blue-400">Buyer Share (₹)</label>
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
                        className="bg-[#141414] border border-[#282828] rounded-md px-2.5 py-1.5 text-xs text-blue-300 font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Allocation Status */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#A1A1AA]">
                      Allocated:{" "}
                      <span className="font-mono font-bold text-white">
                        ₹{(((formData.amountSelf || 0) + (formData.amountSeller || 0) + (formData.amountBuyer || 0))).toLocaleString("en-IN")}
                      </span>{" "}
                      / ₹{(formData.amount || 0).toLocaleString("en-IN")}
                    </span>
                    {(formData.amount || 0) -
                      ((formData.amountSelf || 0) +
                        (formData.amountSeller || 0) +
                        (formData.amountBuyer || 0)) ===
                    0 ? (
                      <span className="text-[#22C55E] font-medium flex items-center gap-1">
                        Fully Allocated (100%)
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">
                        {(formData.amount || 0) -
                          ((formData.amountSelf || 0) +
                            (formData.amountSeller || 0) +
                            (formData.amountBuyer || 0)) >
                        0
                          ? `₹${((formData.amount || 0) - ((formData.amountSelf || 0) + (formData.amountSeller || 0) + (formData.amountBuyer || 0))).toLocaleString("en-IN")} unallocated`
                          : `Over-allocated by ₹${Math.abs((formData.amount || 0) - ((formData.amountSelf || 0) + (formData.amountSeller || 0) + (formData.amountBuyer || 0))).toLocaleString("en-IN")}`}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Row 5: Remarks / Notes */}
          <div className="flex flex-col gap-1.5 min-w-0">
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
              className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0 resize-none"
            />
          </div>

          {/* Row 6: Attachment URL */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#A1A1AA]" />
                <span>Document / Receipt Proof URL</span>
              </label>
              {formData.attachmentUrl && (
                <a
                  href={formData.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
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
              placeholder="https://drive.google.com/... or Dropbox / iCloud link"
              className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2 text-white text-base sm:text-sm outline-none focus:border-[#555555] min-w-0"
            />
          </div>

          {/* Delete Confirmation Alert */}
          {showDeleteConfirm && (
            <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-lg flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Confirm Permanent Deletion?</span>
              </div>
              <p className="text-xs text-rose-200/80 break-words">
                This will remove transaction{" "}
                <strong className="text-white font-mono">{transaction.transCode || transaction.id}</strong> (
                {formData.amount ? formatINRCompact(formData.amount) : "₹ 0"}) and immediately recalculate portfolio liquidity.
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
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
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[#262626] mt-1 flex-wrap">
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
                disabled={
                  isSaving ||
                  (formData.transactionType === "outflow" &&
                    formData.borneBy === "split" &&
                    (formData.amountSelf || 0) +
                      (formData.amountSeller || 0) +
                      (formData.amountBuyer || 0) !==
                      (formData.amount || 0))
                }
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
