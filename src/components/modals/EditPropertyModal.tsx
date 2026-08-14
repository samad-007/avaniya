"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, IndianRupee, Save, Trash2, Plus, Calendar, MapPin, Tag } from "lucide-react";
import { SeedProperty } from "@/lib/seedData";
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
        sqftArea: property.sqftArea || 0,
        ratePerSqft: property.ratePerSqft || 0,
        agreedPurchasePrice: property.agreedPurchasePrice || 0,
        targetSalePrice: property.targetSalePrice || 0,
        agreedSellingPrice: property.agreedSellingPrice || 0,
        status: property.status || "under_acquisition",
        notes: property.notes || "",
        milestones: property.milestones ? [...property.milestones] : [],
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
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update property");
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
          title: `Milestone ${current.length + 1}`,
          targetDate: new Date().toISOString().split("T")[0],
          completed: false,
          amountDue: 0,
        },
      ],
    });
  };

  const handleUpdateMilestone = (idx: number, updates: any) => {
    const current = [...(formData.milestones || [])];
    current[idx] = { ...current[idx], ...updates };
    setFormData({ ...formData, milestones: current });
  };

  const handleRemoveMilestone = (idx: number) => {
    const current = [...(formData.milestones || [])];
    current.splice(idx, 1);
    setFormData({ ...formData, milestones: current });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-5 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Edit Property: {property.name}</span>
                <span className="text-[10px] font-mono text-[#888888] bg-[#161616] border border-[#2a2a2a] px-1.5 py-0.5 rounded">
                  {property.propertyCode}
                </span>
              </h2>
              <p className="text-xs text-[#777777]">
                Update all valuation, price, area, status, and milestone data points
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#666666] hover:text-white transition-standard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs px-3 py-2 rounded-md">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                Property / Deal Name
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
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
                className="bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
              >
                <option value="commercial">Commercial Land / Joint Venture</option>
                <option value="personal">Personal Apartment / Villa</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                Location / Survey District
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. OMR Sholinganallur, Survey No. 442/1B"
                  className="w-full bg-[#111111] border border-[#222222] rounded-md pl-8 pr-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                Current Deal Status
              </label>
              <select
                value={formData.status || "under_acquisition"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                className="bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
              >
                <option value="under_acquisition">Under Acquisition (Token / Advance)</option>
                <option value="holding">Holding / Land Aggregation</option>
                <option value="development">Under Development / Layout</option>
                <option value="ready_for_sale">Ready for Sale / Marketing</option>
                <option value="sold">Sold (Collecting Receivables)</option>
                <option value="completed">Completed / Settled</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                Acquisition / Token Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.acquisitionDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, acquisitionDate: e.target.value })
                  }
                  className="w-full bg-[#111111] border border-[#222222] rounded-md pl-8 pr-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Area & Rate */}
          <div className="pt-2 border-t border-[#1a1a1a]">
            <h4 className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-2.5">
              Land Measurement &amp; Unit Rates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#888888]">
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
                  className="bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#888888]">
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
                  className="bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Valuations & Prices */}
          <div className="pt-2 border-t border-[#1a1a1a]">
            <h4 className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-2.5">
              Financial Valuations &amp; Agreed Prices
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#888888]">
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
                  className="bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
                />
                <span className="text-[10px] text-[#22C55E] font-mono">
                  {formatINRCompact(formData.agreedPurchasePrice || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#888888]">
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
                  className="bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
                />
                <span className="text-[10px] text-[#3B82F6] font-mono">
                  {formatINRCompact(formData.targetSalePrice || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#888888]">
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
                  className="bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
                />
                <span className="text-[10px] text-[#F59E0B] font-mono">
                  {formData.agreedSellingPrice
                    ? formatINRCompact(formData.agreedSellingPrice)
                    : "Not finalized"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="pt-2 border-t border-[#1a1a1a] flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
              Legal, EC &amp; Title Verification Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Encumbrance certificate clear for 30 years. Agreement signed with seller."
              className="bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-white text-xs outline-none focus:border-[#555555]"
            />
          </div>

          {/* Section 5: Milestones */}
          <div className="pt-2 border-t border-[#1a1a1a] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wider">
                Payment &amp; Construction Milestones
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="text-[11px] text-white hover:text-[#22C55E] flex items-center gap-1 transition-standard font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>Add Milestone</span>
              </button>
            </div>

            {formData.milestones && formData.milestones.length > 0 ? (
              <div className="flex flex-col gap-2">
                {formData.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-[#121212] border border-[#222222] p-2 rounded-md"
                  >
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, { completed: e.target.checked })
                      }
                      className="rounded bg-black border-[#444444]"
                    />
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, { title: e.target.value })
                      }
                      placeholder="Milestone title"
                      className="flex-1 bg-transparent text-xs text-white outline-none border-b border-transparent focus:border-[#444444]"
                    />
                    <input
                      type="number"
                      value={m.amountDue ?? ""}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, {
                          amountDue: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="₹ Due"
                      className="w-24 bg-[#181818] border border-[#282828] rounded px-1.5 py-0.5 text-xs text-right text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-[#666666] hover:text-rose-400 p-1 transition-standard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-[#666666] italic">
                No custom milestones defined yet. Click "Add Milestone" to track payment stages.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded bg-[#141414] text-white text-xs border border-[#282828] hover:bg-[#202020] transition-standard"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded bg-white text-black text-xs font-semibold hover:bg-[#e0e0e0] flex items-center gap-1.5 transition-standard disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving Changes..." : "Save Property Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
