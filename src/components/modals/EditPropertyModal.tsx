"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Save,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Link2,
  ExternalLink,
  Users,
  Grid,
} from "lucide-react";
import { SeedProperty, SeedSubPlot, SeedPartner } from "@/lib/seedData";
import { formatINRCompact } from "@/lib/formatters";

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: SeedProperty | null;
  onSave: (propertyCode: string, updates: Partial<SeedProperty>) => Promise<void>;
}

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<SeedProperty>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        propertyCode: property.propertyCode || "",
        type: property.type || "commercial",
        location: property.location || "",
        acquisitionDate: property.acquisitionDate || "",
        agreementDueDate: property.agreementDueDate || "",
        targetSettlementDate: property.targetSettlementDate || "",
        attachmentUrl: property.attachmentUrl || "",
        sqftArea: property.sqftArea || 0,
        ratePerSqft: property.ratePerSqft || 0,
        agreedPurchasePrice: property.agreedPurchasePrice || 0,
        targetSalePrice: property.targetSalePrice || 0,
        agreedSellingPrice: property.agreedSellingPrice || 0,
        status: property.status || "open",
        notes: property.notes || "",
        milestones: property.milestones ? [...property.milestones] : [],
        subPlots: property.subPlots ? [...property.subPlots] : [],
        partners: property.partners ? [...property.partners] : [],
      });
      setErrorMsg("");
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg("Property name is required");
      return;
    }
    setErrorMsg("");
    setIsSaving(true);

    try {
      await onSave(property.propertyCode, formData);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to update property"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMilestone = () => {
    const current = formData.milestones || [];
    setFormData({
      ...formData,
      milestones: [
        ...current,
        {
          name: `Milestone ${current.length + 1}`,
          targetAmount: 0,
          paidAmount: 0,
          status: "pending",
        },
      ],
    });
  };

  const handleUpdateMilestone = (
    idx: number,
    updates: Partial<{
      name: string;
      targetAmount?: number;
      paidAmount?: number;
      status: "pending" | "in_progress" | "completed";
    }>
  ) => {
    const current = [...(formData.milestones || [])];
    current[idx] = { ...current[idx], ...updates };
    setFormData({ ...formData, milestones: current });
  };

  const handleRemoveMilestone = (idx: number) => {
    const current = [...(formData.milestones || [])];
    current.splice(idx, 1);
    setFormData({ ...formData, milestones: current });
  };

  const handleAddSubPlot = () => {
    const current = formData.subPlots || [];
    const nextNum = String(current.length + 1);
    setFormData({
      ...formData,
      subPlots: [
        ...current,
        {
          id: `plot-${Date.now()}-${nextNum}`,
          plotNumber: nextNum,
          sqftArea: 1200,
          targetPrice: 1500000,
          status: "available",
        },
      ],
    });
  };

  const handleUpdateSubPlot = (
    idx: number,
    updates: Partial<SeedSubPlot>
  ) => {
    const current = [...(formData.subPlots || [])];
    current[idx] = { ...current[idx], ...updates };
    setFormData({ ...formData, subPlots: current });
  };

  const handleRemoveSubPlot = (idx: number) => {
    const current = [...(formData.subPlots || [])];
    current.splice(idx, 1);
    setFormData({ ...formData, subPlots: current });
  };

  const handleAddPartner = () => {
    const current = formData.partners || [];
    setFormData({
      ...formData,
      partners: [
        ...current,
        {
          name: `Partner ${current.length + 1}`,
          equityPct: 20,
          capitalCommitted: 0,
        },
      ],
    });
  };

  const handleUpdatePartner = (
    idx: number,
    updates: Partial<SeedPartner>
  ) => {
    const current = [...(formData.partners || [])];
    current[idx] = { ...current[idx], ...updates };
    setFormData({ ...formData, partners: current });
  };

  const handleRemovePartner = (idx: number) => {
    const current = [...(formData.partners || [])];
    current.splice(idx, 1);
    setFormData({ ...formData, partners: current });
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-md-surface-lowest dark:bg-md-surface-container rounded-[24px] max-w-2xl w-full p-5 sm:p-6 shadow-m3-3 flex flex-col gap-5 my-auto max-h-[90vh] overflow-y-auto overflow-x-hidden animate-modal min-w-0"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-[18px] bg-md-primary-container text-md-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-md-on-surface tracking-tight flex items-center gap-2 flex-wrap">
                <span className="break-words">Edit Property: {property.name}</span>
                <span className="text-xs font-mono font-semibold text-md-on-surface-variant bg-md-surface-container px-2 py-0.5 rounded-md flex-shrink-0">
                  {property.propertyCode}
                </span>
              </h2>
              <p className="text-xs text-md-on-surface-variant mt-0.5">
                Update prices, area, status, sub-plots, partners, or milestones.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container p-1.5 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-md-error-container text-md-error text-xs px-3.5 py-2.5 rounded-[18px] font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Property / Plot Name
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary focus:ring-2 focus:ring-md-primary/20 min-w-0"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Category
              </label>
              <select
                value={formData.type || "commercial"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "commercial" | "personal",
                  })
                }
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
              >
                <option value="commercial">Business Land Deal</option>
                <option value="personal">Personal Home / Asset</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Location / Area
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-md-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. OMR Sholinganallur, Survey No. 442/1B"
                  className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] pl-10 pr-3.5 py-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Status
              </label>
              <select
                value={formData.status || "open"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as
                      | "open"
                      | "in_progress"
                      | "registered"
                      | "sold"
                      | "closed",
                  })
                }
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
              >
                <option value="open">Open (Token / Advance Paid)</option>
                <option value="in_progress">In Progress (Paying)</option>
                <option value="registered">Registered</option>
                <option value="sold">Sold</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Purchase / Token Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-md-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.acquisitionDate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      acquisitionDate: e.target.value,
                    })
                  }
                  className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] pl-10 pr-3.5 py-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-warning">
                Payment Due Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-md-warning absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.agreementDueDate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agreementDueDate: e.target.value,
                    })
                  }
                  className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] pl-10 pr-3.5 py-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus: min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-tertiary">
                Target Registration Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-md-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.targetSettlementDate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetSettlementDate: e.target.value,
                    })
                  }
                  className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] pl-10 pr-3.5 py-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-tertiary min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2 min-w-0">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-md-on-surface flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-md-on-surface-variant" />
                  <span>Documents Folder Link (Optional)</span>
                </label>
                {formData.attachmentUrl && (
                  <a
                    href={formData.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-md-tertiary hover:text-md-on-tertiary-container hover:underline flex items-center gap-1 font-medium"
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
                placeholder="https://drive.google.com/..."
                className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
              />
            </div>
          </div>

          {/* Section 2: Area & Rate */}
          <div className="pt-3">
            <h4 className="text-xs font-bold text-md-on-surface mb-2.5">
              Area &amp; Rate
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-md-on-surface-variant">
                  Total Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={formData.sqftArea ?? ""}
                  onChange={(e) => {
                    const sqft = parseFloat(e.target.value) || 0;
                    const rate = formData.ratePerSqft || 0;
                    setFormData({
                      ...formData,
                      sqftArea: sqft,
                      agreedPurchasePrice:
                        formData.agreedPurchasePrice ||
                        (rate > 0 ? sqft * rate : 0),
                    });
                  }}
                  placeholder="e.g. 5400"
                  className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface text-sm font-mono outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
                />
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-md-on-surface-variant">
                  Rate per sq.ft (₹)
                </label>
                <input
                  type="number"
                  value={formData.ratePerSqft ?? ""}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    const sqft = formData.sqftArea || 0;
                    setFormData({
                      ...formData,
                      ratePerSqft: rate,
                      agreedPurchasePrice:
                        formData.agreedPurchasePrice ||
                        (sqft > 0 ? sqft * rate : 0),
                    });
                  }}
                  placeholder="e.g. 4500"
                  className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface text-sm font-mono outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Prices */}
          <div className="pt-3">
            <h4 className="text-xs font-bold text-md-on-surface mb-2.5">
              Prices &amp; Valuation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-md-on-surface-variant">
                  Buy Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.agreedPurchasePrice ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agreedPurchasePrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface text-sm font-mono font-bold outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0"
                />
                <span className="text-xs text-md-positive font-mono font-semibold">
                  {formatINRCompact(formData.agreedPurchasePrice || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-md-tertiary">
                  Target Sale (₹)
                </label>
                <input
                  type="number"
                  value={formData.targetSalePrice ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetSalePrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface text-sm font-mono font-bold outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-tertiary min-w-0"
                />
                <span className="text-xs text-md-tertiary font-mono font-semibold">
                  {formatINRCompact(formData.targetSalePrice || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-md-warning">
                  Agreed Sale (₹)
                </label>
                <input
                  type="number"
                  value={formData.agreedSellingPrice ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agreedSellingPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Once buyer finalized"
                  className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface text-sm font-mono font-bold outline-none focus:bg-md-surface-lowest focus: min-w-0"
                />
                <span className="text-xs text-md-warning font-mono font-semibold">
                  {formData.agreedSellingPrice
                    ? formatINRCompact(formData.agreedSellingPrice)
                    : "Not set"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="pt-3 flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g. EC verified, agreement signed..."
              className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-[18px] px-3.5 py-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:ring-2 focus:ring-md-primary min-w-0 resize-none"
            />
          </div>

          {/* Section 5: Milestones */}
          <div className="pt-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-md-on-surface">
                Payment Milestones
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="btn-action-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {formData.milestones && formData.milestones.length > 0 ? (
              <div className="flex flex-col gap-2">
                {formData.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-md-surface-container dark:bg-md-surface-high p-2.5 rounded-[18px] min-w-0"
                  >
                    <input
                      type="checkbox"
                      checked={m.status === "completed"}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, {
                          status: e.target.checked ? "completed" : "pending",
                        })
                      }
                      className="rounded border-md-outline text-md-primary cursor-pointer w-4 h-4 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, { name: e.target.value })
                      }
                      placeholder="Milestone title"
                      className="flex-1 min-w-0 bg-transparent text-sm text-md-on-surface outline-none rounded-lg px-2 py-0.5 focus:ring-2 focus:ring-md-primary"
                    />
                    <input
                      type="number"
                      value={m.targetAmount ?? ""}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, {
                          targetAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="₹ Due"
                      className="w-24 sm:w-28 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1 text-sm font-mono text-right text-md-on-surface font-bold flex-shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-md-on-surface-variant hover:text-md-error p-1.5 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-md-on-surface-variant italic">
                No payment milestones yet.
              </div>
            )}
          </div>

          {/* Section 6: Sub-Plots */}
          <div className="pt-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-md-primary" />
                <label className="text-xs font-bold text-md-on-surface">
                  Sub-Plots ({formData.subPlots?.length || 0})
                </label>
              </div>
              <button
                type="button"
                onClick={handleAddSubPlot}
                className="btn-action-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sub-Plot</span>
              </button>
            </div>

            {formData.subPlots && formData.subPlots.length > 0 ? (
              <div className="flex flex-col gap-2">
                {formData.subPlots.map((sp, idx) => (
                  <div
                    key={sp.id || idx}
                    className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-md-surface-container dark:bg-md-surface-high p-2.5 rounded-[18px] items-center text-xs min-w-0"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-md-on-surface-variant font-mono flex-shrink-0">
                        #
                      </span>
                      <input
                        type="text"
                        value={sp.plotNumber}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            plotNumber: e.target.value,
                          })
                        }
                        placeholder="No"
                        className="w-full sm:w-16 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1 text-md-on-surface font-mono font-bold min-w-0"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] text-md-on-surface-variant">Sqft</span>
                      <input
                        type="number"
                        value={sp.sqftArea ?? ""}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            sqftArea: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="Sq.ft"
                        className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1 text-md-on-surface font-mono min-w-0"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 sm:col-span-2 min-w-0">
                      <span className="text-[10px] text-md-on-surface-variant">
                        Target Price (₹)
                      </span>
                      <input
                        type="number"
                        value={sp.targetPrice ?? ""}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            targetPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="Target Price"
                        className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1 text-md-on-surface font-mono font-semibold min-w-0"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] text-md-on-surface-variant">Status</span>
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
                        className={`w-full bg-md-surface-container dark:bg-md-surface-high rounded-lg px-1.5 py-1 text-xs font-semibold min-w-0 ${ sp.status === "sold" ? "text-md-positive" : sp.status === "booked" ? "text-md-warning" : "text-md-on-surface-variant" }`}
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end min-w-0">
                      <input
                        type="text"
                        value={sp.buyerName || ""}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            buyerName: e.target.value,
                          })
                        }
                        placeholder="Buyer"
                        className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1 text-md-on-surface text-xs min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubPlot(idx)}
                        className="text-md-on-surface-variant hover:text-md-error p-1 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-md-on-surface-variant italic">
                No sub-plots added.
              </div>
            )}
          </div>

          {/* Section 7: Partners */}
          <div className="pt-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-md-secondary" />
                <label className="text-xs font-bold text-md-on-surface">
                  Joint Venture Partners ({formData.partners?.length || 0})
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

            {formData.partners && formData.partners.length > 0 ? (
              <div className="flex flex-col gap-2">
                {formData.partners.map((p, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-md-surface-container dark:bg-md-surface-high p-2.5 rounded-[18px] items-center text-xs min-w-0"
                  >
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) =>
                        handleUpdatePartner(idx, { name: e.target.value })
                      }
                      placeholder="Partner Name"
                      className="w-full bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1.5 text-md-on-surface text-xs font-semibold sm:col-span-2 min-w-0"
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
                        className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1.5 text-md-on-surface text-xs font-mono font-bold"
                      />
                      <span className="text-md-on-surface-variant font-bold flex-shrink-0">
                        %
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end min-w-0">
                      <input
                        type="number"
                        value={p.capitalCommitted ?? ""}
                        onChange={(e) =>
                          handleUpdatePartner(idx, {
                            capitalCommitted: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="₹ Committed"
                        className="w-full min-w-0 bg-md-surface-container dark:bg-md-surface-high rounded-lg px-2 py-1.5 text-md-on-surface text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePartner(idx)}
                        className="text-md-on-surface-variant hover:text-md-error p-1 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-md-on-surface-variant italic">
                100% single ownership (no partners added).
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 mt-1 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="btn-action-secondary px-4 py-2.5 rounded-[18px] text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-action-brand px-5 py-2.5 rounded-[18px] text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
