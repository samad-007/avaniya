"use client";

import React, { useState } from "react";
import { SeedCategory, FinancialRole } from "@/lib/seedData";
import { X, ShieldCheck, Tag } from "lucide-react";

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
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full min-w-0 max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6 shadow-modal my-auto flex flex-col gap-5 animate-modal"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Manage Categories</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Create your own expense or income labels so your ledger matches how you work.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-slate-700">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Panchayat Approval, Borewell Drilling, Brokerage"
              className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">
                Money Direction
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "outflow" | "inflow" | "transfer")
                }
                className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 truncate"
              >
                <option value="outflow">Money Paid (Expense)</option>
                <option value="inflow">Money Received (Income)</option>
                <option value="transfer">Bank ↔ Cash Transfer</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">
                Where to Use
              </label>
              <select
                value={scope}
                onChange={(e) =>
                  setScope(e.target.value as "commercial" | "personal" | "both")
                }
                className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500 truncate"
              >
                <option value="both">Both Business &amp; Personal</option>
                <option value="commercial">Business Deals Only</option>
                <option value="personal">Personal Homes Only</option>
              </select>
            </div>
          </div>

          {/* Calculation Role */}
          <div className="flex flex-col gap-2 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>How should this affect your totals?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose what this category counts toward so your balances and profit stay accurate automatically.
            </p>
            <select
              value={financialRole}
              onChange={(e) => setFinancialRole(e.target.value as FinancialRole)}
              className="w-full min-w-0 bg-white border border-emerald-200 rounded-xl p-2.5 text-slate-900 font-medium text-xs sm:text-sm mt-1 outline-none focus:border-emerald-500 truncate"
            >
              <option value="property_expense">
                Extra Property Cost (Adds to total cost &amp; reduces profit)
              </option>
              <option value="purchase_principal">
                Seller Payment (Reduces balance owed to seller)
              </option>
              <option value="sale_receipt">
                Buyer Payment (Adds to sales &amp; reduces buyer dues)
              </option>
              <option value="capital_infusion">
                Capital Added (Adds money into your available balance)
              </option>
              <option value="personal_milestone">
                Personal Home Milestone (Counts toward home payment)
              </option>
              <option value="personal_overhead">
                Personal Extra Cost (Stamp duty, GST, maintenance)
              </option>
              <option value="internal_transfer">
                Internal Transfer (Moves money between Bank &amp; Cash)
              </option>
            </select>
          </div>

          {/* Existing Categories List */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-600">
              Saved Categories ({categories.length})
            </div>
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50 flex flex-wrap gap-1.5">
              {categories.map((c, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white text-xs font-medium text-slate-700 border border-slate-200 shadow-soft"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 flex-wrap sm:flex-nowrap">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action-brand flex-1 py-2.5 rounded-xl text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Add Category"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-action-secondary px-4 py-2.5 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
