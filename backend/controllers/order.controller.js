import { Order } from "../models/order.model.js";
import { Purchase } from "../models/purchase.model.js";
import { User } from "../models/user.model.js";
import { Item } from "../models/item.model.js";
import mongoose from "mongoose";
import emailService from "../services/email.service.js";

export const orderData = async (req, res) => {
  const order = req.body;
  try {
    const orderInfo = await Order.create(order);
    console.log("Order created:", orderInfo);
    const userId = orderInfo?.userId;
    const itemId = orderInfo?.itemId;
    
    if (orderInfo) {
      // Convert string IDs to ObjectIds for purchase creation
      const userIdObjectId = new mongoose.Types.ObjectId(userId);
      const itemIdObjectId = new mongoose.Types.ObjectId(itemId);
      
      // Check if purchase already exists to prevent duplicates
      const existingPurchase = await Purchase.findOne({ 
        userId: userIdObjectId, 
        itemId: itemIdObjectId 
      });
      
      if (!existingPurchase) {
        const purchaseInfo = await Purchase.create({ 
          userId: userIdObjectId, 
          itemId: itemIdObjectId 
        });
        console.log("Purchase created:", purchaseInfo);
      } else {
        console.log("Purchase already exists, skipping creation");
      }

      // Send email notifications after successful order creation
      try {
        // Get user and item details for email
        const userData = await User.findById(userId);
        const itemData = await Item.findById(itemId);
        
        if (userData && itemData && orderInfo.email) {
          // Send confirmation email to buyer
          const emailSent = await emailService.sendPurchaseConfirmation(orderInfo, userData, itemData);
          
          // Send notification email to admin
          const adminEmailSent = await emailService.sendOrderNotificationToAdmin(orderInfo, userData, itemData);
          
          if (emailSent) {
            console.log("Purchase confirmation email sent successfully to:", orderInfo.email);
          }
          if (adminEmailSent) {
            console.log("Order notification email sent to admin successfully");
          }
        } else {
          console.log("Could not send emails - missing user, item, or email data");
        }
      } catch (emailError) {
        console.log("Error sending emails:", emailError);
        // Don't fail the order if email fails
      }
    }
    
    res.status(201).json({ message: "Order Details: ", orderInfo });
  } catch (error) {
    console.log("Error in order: ", error);
    res.status(401).json({ errors: "Error in order creation" });
  }
}; 