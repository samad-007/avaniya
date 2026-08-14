import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDataset extends Document {
  datasetId: string;
  name: string;
  description?: string;
  assignedUserIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DatasetSchema = new Schema<IDataset>(
  {
    datasetId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    assignedUserIds: [{ type: String }],
  },
  { timestamps: true }
);

export const Dataset: Model<IDataset> =
  mongoose.models.Dataset || mongoose.model<IDataset>("Dataset", DatasetSchema);
