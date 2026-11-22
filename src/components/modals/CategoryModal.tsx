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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-md-surface-lowest border border-md-outline-variant rounded-[28px] max-w-lg w-full min-w-0 max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6 shadow-m3-3 my-auto flex flex-col gap-5 animate-modal"
      >
        <div className="flex items-start justify-between border-b border-md-outline-variant/60 pb-4 gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-md-on-surface tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-md-primary flex-shrink-0" />
              <span>Manage Categories</span>
            </h2>
            <p className="text-xs text-md-on-surface-variant mt-1">
              Create your own expense or income labels so your ledger matches how you work.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high flex-shrink-0 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface-variant">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Panchayat Approval, Borewell Drilling, Brokerage"
              className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-2xl p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant/60 text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary focus:ring-2 focus:ring-md-primary/20 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Money Direction
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "outflow" | "inflow" | "transfer")
                }
                className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-2xl p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary truncate"
              >
                <option value="outflow">Money Paid (Expense)</option>
                <option value="inflow">Money Received (Income)</option>
                <option value="transfer">Bank ↔ Cash Transfer</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Where to Use
              </label>
              <select
                value={scope}
                onChange={(e) =>
                  setScope(e.target.value as "commercial" | "personal" | "both")
                }
                className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-2xl p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary truncate"
              >
                <option value="both">Both Business &amp; Personal</option>
                <option value="commercial">Business Deals Only</option>
                <option value="personal">Personal Homes Only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-md-primary-container/40 p-4 rounded-[20px] border border-md-outline-variant/80 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-md-on-primary-container">
              <ShieldCheck className="w-4 h-4 text-md-primary" />
              <span>How should this affect your totals?</span>
            </div>
            <p className="text-xs text-md-on-surface-variant leading-relaxed">
              Choose what this category counts toward so your balances and profit stay accurate automatically.
            </p>
            <select
              value={financialRole}
              onChange={(e) => setFinancialRole(e.target.value as FinancialRole)}
              className="w-full min-w-0 bg-md-surface-lowest border border-md-outline-variant rounded-2xl p-2.5 text-md-on-surface font-medium text-xs sm:text-sm mt-1 outline-none focus:border-md-primary truncate"
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

          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-md-on-surface-variant">
              Saved Categories ({categories.length})
            </div>
            <div className="max-h-36 overflow-y-auto border border-md-outline-variant/80 rounded-2xl p-2.5 bg-md-surface-low flex flex-wrap gap-1.5">
              {categories.map((c, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-md-surface-lowest text-xs font-medium text-md-on-surface border border-md-outline-variant/80"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-3 border-t border-md-outline-variant/60 flex-wrap sm:flex-nowrap">
            <button
              type="submit"
              disabled={isSubmitting}
              className="m3-btn-filled flex-1 py-2.5 text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Add Category"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="m3-btn-outlined px-5 py-2.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
