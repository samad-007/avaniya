"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, Save, Trash2, Plus, Calendar, MapPin, Link2, ExternalLink, Users, Grid } from "lucide-react";
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
      setErrorMsg("Property deal name is required");
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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-2xl w-full max-w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4 sm:gap-5 my-auto max-h-[90vh] overflow-y-auto overflow-x-hidden animate-modal min-w-0"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-[#262626] gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span className="break-words">Edit Property: {property.name}</span>
                <span className="text-xs font-mono font-semibold text-[#A1A1AA] bg-[#161616] border border-[#262626] px-2 py-0.5 rounded flex-shrink-0">
                  {property.propertyCode}
                </span>
              </h2>
              <p className="text-xs text-[#A1A1AA] font-medium break-words mt-0.5">
                Update valuations, price consideration, land area, status, and milestone stages
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white p-1 rounded-md transition-all duration-150 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs px-3.5 py-2 rounded-md font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Property / Deal Name
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Asset Classification
              </label>
              <select
                value={formData.type || "commercial"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "commercial" | "personal",
                  })
                }
                className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0"
              >
                <option value="commercial">Commercial Land / Joint Venture</option>
                <option value="personal">Personal Apartment / Villa</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Location / Survey District
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. OMR Sholinganallur, Survey No. 442/1B"
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Current Deal Status
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
                className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0"
              >
                <option value="open">Open (Token / Advance Paid)</option>
                <option value="in_progress">In Progress (Partially Paid)</option>
                <option value="registered">Registered / Sale Deed Transferred</option>
                <option value="sold">Sold (Receivables Collecting/Settled)</option>
                <option value="closed">Closed Deal</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Acquisition / Token Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.acquisitionDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, acquisitionDate: e.target.value })
                  }
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Agreement Due Date / Deadline
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.agreementDueDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, agreementDueDate: e.target.value })
                  }
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3.5 py-2.5 text-white text-sm outline-none focus:border-amber-500 min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Target Settlement / Exit Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.targetSettlementDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, targetSettlementDate: e.target.value })
                  }
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3.5 py-2.5 text-white text-sm outline-none focus:border-blue-500 min-w-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2 min-w-0">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span>Document / Title Proof URL (Google Drive / Cloud)</span>
                </label>
                {formData.attachmentUrl && (
                  <a
                    href={formData.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
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
                placeholder="https://drive.google.com/... or Dropbox folder"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0"
              />
            </div>
          </div>

          {/* Section 2: Area & Rate */}
          <div className="pt-3 border-t border-[#1a1a1a]">
            <h4 className="text-xs font-bold text-[#E4E4E7] uppercase tracking-wider mb-2.5">
              Land Measurement &amp; Unit Rates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-[#A1A1AA]">
                  Total Area (Sq.Ft / Cents / Acres)
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
                        formData.agreedPurchasePrice || (rate > 0 ? sqft * rate : 0),
                    });
                  }}
                  placeholder="e.g. 5400"
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono outline-none focus:border-[#555555] min-w-0"
                />
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-[#A1A1AA]">
                  Rate per Sq.Ft (₹)
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
                        formData.agreedPurchasePrice || (sqft > 0 ? sqft * rate : 0),
                    });
                  }}
                  placeholder="e.g. 4500"
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono outline-none focus:border-[#555555] min-w-0"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Valuations & Prices */}
          <div className="pt-3 border-t border-[#1a1a1a]">
            <h4 className="text-xs font-bold text-[#E4E4E7] uppercase tracking-wider mb-2.5">
              Financial Valuations &amp; Agreed Prices
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-[#A1A1AA]">
                  Agreed Purchase Price (₹)
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
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono font-bold outline-none focus:border-[#555555] min-w-0"
                />
                <span className="text-xs text-[#22C55E] font-mono font-semibold">
                  {formatINRCompact(formData.agreedPurchasePrice || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-[#A1A1AA]">
                  Target Selling Price (₹)
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
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono font-bold outline-none focus:border-[#555555] min-w-0"
                />
                <span className="text-xs text-[#3B82F6] font-mono font-semibold">
                  {formatINRCompact(formData.targetSalePrice || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-medium text-[#A1A1AA]">
                  Agreed Selling Price (₹)
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
                  placeholder="Set once buyer is finalized"
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono font-bold outline-none focus:border-[#555555] min-w-0"
                />
                <span className="text-xs text-[#F59E0B] font-mono font-semibold">
                  {formData.agreedSellingPrice
                    ? formatINRCompact(formData.agreedSellingPrice)
                    : "Not finalized"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="pt-3 border-t border-[#1a1a1a] flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Legal, EC &amp; Title Verification Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Encumbrance certificate clear for 30 years. Agreement signed with seller."
              className="w-full bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555] min-w-0 resize-none"
            />
          </div>

          {/* Section 5: Milestones */}
          <div className="pt-3 border-t border-[#1a1a1a] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#E4E4E7] uppercase tracking-wider">
                Payment &amp; Construction Milestones
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="btn-action-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
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
                    className="flex items-center gap-2 bg-[#121212] border border-[#262626] p-2.5 rounded-lg min-w-0"
                  >
                    <input
                      type="checkbox"
                      checked={m.status === "completed"}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, {
                          status: e.target.checked ? "completed" : "pending",
                        })
                      }
                      className="rounded bg-black border-[#444444] cursor-pointer w-4 h-4 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, { name: e.target.value })
                      }
                      placeholder="Milestone title"
                      className="flex-1 min-w-0 bg-transparent text-sm text-white outline-none border-b border-transparent focus:border-[#555555]"
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
                      className="w-24 sm:w-28 bg-[#181818] border border-[#282828] rounded-md px-2 py-1 text-sm font-mono text-right text-white font-bold flex-shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-[#71717A] hover:text-rose-400 p-1.5 transition-all duration-150 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#A1A1AA] italic">
                No custom milestones defined yet. Click "Add Milestone" to track payment stages.
              </div>
            )}
          </div>

          {/* Section 6: Sub-Plot Inventory & Layout Plotting Engine */}
          <div className="pt-3 border-t border-[#1a1a1a] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-emerald-400" />
                <label className="text-xs font-bold text-[#E4E4E7] uppercase tracking-wider">
                  Sub-Plots Inventory ({formData.subPlots?.length || 0} Units)
                </label>
              </div>
              <button
                type="button"
                onClick={handleAddSubPlot}
                className="btn-action-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
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
                    className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-[#121212] border border-[#262626] p-2.5 rounded-lg items-center text-xs min-w-0"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[#71717A] font-mono flex-shrink-0">#</span>
                      <input
                        type="text"
                        value={sp.plotNumber}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, { plotNumber: e.target.value })
                        }
                        placeholder="Plot No"
                        className="w-full sm:w-16 bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white font-mono font-bold min-w-0"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] text-[#71717A]">Sqft</span>
                      <input
                        type="number"
                        value={sp.sqftArea ?? ""}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            sqftArea: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="Sq.ft"
                        className="w-full bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white font-mono min-w-0"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 sm:col-span-2 min-w-0">
                      <span className="text-[10px] text-[#71717A]">Target Price (₹)</span>
                      <input
                        type="number"
                        value={sp.targetPrice ?? ""}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            targetPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="Target Price"
                        className="w-full bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white font-mono font-semibold min-w-0"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] text-[#71717A]">Status</span>
                      <select
                        value={sp.status}
                        onChange={(e) =>
                          handleUpdateSubPlot(idx, {
                            status: e.target.value as "available" | "booked" | "sold",
                          })
                        }
                        className={`w-full bg-[#1a1a1a] border border-[#333333] rounded px-1.5 py-1 text-xs font-semibold min-w-0 ${
                          sp.status === "sold"
                            ? "text-emerald-400"
                            : sp.status === "booked"
                            ? "text-amber-400"
                            : "text-[#A1A1AA]"
                        }`}
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
                          handleUpdateSubPlot(idx, { buyerName: e.target.value })
                        }
                        placeholder="Buyer name"
                        className="w-full bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white text-xs min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubPlot(idx)}
                        className="text-[#71717A] hover:text-rose-400 p-1 transition-all duration-150 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#A1A1AA] italic">
                No sub-plots created. Click "Add Sub-Plot" to plot units or layout layouts.
              </div>
            )}
          </div>

          {/* Section 7: Multi-Partner Joint Venture (JV) Equity Splitter */}
          <div className="pt-3 border-t border-[#1a1a1a] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <label className="text-xs font-bold text-[#E4E4E7] uppercase tracking-wider">
                  Joint Venture (JV) Partners ({formData.partners?.length || 0})
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

            {formData.partners && formData.partners.length > 0 ? (
              <div className="flex flex-col gap-2">
                {formData.partners.map((p, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-[#121212] border border-[#262626] p-2.5 rounded-lg items-center text-xs min-w-0"
                  >
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) =>
                        handleUpdatePartner(idx, { name: e.target.value })
                      }
                      placeholder="Partner Name"
                      className="w-full bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white text-xs font-semibold sm:col-span-2 min-w-0"
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
                        placeholder="Equity %"
                        className="w-full min-w-0 bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white text-xs font-mono font-bold"
                      />
                      <span className="text-[#71717A] font-bold flex-shrink-0">%</span>
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
                        className="w-full min-w-0 bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-white text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePartner(idx)}
                        className="text-[#71717A] hover:text-rose-400 p-1 transition-all duration-150 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#A1A1AA] italic">
                No external JV partners tagged (100% single ownership). Click "Add Partner" to set up equity splits.
              </div>
            )}
          </div>

          {/* Actions (Key Action: Save Property Details with Hover-to-White) */}
          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-[#262626] mt-2 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#141414] text-white text-xs sm:text-sm font-medium border border-[#282828] hover:bg-[#202020] transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-action-primary px-5 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Changes..." : "Save Property Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
