import { Item } from "../models/item.model.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/purchase.model.js";

export const createItem = async (req, res) => {
  const adminId = req.adminId;
  const { title, description, price } = req.body;
  console.log(title, description, price);

  try {
    if (!title || !description || !price) {
      return res.status(400).json({ errors: "All fields are required" });
    }
    const { image } = req.files;
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ errors: "No file uploaded" });
    }

    const allowedFormat = ["image/png", "image/jpeg"]; 
    if (!allowedFormat.includes(image.mimetype)) {
      return res
        .status(400)
        .json({ errors: "Invalid file format. Only PNG and JPG are allowed" });
    }

    // claudinary code
    const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);
    if (!cloud_response || cloud_response.error) {
      return res
        .status(400)
        .json({ errors: "Error uploading file to cloudinary" });
    }

    const itemData = {
      title,
      description,
      price,
      image: {
        public_id: cloud_response.public_id,
        url: cloud_response.url,
      },
      creatorId: adminId,
    };
    const item = await Item.create(itemData);
    res.json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating item" });
  }
};

export const updateItem = async (req, res) => {
  const adminId = req.adminId;
  const { itemId } = req.params;
  const { title, description, price, image } = req.body;
  try {
    const itemSearch = await Item.findById(itemId);
    if (!itemSearch) {
      return res.status(404).json({ errors: "Item not found" });
    }
    const item = await Item.findOneAndUpdate(
      {
        _id: itemId,
        creatorId: adminId,
      },
      {
        title,
        description,
        price,
        image: {
          public_id: image?.public_id,
          url: image?.url,
        },
      }
    );
    if (!item) {
      return res
        .status(404)
        .json({ errors: "can't update, created by other admin" });
    }
    res.status(201).json({ message: "Item updated successfully", item });
  } catch (error) {
    res.status(500).json({ errors: "Error in item updating" });
    console.log("Error in item updating ", error);
  }
};

export const deleteItem = async (req, res) => {
  const adminId = req.adminId;
  const { itemId } = req.params;
  try {
    const item = await Item.findOneAndDelete({
      _id: itemId,
      creatorId: adminId,
    });
    if (!item) {
      return res
        .status(404)
        .json({ errors: "can't delete, created by other admin" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in item deleting" });
    console.log("Error in item deleting", error);
  }
};

export const getItems = async (req, res) => {
  try {
    const items = await Item.find({}).populate('creatorId', 'firstName lastName email');
    
    // Check which items are already purchased and add default dates for items without createdAt
    const itemsWithPurchaseStatus = await Promise.all(
      items.map(async (item) => {
        const purchase = await Purchase.findOne({ itemId: item._id });
        
        // If item doesn't have createdAt, add a default date (1 day ago)
        if (!item.createdAt) {
          const defaultDate = new Date();
          defaultDate.setDate(defaultDate.getDate() - 1);
          item.createdAt = defaultDate;
        }
        
        return {
          ...item.toObject(),
          isPurchased: !!purchase,
          purchasedBy: purchase ? purchase.userId : null
        };
      })
    );
    
    res.status(201).json({ items: itemsWithPurchaseStatus });
  } catch (error) {
    res.status(500).json({ errors: "Error in getting items" });
    console.log("error to get items", error);
  }
};

export const itemDetails = async (req, res) => {
  const { itemId } = req.params;
  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json({ item });
  } catch (error) {
    res.status(500).json({ errors: "Error in getting item details" });
    console.log("Error in item details", error);
  }
};

import Stripe from "stripe";
import config from "../config.js";
const stripe = new Stripe(config.STRIPE_SECRET_KEY);
console.log(config.STRIPE_SECRET_KEY);
export const buyItems = async (req, res) => {
  const { userId } = req;
  const { itemId } = req.params;

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ errors: "Item not found" });
    }
    
    // Check if this specific user has already purchased this item
    const existingUserPurchase = await Purchase.findOne({ userId, itemId });
    if (existingUserPurchase) {
      return res 
        .status(400)
        .json({ errors: "You have already purchased this item" });
    }
    
    // Check if ANY user has already purchased this item (since it's a used item)
    const existingPurchase = await Purchase.findOne({ itemId });
    if (existingPurchase) {
      return res 
        .status(400)
        .json({ errors: "This item has already been sold to another user" });
    }

    // stripe payment code goes here!!
    const amount = item.price * 100; // Convert to cents for Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(201).json({
      message: "Item purchased successfully",
      item,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ errors: "Error in item buying" });
    console.log("error in item buying ", error);
  }
};
