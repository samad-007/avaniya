"use client";

import React, { useState, useEffect, useMemo } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import { SeedProperty, SeedCategory, SeedTransaction } from "@/lib/seedData";
import { X, Banknote, Landmark, Plus, Edit3 } from "lucide-react";

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: "outflow" | "inflow" | "transfer";
  currentScope: "commercial" | "personal";
  defaultPropertyCode?: string;
  properties: SeedProperty[];
  categories: SeedCategory[];
  onSave: (transactionData: Omit<SeedTransaction, "id">) => Promise<void>;
  onOpenCategoryModal: () => void;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  entryType,
  currentScope,
  defaultPropertyCode,
  properties,
  categories,
  onSave,
  onOpenCategoryModal,
}) => {
  const [amount, setAmount] = useState<number>(500000);
  const [mode, setMode] = useState<"Bank" | "Cash">("Bank");
  const [propertyCode, setPropertyCode] = useState<string>(
    defaultPropertyCode || ""
  );
  const [category, setCategory] = useState<string>("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [recipient, setRecipient] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [transferType, setTransferType] = useState<
    | "Bank Withdrawal to Cash"
    | "Cash Deposit to Bank"
    | "Cash to Bank"
    | "Bank to Cash"
  >("Bank Withdrawal to Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultPropertyCode) {
      setPropertyCode(defaultPropertyCode);
    } else if (properties.length > 0) {
      const match = properties.find(
        (p) => p.type === currentScope || currentScope === "commercial"
      );
      setPropertyCode(match ? match.propertyCode : "");
    } else {
      setPropertyCode("");
    }
  }, [defaultPropertyCode, properties, currentScope, isOpen]);

  // Robust category filtration matching scope and entry type
  const availableCategories = useMemo(() => {
    const list = categories.filter((c) => {
      const scopeMatches =
        c.scope === "both" ||
        c.scope === currentScope ||
        (!c.scope && currentScope === "commercial");
      const typeMatches =
        entryType === "transfer"
          ? c.type === "transfer"
          : entryType === "inflow"
          ? c.type === "inflow"
          : c.type === "outflow";
      return scopeMatches && typeMatches;
    });

    if (list.length > 0) return list;

    // Safety fallback defaults if database categories list is still loading or empty
    if (entryType === "inflow") {
      return currentScope === "personal"
        ? [
            {
              name: "Personal Savings",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Salary / Professional Income",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Rental Income",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Fixed Deposit / Mutual Fund Return",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Asset / Gold Sale",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "General Personal Inflow",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
          ]
        : [
            {
              name: "Booking Token",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "sale_receipt" as const,
            },
            {
              name: "Sale Installment",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "sale_receipt" as const,
            },
            {
              name: "Final Settlement",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "sale_receipt" as const,
            },
            {
              name: "Bank Account Funding",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Partner Investment",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Business Loan",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "General Capital Inflow",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
          ];
    } else if (entryType === "transfer") {
      return [
        {
          name: "Internal Liquidity Transfer",
          scope: "both" as const,
          type: "transfer" as const,
          financialRole: "internal_transfer" as const,
        },
      ];
    } else {
      return [
        {
          name: "Purchase Advance",
          scope: "commercial" as const,
          type: "outflow" as const,
          financialRole: "purchase_principal" as const,
        },
        {
          name: "Legal & Docs",
          scope: "commercial" as const,
          type: "outflow" as const,
          financialRole: "property_expense" as const,
        },
        {
          name: "Booking Amount / Agreement",
          scope: "personal" as const,
          type: "outflow" as const,
          financialRole: "personal_milestone" as const,
        },
      ];
    }
  }, [categories, currentScope, entryType]);

  // Synchronize category on modal open or type switch
  useEffect(() => {
    if (isOpen) {
      setIsCustomCategory(false);
      setCustomCategoryInput("");
      if (availableCategories.length > 0) {
        // If current category is not in the active options, pick the first valid option
        if (!category || !availableCategories.some((c) => c.name === category)) {
          setCategory(availableCategories[0].name);
        }
      }
    }
  }, [isOpen, entryType, currentScope, availableCategories]);

  if (!isOpen) return null;

  const handleAddPreset = (val: number) => {
    setAmount((prev) => (prev || 0) + val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || "General Inflow"
      : category || (availableCategories[0]?.name ?? "General");

    // Determine precise transaction type
    let finalTxType: "outflow" | "deal_inflow" | "capital_inflow" | "transfer" = "outflow";
    if (entryType === "transfer") {
      finalTxType = "transfer";
    } else if (entryType === "inflow") {
      if (currentScope === "commercial" && propertyCode) {
        finalTxType = "deal_inflow";
      } else {
        finalTxType = "capital_inflow";
      }
    } else {
      finalTxType = "outflow";
    }

    setIsSubmitting(true);
    try {
      await onSave({
        scope: currentScope,
        transactionType: finalTxType,
        propertyCode: propertyCode || undefined,
        category: finalCategory,
        mode,
        transferType: entryType === "transfer" ? transferType : undefined,
        amount,
        recipientOrSource: recipient,
        remarks,
        date,
      });
      onClose();
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl my-auto flex flex-col gap-4 sm:gap-5 animate-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-3 sm:pb-3.5">
          <div className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>
              {entryType === "outflow"
                ? "Record Outflow / Expense"
                : entryType === "inflow"
                ? "Record Inflow / Receipt"
                : "Internal Liquidity Transfer"}
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626]">
              {currentScope.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4 text-sm">
          {/* Big Amount Input with Live Indian Verbal Conversion */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Amount (₹ INR)
            </label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 sm:p-3 text-xl sm:text-2xl font-mono font-bold text-white outline-none focus:border-[#555555] transition-all duration-150"
              required
            />
            {/* Verbal Converter Display */}
            <div className="bg-[#111111] border border-dashed border-[#383838] rounded-md px-3 py-1.5 text-xs font-mono font-semibold text-[#F59E0B]">
              {amountToVerbalSummary(amount)}
            </div>

            {/* Quick Amount Increment Preset Chips */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
              {[
                { label: "+10k", val: 10000 },
                { label: "+50k", val: 50000 },
                { label: "+1 Lakh", val: 100000 },
                { label: "+5 Lakhs", val: 500000 },
                { label: "+10 Lakhs", val: 1000000 },
                { label: "+50 Lakhs", val: 5000000 },
                { label: "+1 Crore", val: 10000000 },
              ].map((chip, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleAddPreset(chip.val)}
                  className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md bg-[#141414] border border-[#262626] text-[11px] sm:text-xs font-mono font-medium text-[#D4D4D8] hover:text-black hover:bg-white hover:border-white transition-all duration-150"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode (Bank vs Cash) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#111111] p-1 rounded-lg border border-[#262626]">
              <button
                type="button"
                onClick={() => setMode("Bank")}
                className={`py-2 sm:py-2.5 rounded-md flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  mode === "Bank"
                    ? "bg-[#262626] text-white shadow-sm font-bold"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3B82F6]" />
                <span>Bank (NEFT / RTGS)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("Cash")}
                className={`py-2 sm:py-2.5 rounded-md flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  mode === "Cash"
                    ? "bg-[#262626] text-white shadow-sm font-bold"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#22C55E]" />
                <span>Cash in Hand</span>
              </button>
            </div>
          </div>

          {/* Transfer Type (Only if transfer mode) */}
          {entryType === "transfer" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Transfer Direction
              </label>
              <select
                value={transferType}
                onChange={(e) =>
                  setTransferType(
                    e.target.value as
                      | "Bank Withdrawal to Cash"
                      | "Cash Deposit to Bank"
                      | "Cash to Bank"
                      | "Bank to Cash"
                  )
                }
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
              >
                <option value="Bank Withdrawal to Cash">
                  Bank Withdrawal to Cash (Withdraw from Bank into Cash Hand)
                </option>
                <option value="Cash Deposit to Bank">
                  Cash Deposit to Bank (Deposit Cash into Bank Account)
                </option>
              </select>
            </div>
          )}

          {/* Link to Property */}
          {entryType !== "transfer" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Link to Property / Land Deal
              </label>
              <select
                value={propertyCode}
                onChange={(e) => setPropertyCode(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
              >
                <option value="">-- General Portfolio (Unlinked) --</option>
                {properties
                  .filter(
                    (p) =>
                      p.type === currentScope ||
                      currentScope === "commercial"
                  )
                  .map((p) => (
                    <option key={p.id} value={p.propertyCode}>
                      {p.propertyCode} : {p.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Category Selector (Select / Custom Toggle) */}
          {entryType !== "transfer" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                  Category
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory) {
                        setCustomCategoryInput(category);
                      }
                    }}
                    className="text-xs text-[#22C55E] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isCustomCategory ? "Pick from List" : "+ Type Custom"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">Engine</span>
                  </button>
                </div>
              </div>

              {isCustomCategory ? (
                <div className="relative">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Type custom category name..."
                    list="custom-inflow-suggestions"
                    className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#22C55E]"
                    required
                    autoFocus
                  />
                  <datalist id="custom-inflow-suggestions">
                    {availableCategories.map((c, idx) => (
                      <option key={idx} value={c.name} />
                    ))}
                  </datalist>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555] cursor-pointer"
                >
                  {availableCategories.map((c, idx) => (
                    <option key={idx} value={c.name} className="bg-[#111111] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Date & Recipient Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                {entryType === "inflow" ? "Received From / Source" : "Paid To / Beneficiary"}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={
                  entryType === "inflow"
                    ? "e.g. Partner, Buyer, Escrow..."
                    : "e.g. Seller, Lawyer, Stalin..."
                }
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Remarks / Transaction Notes
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Token advance paid at lawyer office, Cheque #004521"
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2.5 border-t border-[#262626]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action-primary flex-1 py-2.5 rounded-lg text-xs sm:text-sm disabled:opacity-50 font-semibold"
            >
              {isSubmitting ? "Saving Transaction..." : "Save Transaction"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#161616] text-white border border-[#2a2a2a] text-xs sm:text-sm font-medium hover:bg-[#222222] transition-all duration-150"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
