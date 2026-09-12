"use client";

import React, { useState } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import { SeedProperty, SeedSubPlot, SeedPartner } from "@/lib/seedData";
import { X, Building2, Home, Calculator, Plus, Trash2, Calendar, Link2, Users, Grid } from "lucide-react";

interface NewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "commercial" | "personal";
  onSave: (
    propertyData: Omit<SeedProperty, "id" | "propertyCode"> & {
      propertyCode?: string;
    }
  ) => Promise<void>;
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
  const [agreementDueDate, setAgreementDueDate] = useState("");
  const [targetSettlementDate, setTargetSettlementDate] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [sqftArea, setSqftArea] = useState<number | "">("");
  const [ratePerSqft, setRatePerSqft] = useState<number | "">("");
  const [agreedPurchasePrice, setAgreedPurchasePrice] = useState<number>(0);
  const [targetSalePrice, setTargetSalePrice] = useState<number>(0);
  const [agreedSellingPrice, setAgreedSellingPrice] = useState<number>(0);
  const [status, setStatus] = useState<
    "open" | "in_progress" | "registered" | "sold" | "closed"
  >("open");
  const [notes, setNotes] = useState("");
  const [subPlots, setSubPlots] = useState<SeedSubPlot[]>([]);
  const [partners, setPartners] = useState<SeedPartner[]>([]);
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

  const handleAddSubPlot = () => {
    const nextNum = String(subPlots.length + 1);
    setSubPlots([
      ...subPlots,
      {
        id: `plot-${Date.now()}-${nextNum}`,
        plotNumber: nextNum,
        sqftArea: 1200,
        targetPrice: 1500000,
        status: "available",
      },
    ]);
  };

  const handleUpdateSubPlot = (idx: number, updates: Partial<SeedSubPlot>) => {
    const current = [...subPlots];
    current[idx] = { ...current[idx], ...updates };
    setSubPlots(current);
  };

  const handleRemoveSubPlot = (idx: number) => {
    const current = [...subPlots];
    current.splice(idx, 1);
    setSubPlots(current);
  };

  const handleAddPartner = () => {
    setPartners([
      ...partners,
      {
        name: `Partner ${partners.length + 1}`,
        equityPct: 20,
        capitalCommitted: 0,
      },
    ]);
  };

  const handleUpdatePartner = (idx: number, updates: Partial<SeedPartner>) => {
    const current = [...partners];
    current[idx] = { ...current[idx], ...updates };
    setPartners(current);
  };

  const handleRemovePartner = (idx: number) => {
    const current = [...partners];
    current.splice(idx, 1);
    setPartners(current);
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
        propertyCode: propertyCode.trim() || undefined,
        location,
        acquisitionDate,
        agreementDueDate: agreementDueDate || undefined,
        targetSettlementDate: targetSettlementDate || undefined,
        attachmentUrl: attachmentUrl.trim() || undefined,
        sqftArea: sqftArea ? Number(sqftArea) : undefined,
        ratePerSqft: ratePerSqft ? Number(ratePerSqft) : undefined,
        agreedPurchasePrice,
        targetSalePrice: targetSalePrice || undefined,
        agreedSellingPrice: agreedSellingPrice || undefined,
        status,
        notes,
        subPlots: subPlots.length > 0 ? subPlots : undefined,
        partners: partners.length > 0 ? partners : undefined,
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
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl my-auto flex flex-col gap-5 animate-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            + Add New Real Estate Property / Deal
          </h2>
          <button
            onClick={onClose}
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

          {/* Agreement Due Date & Target Settlement Date */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Agreement Due Date
              </label>
              <input
                type="date"
                value={agreementDueDate}
                onChange={(e) => setAgreementDueDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Target Settlement Date
              </label>
              <input
                type="date"
                value={targetSettlementDate}
                onChange={(e) => setTargetSettlementDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Document / Cloud Proof URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span>Document / Proof URL (Optional)</span>
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://drive.google.com/... or Dropbox / iCloud link"
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#555555]"
            />
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
              onChange={(e) =>
                setStatus(
                  e.target.value as
                    | "open"
                    | "in_progress"
                    | "registered"
                    | "sold"
                    | "closed"
                )
              }
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

          {/* Sub-Plots Inventory (Commercial Only) */}
          {type === "commercial" && (
            <div className="pt-3 border-t border-[#1a1a1a] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-emerald-400" />
                  <label className="text-xs font-bold text-[#E4E4E7] uppercase tracking-wider">
                    Sub-Plots Inventory ({subPlots.length} Units)
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddSubPlot}
                  className="btn-action-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Plot</span>
                </button>
              </div>

              {subPlots.length > 0 && (
                <div className="flex flex-col gap-2">
                  {subPlots.map((sp, idx) => (
                    <div
                      key={sp.id || idx}
                      className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-[#121212] border border-[#262626] p-2 rounded-lg items-center text-xs"
                    >
                      <input
                        type="text"
                        value={sp.plotNumber}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, { plotNumber: e.target.value })
                        }
                        placeholder="Plot #"
                        className="bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white font-mono font-bold"
                      />
                      <input
                        type="number"
                        value={sp.sqftArea ?? ""}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            sqftArea: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="Sq.ft"
                        className="bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white font-mono"
                      />
                      <input
                        type="number"
                        value={sp.targetPrice ?? ""}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            targetPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="Target ₹"
                        className="bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white font-mono font-semibold sm:col-span-2"
                      />
                      <select
                        value={sp.status}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            status: e.target.value as "available" | "booked" | "sold",
                          })
                        }
                        className="bg-[#1a1a1a] border border-[#333333] rounded px-1.5 py-1 text-xs font-semibold text-white"
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="sold">Sold</option>
                      </select>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubPlot(idx)}
                          className="text-[#71717A] hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Joint Venture Partners (Commercial Only) */}
          {type === "commercial" && (
            <div className="pt-3 border-t border-[#1a1a1a] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <label className="text-xs font-bold text-[#E4E4E7] uppercase tracking-wider">
                    JV Partners ({partners.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddPartner}
                  className="btn-action-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Partner</span>
                </button>
              </div>

              {partners.length > 0 && (
                <div className="flex flex-col gap-2">
                  {partners.map((p, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-[#121212] border border-[#262626] p-2 rounded-lg items-center text-xs"
                    >
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) =>
                          handleUpdatePartner(idx, { name: e.target.value })
                        }
                        placeholder="Partner Name"
                        className="bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white text-xs font-semibold sm:col-span-2"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={p.equityPct ?? ""}
                          onChange={(e) =>
                            handleUpdatePartner(idx, {
                              equityPct: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Equity %"
                          className="w-full bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white text-xs font-mono font-bold"
                        />
                        <span className="text-[#71717A] font-bold">%</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemovePartner(idx)}
                          className="text-[#71717A] hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
