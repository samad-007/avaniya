"use client";

import React, { useState } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import { SeedProperty } from "@/lib/seedData";
import { X, Building2, Home, Calculator } from "lucide-react";

interface NewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "commercial" | "personal";
  onSave: (propertyData: Omit<SeedProperty, "id">) => Promise<void>;
}

export const NewPropertyModal: React.FC<NewPropertyModalProps> = ({
  isOpen,
  onClose,
  defaultType = "commercial",
  onSave,
}) => {
  const [type, setType] = useState<"commercial" | "personal">(defaultType);
  const [name, setName] = useState("");
  const [propertyCode, setPropertyCode] = useState("");
  const [location, setLocation] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sqftArea, setSqftArea] = useState<number | "">("");
  const [ratePerSqft, setRatePerSqft] = useState<number | "">("");
  const [agreedPurchasePrice, setAgreedPurchasePrice] = useState<number>(0);
  const [targetSalePrice, setTargetSalePrice] = useState<number>(0);
  const [agreedSellingPrice, setAgreedSellingPrice] = useState<number>(0);
  const [status, setStatus] = useState<
    "open" | "in_progress" | "registered" | "sold" | "closed"
  >("open");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto-calculate Agreed Purchase Price when sq.ft & rate are provided
  const handleSqftOrRateChange = (
    newSqft: number | "",
    newRate: number | ""
  ) => {
    setSqftArea(newSqft);
    setRatePerSqft(newRate);
    if (newSqft && newRate && typeof newSqft === "number" && typeof newRate === "number") {
      setAgreedPurchasePrice(Math.round(newSqft * newRate));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || agreedPurchasePrice < 0) return;

    setIsSubmitting(true);
    try {
      const defaultMilestones =
        type === "personal"
          ? [
              {
                name: "1. Booking Amount / Agreement",
                targetAmount: Math.round(agreedPurchasePrice * 0.1),
                paidAmount: 0,
                status: "pending" as const,
              },
              {
                name: "2. Foundation / Plinth Completion",
                targetAmount: Math.round(agreedPurchasePrice * 0.2),
                paidAmount: 0,
                status: "pending" as const,
              },
              {
                name: "3. Slab Completion",
                targetAmount: Math.round(agreedPurchasePrice * 0.25),
                paidAmount: 0,
                status: "pending" as const,
              },
              {
                name: "4. Brickwork & Plastering",
                targetAmount: Math.round(agreedPurchasePrice * 0.2),
                paidAmount: 0,
                status: "pending" as const,
              },
              {
                name: "5. Flooring & Fit-outs",
                targetAmount: Math.round(agreedPurchasePrice * 0.15),
                paidAmount: 0,
                status: "pending" as const,
              },
              {
                name: "6. Possession / Handover",
                targetAmount: Math.round(agreedPurchasePrice * 0.1),
                paidAmount: 0,
                status: "pending" as const,
              },
            ]
          : undefined;

      await onSave({
        type,
        name,
        propertyCode: propertyCode.trim() || undefined as any,
        location,
        acquisitionDate,
        sqftArea: sqftArea ? Number(sqftArea) : undefined,
        ratePerSqft: ratePerSqft ? Number(ratePerSqft) : undefined,
        agreedPurchasePrice,
        targetSalePrice: targetSalePrice || undefined,
        agreedSellingPrice: agreedSellingPrice || undefined,
        status,
        notes,
        milestones: defaultMilestones,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 shadow-2xl my-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <h2 className="text-base font-bold text-white tracking-tight">
            + Add New Real Estate Property / Deal
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Scope Type Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-[#111111] p-1 rounded border border-[#222222]">
            <button
              type="button"
              onClick={() => setType("commercial")}
              className={`py-2 rounded flex items-center justify-center gap-2 font-semibold text-xs transition-standard ${
                type === "commercial"
                  ? "bg-[#222222] text-white"
                  : "text-[#777777] hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Commercial Land Deal</span>
            </button>
            <button
              type="button"
              onClick={() => setType("personal")}
              className={`py-2 rounded flex items-center justify-center gap-2 font-semibold text-xs transition-standard ${
                type === "personal"
                  ? "bg-[#222222] text-white"
                  : "text-[#777777] hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Personal Property Asset</span>
            </button>
          </div>

          {/* Property Name & Custom Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                Property / Site Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Andal Avenue, Prestige 3BHK"
                className="w-full bg-[#111111] border border-[#222222] rounded p-2.5 text-white outline-none focus:border-[#555555]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                Custom Code
              </label>
              <input
                type="text"
                value={propertyCode}
                onChange={(e) => setPropertyCode(e.target.value)}
                placeholder={type === "commercial" ? "LND-006" : "APT-002"}
                className="w-full bg-[#111111] border border-[#222222] rounded p-2.5 text-white font-mono outline-none focus:border-[#555555]"
              />
            </div>
          </div>

          {/* Location & Acquisition Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. OMR Chennai, Kalaimal Nagar"
                className="w-full bg-[#111111] border border-[#222222] rounded p-2.5 text-white outline-none focus:border-[#555555]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                Acquisition Date
              </label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#222222] rounded p-2.5 text-white outline-none focus:border-[#555555]"
              />
            </div>
          </div>

          {/* Sq.ft and Rate Calculator */}
          <div className="bg-[#050505] border border-[#222222] rounded p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1 text-[11px] text-[#F59E0B] font-medium">
              <Calculator className="w-3.5 h-3.5" />
              <span>Square Feet Land Rate Calculator (Optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#777777] uppercase">
                  Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={sqftArea}
                  onChange={(e) =>
                    handleSqftOrRateChange(
                      e.target.value ? parseFloat(e.target.value) : "",
                      ratePerSqft
                    )
                  }
                  placeholder="e.g. 1122"
                  className="w-full bg-[#111111] border border-[#222222] rounded p-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#777777] uppercase">
                  Rate per sq.ft (₹)
                </label>
                <input
                  type="number"
                  value={ratePerSqft}
                  onChange={(e) =>
                    handleSqftOrRateChange(
                      sqftArea,
                      e.target.value ? parseFloat(e.target.value) : ""
                    )
                  }
                  placeholder="e.g. 9100"
                  className="w-full bg-[#111111] border border-[#222222] rounded p-2 text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Agreed Purchase Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
              Agreed Purchase Price (₹ INR)
            </label>
            <input
              type="number"
              value={agreedPurchasePrice || ""}
              onChange={(e) =>
                setAgreedPurchasePrice(parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full bg-[#111111] border border-[#222222] rounded p-2.5 text-lg font-mono font-bold text-white outline-none focus:border-[#555555]"
              required
            />
            <div className="text-[11px] font-mono text-[#F59E0B]">
              {amountToVerbalSummary(agreedPurchasePrice)}
            </div>
          </div>

          {/* Commercial Target Sale & Selling Price */}
          {type === "commercial" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                  Target Sale Price (₹)
                </label>
                <input
                  type="number"
                  value={targetSalePrice || ""}
                  onChange={(e) =>
                    setTargetSalePrice(parseFloat(e.target.value) || 0)
                  }
                  placeholder="e.g. 13464000"
                  className="w-full bg-[#111111] border border-[#222222] rounded p-2.5 text-white font-mono outline-none focus:border-[#555555]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                  Agreed Selling Price (₹)
                </label>
                <input
                  type="number"
                  value={agreedSellingPrice || ""}
                  onChange={(e) =>
                    setAgreedSellingPrice(parseFloat(e.target.value) || 0)
                  }
                  placeholder="e.g. 12150000"
                  className="w-full bg-[#111111] border border-[#222222] rounded p-2.5 text-white font-mono outline-none focus:border-[#555555]"
                />
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
              Deal / Acquisition Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-[#111111] border border-[#222222] rounded p-2.5 text-white outline-none focus:border-[#555555]"
            >
              <option value="open">Open / Under Token Advance</option>
              <option value="in_progress">In Progress (Partially Paid)</option>
              <option value="registered">Registered / Sale Deed Transferred</option>
              <option value="sold">Sold (Buyer Inflows Pending/Settled)</option>
              <option value="closed">Closed Deal</option>
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
              Notes & Deal Details
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 1122 sq.ft @ ₹9,100/sqft buy price..."
              rows={2}
              className="w-full bg-[#111111] border border-[#222222] rounded p-2.5 text-white outline-none focus:border-[#555555] resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#222222]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded bg-white text-black font-semibold text-xs hover:bg-[#e0e0e0] transition-standard disabled:opacity-50"
            >
              {isSubmitting ? "Creating Property..." : "Create Property"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded bg-[#161616] text-white border border-[#2a2a2a] text-xs font-medium hover:bg-[#222222] transition-standard"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
