import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../config.js";
import { Purchase } from "../models/purchase.model.js";
import { Item } from "../models/item.model.js";
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userSchema = z.object({
    firstName: z
      .string()
      .min(3, { message: "firstName must be atleast 3 char long" }),
    lastName: z
      .string()
      .min(3, { message: "lastName must be atleast 3 char long" }),
    email: z.string().email().refine((email) => {
      const emailPattern = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@walchandsangli\.ac\.in$/;
      return emailPattern.test(email);
    }, { message: "Email must be in format: xyz.xyz@walchandsangli.ac.in (where xyz can be anything)" }),
    password: z
      .string()
      .min(6, { message: "password must be atleast 6 char long" }),
  });

  const validatedData = userSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res
      .status(400)
      .json({ errors: validatedData.error.issues.map((err) => err.message) });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ errors: "User already exists" });
    }
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "Signup succeedded", newUser });
  } catch (error) {
    res.status(500).json({ errors: "Error in signup" });
    console.log("Error in signup", error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);
  try {
    const user = await User.findOne({ email: email });
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      console.log("No user found with email:", email);
      return res.status(403).json({ errors: "Invalid credentials" });
    }
    
    console.log("Comparing password...");
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log("Password correct:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log("Password incorrect for user:", email);
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // jwt code
    const token = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_USER_PASSWORD,
      { expiresIn: "1d" }
    );
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true, //  can't be accsed via js directly
      secure: process.env.NODE_ENV === "production", // true for https only
      sameSite: "Strict", // CSRF attacks
    };
    res.cookie("jwt", token, cookieOptions);
    res.status(201).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ errors: "Error in login" });
    console.log("error in login", error);
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in logout" });
    console.log("Error in logout", error);
  }
};

// Debug endpoint to check users
export const debugUsers = async (req, res) => {
  try {
    const users = await User.find({});
    console.log("All users in database:", users);
    res.json({ 
      message: "Debug info", 
      userCount: users.length,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }))
    });
  } catch (error) {
    console.log("Error fetching users:", error);
    res.status(500).json({ errors: "Error fetching users" });
  }
};

export const purchases = async (req, res) => {
  const userId = req.userId;

  try {
    const purchased = await Purchase.find({ userId });

    let purchasedItemId = [];

    for (let i = 0; i < purchased.length; i++) {
      purchasedItemId.push(purchased[i].itemId);
    }
    const itemData = await Item.find({
      _id: { $in: purchasedItemId },
    });

    res.status(200).json({ purchased, itemData });
  } catch (error) {
    res.status(500).json({ errors: "Error in purchases" });
    console.log("Error in purchase", error);
  }
};

export const getAwaitingPickup = async (req, res) => {
  const userId = req.userId;

  try {
    // Import Order model
    const { Order } = await import("../models/order.model.js");
    const { Purchase } = await import("../models/purchase.model.js");
    const { Item } = await import("../models/item.model.js");

    // Get all purchases for this user
    const purchased = await Purchase.find({ userId });
    const purchasedItemIds = purchased.map(p => p.itemId);

    // Get orders for these items that are not delivered
    const awaitingOrders = await Order.find({
      userId: userId,
      itemId: { $in: purchasedItemIds },
      delivered: false
    });

    // Get item data for awaiting orders
    const itemIds = awaitingOrders.map(order => order.itemId);
    const itemData = await Item.find({
      _id: { $in: itemIds },
    });

    // Combine order and item data
    const awaitingPickupData = itemData.map(item => {
      const order = awaitingOrders.find(o => o.itemId === item._id.toString());
      return {
        ...item.toObject(),
        order: order
      };
    });

    res.status(200).json({ awaitingPickupData });
  } catch (error) {
    res.status(500).json({ errors: "Error fetching awaiting pickup data" });
    console.log("Error in getAwaitingPickup", error);
  }
};

export const getReceivedItems = async (req, res) => {
  const userId = req.userId;

  try {
    // Import Order model
    const { Order } = await import("../models/order.model.js");
    const { Purchase } = await import("../models/purchase.model.js");
    const { Item } = await import("../models/item.model.js");

    // Get all purchases for this user
    const purchased = await Purchase.find({ userId });
    const purchasedItemIds = purchased.map(p => p.itemId);

    // Get orders for these items that are delivered
    const deliveredOrders = await Order.find({
      userId: userId,
      itemId: { $in: purchasedItemIds },
      delivered: true
    });

    // Get item data for delivered orders
    const itemIds = deliveredOrders.map(order => order.itemId);
    const itemData = await Item.find({
      _id: { $in: itemIds },
    });

    // Combine order and item data
    const receivedItemsData = itemData.map(item => {
      const order = deliveredOrders.find(o => o.itemId === item._id.toString());
      return {
        ...item.toObject(),
        order: order
      };
    });

    res.status(200).json({ receivedItemsData });
  } catch (error) {
    res.status(500).json({ errors: "Error fetching received items data" });
    console.log("Error in getReceivedItems", error);
  }
};