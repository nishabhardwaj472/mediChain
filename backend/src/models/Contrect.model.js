import mongoose, { Schema } from "mongoose";

const medicineSchema = new Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    manufacturerName: {
      type: String,
      required: true,
    },

    licenseNo: String,

    quantity: Number,

    manufactureDate: Number, // UNIX timestamp
    expiryDate: Number, // UNIX timestamp

    description: String,

    manufacturer: {
      type: String,
      lowercase: true,
      index: true,
    },

    currentHolder: {
      type: String,
      lowercase: true,
      index: true,
    },

    ownerRole: {
      type: String,
      enum: ["Manufacturer", "Distributor", "Pharmacy"],
      default: "Manufacturer",
    },

    qrHash: {
      type: String,
      index: true,
    },

    qrDataString: String,

    imageUrl: String,

    status: {
      type: String,
      enum: ["Registered", "InTransit", "Delivered"],
      default: "Registered",
    },

    history: [
      {
        from: { type: String, lowercase: true },
        to: { type: String, lowercase: true },
        location: String,
        status: String,
        timestamp: Number, // UNIX (sync with blockchain)
        transactionHash: String,
      },
    ],
  },
  { timestamps: true }
);

export const Medicine = mongoose.model("Medicine", medicineSchema);