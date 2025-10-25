import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../config.js";
import { Admin } from "../models/admin.model.js";

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const adminSchema = z.object({
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

  const validatedData = adminSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res
      .status(400)
      .json({ errors: validatedData.error.issues.map((err) => err.message) });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      return res.status(400).json({ errors: "Admin already exists" });
    }
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newAdmin.save();
    res.status(201).json({ message: "Signup succeedded", newAdmin });
  } catch (error) {
    res.status(500).json({ errors: "Error in signup" });
    console.log("Error in signup", error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Admin login attempt for email:", email);
  try {
    const admin = await Admin.findOne({ email: email });
    console.log("Admin found:", admin ? "Yes" : "No");
    
    if (!admin) {
      console.log("No admin found with email:", email);
      return res.status(403).json({ errors: "Invalid credentials" });
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    console.log("Admin password correct:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log("Admin password incorrect for email:", email);
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // jwt code
    const token = jwt.sign(
      {
        id: admin._id,
      },
      config.JWT_ADMIN_PASSWORD,
      { expiresIn: "1d" }
    );
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true, //  can't be accsed via js directly
      secure: process.env.NODE_ENV === "production", // true for https only
      sameSite: "Strict", // CSRF attacks
    };
    res.cookie("jwt", token, cookieOptions);
    res.status(201).json({ message: "Login successful", admin, token });
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

export const getAdminItems = async (req, res) => {
  const adminId = req.adminId;
  
  try {
    // Import Item model
    const { Item } = await import("../models/item.model.js");

    console.log("Getting items for admin ID:", adminId); // Debug log

    // Get all items created by this admin
    const adminItems = await Item.find({ creatorId: adminId });
    
    console.log("Admin items found:", adminItems); // Debug log

    res.status(200).json({
      message: "Admin items retrieved successfully",
      items: adminItems
    });

  } catch (error) {
    res.status(500).json({ errors: "Error fetching admin items" });
    console.log("Error in getAdminItems", error);
  }
};


export const updateDeliveredStatus = async (req, res) => {
  const adminId = req.adminId;
  const { orderId } = req.params;
  const { delivered } = req.body;

  try {
    // Import models
    const { Order } = await import("../models/order.model.js");
    const { Item } = await import("../models/item.model.js");

    console.log("Updating delivered status:", { orderId, delivered, adminId }); // Debug log

    // First, verify that the order belongs to an item created by this admin
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ errors: "Order not found" });
    }

    const item = await Item.findOne({
      _id: order.itemId,
      creatorId: adminId
    });

    if (!item) {
      return res.status(403).json({ errors: "You can only update orders for your own items" });
    }

    // Update the delivered status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { delivered },
      { new: true }
    );

    console.log("Delivered status updated:", updatedOrder); // Debug log

    res.status(200).json({
      message: "Delivered status updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    res.status(500).json({ errors: "Error updating delivered status" });
    console.log("Error in updateDeliveredStatus", error);
  }
};

export const getPurchaseData = async (req, res) => {
  const adminId = req.adminId;
  
  try {
    // Import models
    const { Item } = await import("../models/item.model.js");
    const { Purchase } = await import("../models/purchase.model.js");
    const { User } = await import("../models/user.model.js");
    const { Order } = await import("../models/order.model.js");

    console.log("=== ADMIN DASHBOARD DEBUG ===");
    console.log("Admin ID:", adminId);

    // Get all items created by this admin
    const adminItems = await Item.find({ creatorId: adminId });
    console.log("Admin items found:", adminItems.length);
    
    if (adminItems.length === 0) {
      return res.status(200).json({
        message: "No items found for this admin",
        totalPurchases: 0,
        totalRevenue: 0,
        purchases: []
      });
    }

    const itemIds = adminItems.map(item => item._id.toString());
    console.log("Item IDs:", itemIds);

    // Get all orders for items created by this admin
    const orders = await Order.find({ itemId: { $in: itemIds } });
    console.log("Orders found:", orders.length);

    if (orders.length === 0) {
      return res.status(200).json({
        message: "No orders found for your items",
        totalPurchases: 0,
        totalRevenue: 0,
        purchases: []
      });
    }

    // Create a map of items for quick lookup
    const itemMap = {};
    adminItems.forEach(item => {
      itemMap[item._id.toString()] = item;
    });

    // Process each order and get user details
    const purchaseData = [];
    
    for (const order of orders) {
      const item = itemMap[order.itemId];
      if (!item) continue;

      // Get user details from User model
      let userInfo = null;
      try {
        const user = await User.findById(order.userId);
        if (user) {
          userInfo = {
            id: user._id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            email: user.email || order.email || 'No email provided'
          };
        } else {
          // Fallback if user not found
          userInfo = {
            id: order.userId,
            name: order.email ? order.email.split('@')[0] : 'Unknown User',
            email: order.email || 'No email provided'
          };
        }
      } catch (userError) {
        console.log("Error fetching user:", userError);
        userInfo = {
          id: order.userId,
          name: order.email ? order.email.split('@')[0] : 'Unknown User',
          email: order.email || 'No email provided'
        };
      }

      purchaseData.push({
        purchaseId: order._id,
        user: userInfo,
        item: {
          id: item._id,
          title: item.title,
          price: item.price
        },
        order: {
          id: order._id,
          paymentId: order.paymentId,
          amount: order.amount,
          status: order.status,
          phone: order.phone,
          address: order.address,
          delivered: order.delivered,
          purchaseDate: order.createdAt
        }
      });
    }

    console.log("Final purchase data:", purchaseData);
    console.log("Total purchases found:", purchaseData.length);
    console.log("=== END ADMIN DASHBOARD DEBUG ===");

    res.status(200).json({
      message: "Purchase data retrieved successfully",
      totalPurchases: purchaseData.length,
      totalRevenue: purchaseData.reduce((sum, item) => sum + (item.order?.amount || 0), 0),
      purchases: purchaseData
    });

  } catch (error) {
    console.log("Error in getPurchaseData", error);
    res.status(500).json({ errors: "Error fetching purchase data" });
  }
}; 