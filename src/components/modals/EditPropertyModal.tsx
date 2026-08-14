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
        status: property.status || "open",
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

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-5 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Edit Property: {property.name}</span>
                <span className="text-xs font-mono font-semibold text-[#A1A1AA] bg-[#161616] border border-[#262626] px-2 py-0.5 rounded">
                  {property.propertyCode}
                </span>
              </h2>
              <p className="text-xs text-[#A1A1AA] font-medium">
                Update valuations, price consideration, land area, status, and milestone stages
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white p-1 rounded-md transition-standard"
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Property / Deal Name
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
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
                className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555]"
              >
                <option value="commercial">Commercial Land / Joint Venture</option>
                <option value="personal">Personal Apartment / Villa</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
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
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Current Deal Status
              </label>
              <select
                value={formData.status || "open"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555]"
              >
                <option value="open">Open (Token / Advance Paid)</option>
                <option value="in_progress">In Progress (Partially Paid)</option>
                <option value="registered">Registered / Sale Deed Transferred</option>
                <option value="sold">Sold (Receivables Collecting/Settled)</option>
                <option value="closed">Closed Deal</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
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
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Area & Rate */}
          <div className="pt-3 border-t border-[#1a1a1a]">
            <h4 className="text-xs font-bold text-[#E4E4E7] uppercase tracking-wider mb-2.5">
              Land Measurement &amp; Unit Rates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
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
                  className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono outline-none focus:border-[#555555]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
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
                  className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono outline-none focus:border-[#555555]"
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
              <div className="flex flex-col gap-1.5">
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
                  className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono font-bold outline-none focus:border-[#555555]"
                />
                <span className="text-xs text-[#22C55E] font-mono font-semibold">
                  {formatINRCompact(formData.agreedPurchasePrice || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
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
                  className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono font-bold outline-none focus:border-[#555555]"
                />
                <span className="text-xs text-[#3B82F6] font-mono font-semibold">
                  {formatINRCompact(formData.targetSalePrice || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
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
                  className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm font-mono font-bold outline-none focus:border-[#555555]"
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
          <div className="pt-3 border-t border-[#1a1a1a] flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Legal, EC &amp; Title Verification Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Encumbrance certificate clear for 30 years. Agreement signed with seller."
              className="bg-[#111111] border border-[#262626] rounded-lg px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555]"
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
                className="text-xs text-white hover:text-[#22C55E] flex items-center gap-1.5 transition-standard font-semibold"
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
                    className="flex items-center gap-2.5 bg-[#121212] border border-[#262626] p-2.5 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={m.status === "completed"}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, {
                          status: e.target.checked ? "completed" : "pending",
                        })
                      }
                      className="rounded bg-black border-[#444444] cursor-pointer w-4 h-4"
                    />
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, { name: e.target.value })
                      }
                      placeholder="Milestone title"
                      className="flex-1 bg-transparent text-sm text-white outline-none border-b border-transparent focus:border-[#555555]"
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
                      className="w-28 bg-[#181818] border border-[#282828] rounded-md px-2 py-1 text-sm font-mono text-right text-white font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-[#71717A] hover:text-rose-400 p-1.5 transition-standard"
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-[#262626] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#141414] text-white text-xs sm:text-sm font-medium border border-[#282828] hover:bg-[#202020] transition-standard"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-white text-black text-xs sm:text-sm font-semibold hover:bg-[#e0e0e0] flex items-center gap-1.5 transition-standard disabled:opacity-50"
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
