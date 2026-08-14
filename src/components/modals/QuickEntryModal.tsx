"use client";

import React, { useState, useEffect } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import { SeedProperty, SeedCategory } from "@/lib/seedData";
import { X, Banknote, Landmark, Plus } from "lucide-react";

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: "outflow" | "inflow" | "transfer";
  currentScope: "commercial" | "personal";
  defaultPropertyCode?: string;
  properties: SeedProperty[];
  categories: SeedCategory[];
  onSave: (transactionData: any) => Promise<void>;
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
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [recipient, setRecipient] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [transferType, setTransferType] = useState<string>(
    "Bank Withdrawal to Cash"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultPropertyCode) {
      setPropertyCode(defaultPropertyCode);
    } else if (properties.length > 0) {
      setPropertyCode(properties[0].propertyCode);
    }
  }, [defaultPropertyCode, properties, isOpen]);

  // Filter categories matching current scope & type
  const availableCategories = categories.filter(
    (c) =>
      (c.scope === currentScope || c.scope === "both") &&
      (entryType === "transfer"
        ? c.type === "transfer"
        : entryType === "inflow"
        ? c.type === "inflow"
        : c.type === "outflow")
  );

  useEffect(() => {
    if (availableCategories.length > 0 && !category) {
      setCategory(availableCategories[0].name);
    }
  }, [availableCategories, category]);

  if (!isOpen) return null;

  const handleAddPreset = (val: number) => {
    setAmount((prev) => (prev || 0) + val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        scope: currentScope,
        transactionType:
          entryType === "transfer"
            ? "transfer"
            : entryType === "inflow"
            ? "capital_inflow"
            : "outflow",
        propertyCode: propertyCode || undefined,
        category: category || (entryType === "transfer" ? "Internal Transfer" : "General"),
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto animate-backdrop">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl my-auto flex flex-col gap-5 animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
          <div className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>
              {entryType === "outflow"
                ? "Record Outflow / Expense"
                : entryType === "inflow"
                ? "Record Inflow / Receipt"
                : "Internal Liquidity Transfer"}
            </span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626]">
              {currentScope.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
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
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-3 text-2xl font-mono font-bold text-white outline-none focus:border-[#555555] transition-all duration-150"
              required
            />
            {/* Verbal Converter Display */}
            <div className="bg-[#111111] border border-dashed border-[#383838] rounded-md px-3.5 py-2 text-xs font-mono font-semibold text-[#F59E0B]">
              {amountToVerbalSummary(amount)}
            </div>

            {/* Quick Amount Increment Preset Chips */}
            <div className="flex flex-wrap gap-2 mt-1">
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
                  className="px-2.5 py-1.5 rounded-md bg-[#141414] border border-[#262626] text-xs font-mono font-medium text-[#D4D4D8] hover:text-black hover:bg-white hover:border-white transition-all duration-150"
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
                className={`py-2.5 rounded-md flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  mode === "Bank"
                    ? "bg-[#262626] text-white shadow-sm"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <Landmark className="w-4 h-4 text-[#3B82F6]" />
                <span>Bank (NEFT / RTGS)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("Cash")}
                className={`py-2.5 rounded-md flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  mode === "Cash"
                    ? "bg-[#262626] text-white shadow-sm"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <Banknote className="w-4 h-4 text-[#22C55E]" />
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
                onChange={(e) => setTransferType(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
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
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
              >
                <option value="">-- General / Unlinked --</option>
                {properties
                  .filter(
                    (p) => p.type === currentScope || currentScope === "commercial"
                  )
                  .map((p) => (
                    <option key={p.id} value={p.propertyCode}>
                      {p.propertyCode} : {p.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Category Dropdown */}
          {entryType !== "transfer" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                  Category
                </label>
                <button
                  type="button"
                  onClick={onOpenCategoryModal}
                  className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Custom Category</span>
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
              >
                {availableCategories.map((c, idx) => (
                  <option key={idx} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Recipient Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Paid To / Received From
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Seller, Stalin, Palani..."
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
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
              placeholder="e.g. Token advance paid at lawyer office"
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
            />
          </div>

          {/* Submit Action Buttons (Key Ingress Hover-to-White) */}
          <div className="flex items-center gap-2.5 pt-2.5 border-t border-[#262626]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action-primary flex-1 py-2.5 rounded-lg text-xs sm:text-sm disabled:opacity-50"
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
