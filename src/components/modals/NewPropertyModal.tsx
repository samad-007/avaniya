"use client";

import React, { useState } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import { SeedProperty } from "@/lib/seedData";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";
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
  const { shouldRender, isClosing, handleClose } = useAnimatedModal(isOpen, onClose);

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

  if (!shouldRender) return null;

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
        propertyCode: propertyCode.trim() || (undefined as any),
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
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto ${
        isClosing ? "animate-backdrop-exit" : "animate-backdrop"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl my-auto flex flex-col gap-5 ${
          isClosing ? "animate-modal-exit" : "animate-modal"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            + Add New Real Estate Property / Deal
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {/* Scope Type Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-[#111111] p-1 rounded-lg border border-[#262626]">
            <button
              type="button"
              onClick={() => setType("commercial")}
              className={`py-2.5 rounded-md flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all duration-150 ${
                type === "commercial"
                  ? "bg-[#262626] text-white shadow-sm"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Commercial Land Deal</span>
            </button>
            <button
              type="button"
              onClick={() => setType("personal")}
              className={`py-2.5 rounded-md flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all duration-150 ${
                type === "personal"
                  ? "bg-[#262626] text-white shadow-sm"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Personal Property Asset</span>
            </button>
          </div>

          {/* Property Name & Custom Code */}
          <div className="grid grid-cols-3 gap-3.5">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Property / Site Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Andal Avenue, Prestige 3BHK"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Custom Code
              </label>
              <input
                type="text"
                value={propertyCode}
                onChange={(e) => setPropertyCode(e.target.value)}
                placeholder={type === "commercial" ? "LND-006" : "APT-002"}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white font-mono text-sm outline-none focus:border-[#555555]"
              />
            </div>
          </div>

          {/* Location & Acquisition Date */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. OMR Chennai, Kalaimal Nagar"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Acquisition Date
              </label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
              />
            </div>
          </div>

          {/* Sq.ft and Rate Calculator */}
          <div className="bg-[#050505] border border-[#262626] rounded-lg p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-[#F59E0B] font-semibold">
              <Calculator className="w-4 h-4" />
              <span>Square Feet Land Rate Calculator (Optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A1A1AA] uppercase font-medium">
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
                  className="w-full bg-[#111111] border border-[#262626] rounded-md p-2 text-white font-mono text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] uppercase font-medium">
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
                  className="w-full bg-[#111111] border border-[#262626] rounded-md p-2 text-white font-mono text-sm mt-1"
                />
              </div>
            </div>
          </div>

          {/* Agreed Purchase Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Agreed Purchase Price (₹ INR)
            </label>
            <input
              type="number"
              value={agreedPurchasePrice || ""}
              onChange={(e) =>
                setAgreedPurchasePrice(parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-xl font-mono font-bold text-white outline-none focus:border-[#555555]"
              required
            />
            <div className="text-xs font-mono text-[#F59E0B] font-medium">
              {amountToVerbalSummary(agreedPurchasePrice)}
            </div>
          </div>

          {/* Commercial Target Sale & Selling Price */}
          {type === "commercial" && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                  Target Sale Price (₹)
                </label>
                <input
                  type="number"
                  value={targetSalePrice || ""}
                  onChange={(e) =>
                    setTargetSalePrice(parseFloat(e.target.value) || 0)
                  }
                  placeholder="e.g. 13464000"
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white font-mono text-sm outline-none focus:border-[#555555]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                  Agreed Selling Price (₹)
                </label>
                <input
                  type="number"
                  value={agreedSellingPrice || ""}
                  onChange={(e) =>
                    setAgreedSellingPrice(parseFloat(e.target.value) || 0)
                  }
                  placeholder="e.g. 12150000"
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white font-mono text-sm outline-none focus:border-[#555555]"
                />
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Deal / Acquisition Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
            >
              <option value="open">Open (Token / Advance Paid)</option>
              <option value="in_progress">In Progress (Partially Paid)</option>
              <option value="registered">Registered / Sale Deed Transferred</option>
              <option value="sold">Sold (Buyer Receivables Collecting/Settled)</option>
              <option value="closed">Closed Deal</option>
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Notes &amp; Deal Details
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 1122 sq.ft @ ₹9,100/sqft buy price..."
              rows={2}
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555] resize-none"
            />
          </div>

          {/* Buttons (Key Action: Create Property with Hover-to-White) */}
          <div className="flex items-center gap-2.5 pt-2.5 border-t border-[#262626]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action-primary flex-1 py-2.5 rounded-lg text-xs sm:text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Creating Property..." : "Create Property"}
            </button>
            <button
              type="button"
              onClick={handleClose}
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
