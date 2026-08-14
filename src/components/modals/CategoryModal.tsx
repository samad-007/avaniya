"use client";

import React, { useState } from "react";
import { SeedCategory, FinancialRole } from "@/lib/seedData";
import { X, ShieldCheck } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: SeedCategory[];
  onAddCategory: (category: SeedCategory) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
}) => {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"commercial" | "personal" | "both">("both");
  const [type, setType] = useState<"outflow" | "inflow" | "transfer">("outflow");
  const [financialRole, setFinancialRole] =
    useState<FinancialRole>("property_expense");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddCategory({
        name: name.trim(),
        scope,
        type,
        financialRole,
      });
      setName("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl my-auto flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Dynamic Categories &amp; Financial Formula Engine
            </h2>
            <div className="text-xs text-[#A1A1AA] mt-0.5 font-medium">
              Add new categories without modifying any underlying code
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Panchayat Approval Charges, Borewell Drilling"
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Transaction Direction
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
              >
                <option value="outflow">Outflow (Expense / Payment)</option>
                <option value="inflow">Inflow (Receipt / Revenue)</option>
                <option value="transfer">Internal Transfer</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Applicable Mode
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
              >
                <option value="both">Both Commercial &amp; Personal</option>
                <option value="commercial">Commercial Land Only</option>
                <option value="personal">Personal Asset Only</option>
              </select>
            </div>
          </div>

          {/* Mathematical Financial Role Mapping */}
          <div className="flex flex-col gap-2 bg-[#050505] p-3.5 rounded-lg border border-[#262626]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E]">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Break Formula Role Mapping</span>
            </div>
            <div className="text-xs text-[#A1A1AA] leading-relaxed font-medium">
              Select how this category maps into balance sheets, pending
              receivables, payables, and P&amp;L aggregations.
            </div>
            <select
              value={financialRole}
              onChange={(e) => setFinancialRole(e.target.value as any)}
              className="w-full bg-[#111111] border border-[#383838] rounded-lg p-2.5 text-white font-medium text-xs sm:text-sm mt-1 outline-none focus:border-[#555555]"
            >
              <option value="property_expense">
                Property Deal Expense (Adds to Total Cost &amp; Reduces Profit)
              </option>
              <option value="purchase_principal">
                Purchase Principal (Directly Reduces Pending Seller Outflow)
              </option>
              <option value="sale_receipt">
                Sale Receipt (Adds to Revenue &amp; Reduces Buyer Receivable)
              </option>
              <option value="capital_infusion">
                External Capital Funding (Injects Liquidity into Business)
              </option>
              <option value="personal_milestone">
                Personal Milestone Payment (Direct Asset Stage Completion)
              </option>
              <option value="personal_overhead">
                Personal Overhead (Stamp Duty, GST, Maintenance)
              </option>
              <option value="internal_transfer">
                Internal Transfer (Neutral Net Effect, Reallocates Bank &lt;-&gt; Cash)
              </option>
            </select>
          </div>

          {/* Existing Categories List */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Currently Registered Categories ({categories.length})
            </div>
            <div className="max-h-36 overflow-y-auto border border-[#262626] rounded-lg p-2.5 bg-[#050505] flex flex-wrap gap-1.5">
              {categories.map((c, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-[#111111] text-xs font-medium text-[#D4D4D8] border border-[#262626]"
                >
                  {c.name} ({c.financialRole})
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2.5 border-t border-[#262626]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg bg-white text-black font-semibold text-xs sm:text-sm hover:bg-[#e0e0e0] transition-standard disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Register Custom Category"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#161616] text-white border border-[#2a2a2a] text-xs sm:text-sm font-medium hover:bg-[#222222] transition-standard"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
