import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  email: String,
  userId: String,
  itemId: String,
  paymentId: String,
  amount: Number,
  status: String, // Payment status (succeeded, failed, etc.)
  phone: String,
  address: String,
  delivered: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

export const Order = mongoose.model("Order", orderSchema);