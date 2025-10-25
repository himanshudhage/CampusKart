import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  itemId: {
    type: mongoose.Types.ObjectId,
    ref: "Item",
  },
});

export const Purchase = mongoose.model("Purchase", purchaseSchema);