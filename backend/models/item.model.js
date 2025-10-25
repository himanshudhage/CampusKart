import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  creatorId: {
    type: mongoose.Types.ObjectId,
    ref: "Admin",
  },
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

export const Item = mongoose.model("Item", itemSchema);
