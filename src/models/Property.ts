import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMilestone {
  name: string;
  targetAmount?: number;
  paidAmount?: number;
  dueDate?: Date;
  status: "pending" | "in_progress" | "completed";
  remarks?: string;
}

export interface ISubPlot {
  id: string;
  plotNumber: string;
  sqftArea: number;
  ratePerSqft?: number;
  targetPrice: number;
  status: "available" | "booked" | "sold";
  buyerName?: string;
  notes?: string;
}

export interface IPartner {
  name: string;
  equityPct: number;
  capitalCommitted?: number;
  notes?: string;
}

export interface IProperty extends Document {
  userId: string;
  datasetId?: string;
  type: "commercial" | "personal";
  propertyCode: string;
  name: string;
  location?: string;
  acquisitionDate?: Date;
  sqftArea?: number;
  ratePerSqft?: number;
  agreedPurchasePrice: number;
  targetSalePrice?: number;
  agreedSellingPrice?: number;
  status: "open" | "in_progress" | "registered" | "sold" | "closed";
  milestones?: IMilestone[];
  agreementDueDate?: Date;
  targetSettlementDate?: Date;
  attachmentUrl?: string;
  subPlots?: ISubPlot[];
  partners?: IPartner[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    name: { type: String, required: true },
    targetAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    remarks: { type: String },
  },
  { _id: false }
);

const SubPlotSchema = new Schema<ISubPlot>(
  {
    id: { type: String, required: true },
    plotNumber: { type: String, required: true },
    sqftArea: { type: Number, required: true, default: 0 },
    ratePerSqft: { type: Number, default: 0 },
    targetPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["available", "booked", "sold"],
      default: "available",
    },
    buyerName: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const PartnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true },
    equityPct: { type: Number, required: true, default: 0 },
    capitalCommitted: { type: Number, default: 0 },
    notes: { type: String },
  },
  { _id: false }
);

const PropertySchema = new Schema<IProperty>(
  {
    userId: { type: String, required: true, index: true },
    datasetId: { type: String, default: "", index: true },
    type: {
      type: String,
      enum: ["commercial", "personal"],
      required: true,
      index: true,
    },
    propertyCode: { type: String, required: true, index: true },
    name: { type: String, required: true },
    location: { type: String },
    acquisitionDate: { type: Date },
    sqftArea: { type: Number, default: 0 },
    ratePerSqft: { type: Number, default: 0 },
    agreedPurchasePrice: { type: Number, required: true, default: 0 },
    targetSalePrice: { type: Number, default: 0 },
    agreedSellingPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "in_progress", "registered", "sold", "closed"],
      default: "open",
    },
    milestones: [MilestoneSchema],
    agreementDueDate: { type: Date },
    targetSettlementDate: { type: Date },
    attachmentUrl: { type: String },
    subPlots: [SubPlotSchema],
    partners: [PartnerSchema],
    notes: { type: String },
  },
  { timestamps: true }
);

// High performance compound indexes
PropertySchema.index({ datasetId: 1, type: 1, status: 1 });
PropertySchema.index({ datasetId: 1, propertyCode: 1 });

export const Property: Model<IProperty> =
  mongoose.models.Property ||
  mongoose.model<IProperty>("Property", PropertySchema);
