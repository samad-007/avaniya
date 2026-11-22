"use client";

import React, { useState } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import { SeedProperty, SeedSubPlot, SeedPartner } from "@/lib/seedData";
import {
  X,
  Building2,
  Home,
  Calculator,
  Plus,
  Trash2,
  Link2,
  Users,
  Grid,
} from "lucide-react";

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

  const handleSqftOrRateChange = (
    newSqft: number | "",
    newRate: number | ""
  ) => {
    setSqftArea(newSqft);
    setRatePerSqft(newRate);
    if (
      newSqft &&
      newRate &&
      typeof newSqft === "number" &&
      typeof newRate === "number"
    ) {
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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-md-surface-lowest dark:bg-md-surface-container rounded-[24px] max-w-lg w-full min-w-0 max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6 shadow-m3-3 my-auto flex flex-col gap-5 animate-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-md-on-surface tracking-tight">
              Add a New Property
            </h2>
            <p className="text-xs text-md-on-surface-variant mt-0.5">
              Enter the basic details — you can always update prices or add sub-plots later.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {/* Scope Type Toggle */}
          <div className="grid grid-cols-2 gap-1.5 bg-md-surface-container p-1 rounded-[18px]">
            <button
              type="button"
              onClick={() => setType("commercial")}
              className={`py-2 rounded-lg flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all ${ type === "commercial" ? "bg-md-surface-lowest text-md-on-surface shadow-sm" : "text-md-on-surface-variant hover:text-md-on-surface" }`}
            >
              <Building2 className="w-4 h-4 text-md-primary" />
              <span>Business Land Deal</span>
            </button>
            <button
              type="button"
              onClick={() => setType("personal")}
              className={`py-2 rounded-lg flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all ${ type === "personal" ? "bg-md-surface-lowest text-md-on-surface shadow-sm" : "text-md-on-surface-variant hover:text-md-on-surface" }`}
            >
              <Home className="w-4 h-4 text-md-primary" />
              <span>Personal Home / Asset</span>
            </button>
          </div>

          {/* Property Name & Custom Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2 flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Property / Plot Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Andal Avenue, Prestige 3BHK"
                className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary focus:ring-2 focus:ring-md-primary/20"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Short Code
              </label>
              <input
                type="text"
                value={propertyCode}
                onChange={(e) => setPropertyCode(e.target.value)}
                placeholder="Auto"
                className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant font-mono text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary"
              />
            </div>
          </div>

          {/* Location & Acquisition Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Location / Area
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. OMR Chennai, Anna Nagar"
                className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Purchase / Booking Date
              </label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary"
              />
            </div>
          </div>

          {/* Deadlines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-warning">
                Payment Due Date (Optional)
              </label>
              <input
                type="date"
                value={agreementDueDate}
                onChange={(e) => setAgreementDueDate(e.target.value)}
                className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-tertiary">
                Target Registration Date (Optional)
              </label>
              <input
                type="date"
                value={targetSettlementDate}
                onChange={(e) => setTargetSettlementDate(e.target.value)}
                className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-tertiary"
              />
            </div>
          </div>

          {/* Sq.ft Calculator */}
          <div className="bg-md-warning-container/50 rounded-[18px] p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-md-on-warning-container font-bold">
              <Calculator className="w-4 h-4 text-md-warning" />
              <span>Area &amp; Rate Calculator (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="min-w-0">
                <label className="text-xs text-md-on-surface-variant font-medium">
                  Total Area (sq.ft)
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
                  placeholder="e.g. 1200"
                  className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2 text-md-on-surface font-mono text-sm mt-1 outline-none focus:"
                />
              </div>
              <div className="min-w-0">
                <label className="text-xs text-md-on-surface-variant font-medium">
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
                  placeholder="e.g. 4500"
                  className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2 text-md-on-surface font-mono text-sm mt-1 outline-none focus:"
                />
              </div>
            </div>
          </div>

          {/* Buy Price */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface">
              Agreed Buy Price (₹)
            </label>
            <input
              type="number"
              value={agreedPurchasePrice || ""}
              onChange={(e) =>
                setAgreedPurchasePrice(parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-3 text-xl font-mono font-bold text-md-on-surface outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary focus:ring-2 focus:ring-md-primary/20"
              required
            />
            <div className="text-xs font-mono text-md-warning bg-md-warning-container rounded-lg px-3 py-1.5 font-semibold">
              {amountToVerbalSummary(agreedPurchasePrice)}
            </div>
          </div>

          {/* Commercial Sale Prices */}
          {type === "commercial" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-md-tertiary">
                  Target Sale Price (₹)
                </label>
                <input
                  type="number"
                  value={targetSalePrice || ""}
                  onChange={(e) =>
                    setTargetSalePrice(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Optional"
                  className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface font-mono text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-tertiary"
                />
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-md-positive">
                  Agreed Sale Price (₹)
                </label>
                <input
                  type="number"
                  value={agreedSellingPrice || ""}
                  onChange={(e) =>
                    setAgreedSellingPrice(parseFloat(e.target.value) || 0)
                  }
                  placeholder="If buyer finalized"
                  className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface font-mono text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary"
                />
              </div>
            </div>
          )}

          {/* Status & Document Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Current Status
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
                className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary truncate"
              >
                <option value="open">Open (Token / Advance Paid)</option>
                <option value="in_progress">In Progress (Paying)</option>
                <option value="registered">Registered</option>
                <option value="sold">Sold</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-md-on-surface-variant" />
                <span>Documents Link (Optional)</span>
              </label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="Google Drive / Dropbox URL"
                className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any helpful reminders about this property..."
              rows={2}
              className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-[18px] p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary resize-none"
            />
          </div>

          {/* Sub-Plots Inventory (Commercial Only) */}
          {type === "commercial" && (
            <div className="pt-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-md-primary" />
                  <label className="text-xs font-bold text-md-on-surface">
                    Sub-Plots ({subPlots.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddSubPlot}
                  className="btn-action-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
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
                      className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-md-surface-container dark:bg-md-surface-high p-2.5 rounded-[18px] items-center text-xs"
                    >
                      <input
                        type="text"
                        value={sp.plotNumber}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            plotNumber: e.target.value,
                          })
                        }
                        placeholder="Plot #"
                        className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1.5 text-md-on-surface font-mono font-bold"
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
                        className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1.5 text-md-on-surface font-mono"
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
                        className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1.5 text-md-on-surface font-mono font-semibold sm:col-span-2"
                      />
                      <select
                        value={sp.status}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            status: e.target.value as
                              | "available"
                              | "booked"
                              | "sold",
                          })
                        }
                        className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-1.5 py-1.5 text-xs font-semibold text-md-on-surface truncate"
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="sold">Sold</option>
                      </select>
                      <div className="flex items-center justify-end flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubPlot(idx)}
                          className="text-md-on-surface-variant hover:text-md-error p-1"
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
            <div className="pt-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-md-secondary" />
                  <label className="text-xs font-bold text-md-on-surface">
                    Joint Venture Partners ({partners.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddPartner}
                  className="btn-action-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
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
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-md-surface-container dark:bg-md-surface-high p-2.5 rounded-[18px] items-center text-xs"
                    >
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) =>
                          handleUpdatePartner(idx, { name: e.target.value })
                        }
                        placeholder="Partner Name"
                        className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1.5 text-md-on-surface font-semibold sm:col-span-2"
                      />
                      <div className="flex items-center gap-1 min-w-0">
                        <input
                          type="number"
                          value={p.equityPct ?? ""}
                          onChange={(e) =>
                            handleUpdatePartner(idx, {
                              equityPct: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="%"
                          className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1.5 text-md-on-surface font-mono font-bold"
                        />
                        <span className="text-md-on-surface-variant font-bold flex-shrink-0">
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-end flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemovePartner(idx)}
                          className="text-md-on-surface-variant hover:text-md-error p-1"
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-3 flex-wrap sm:flex-nowrap">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action-brand flex-1 py-2.5 rounded-[18px] text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving Property..." : "Save Property"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-action-secondary px-4 py-2.5 rounded-[18px] text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
