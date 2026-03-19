import mongoose, { Schema } from "mongoose";

const shipmentSchema = new Schema(
  {
    batchId: {
      type: String,
      required: true,
      index: true,
    },

    from: {
      type: String, // wallet address
      required: true,
      lowercase: true,
    },

    to: {
      type: String, // wallet address
      required: true,
      lowercase: true,
    },

    location: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["InTransit", "Delivered", "Delayed", "Damaged"],
      required: true,
    },

    transactionHash: {
      type: String,
      required: true,
      index: true,
    },

    timestamp: {
      type: Number, // UNIX timestamp (sync with blockchain)
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shipment = mongoose.model("Shipment", shipmentSchema);