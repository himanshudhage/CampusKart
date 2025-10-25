import nodemailer from "nodemailer";

/**
 * Email service for sending purchase notifications
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: "himanshudhage123@gmail.com",
        pass: "csuq pznw vaks vkpp"
      }
    });
  }

  /**
   * Send purchase confirmation email to buyer
   * @param {Object} orderData - Order information
   * @param {Object} userData - User information
   * @param {Object} itemData - Item information
   * @returns {Promise<boolean>} - Success status
   */
  async sendPurchaseConfirmation(orderData, userData, itemData) {
    try {
      const mailOptions = {
        from: "himanshudhage123@gmail.com",
        to: orderData.email,
        subject: "Purchase Confirmation - CampusKart",
        html: this.generatePurchaseEmailTemplate(orderData, userData, itemData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Purchase confirmation email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Error sending purchase confirmation email:", error);
      return false;
    }
  }

  /**
   * Generate HTML email template for purchase confirmation
   * @param {Object} orderData - Order information
   * @param {Object} userData - User information
   * @param {Object} itemData - Item information
   * @returns {string} - HTML email template
   */
  generatePurchaseEmailTemplate(orderData, userData, itemData) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 8px 8px;
          }
          .order-details {
            background-color: white;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #4CAF50;
          }
          .item-info {
            display: flex;
            align-items: center;
            margin: 15px 0;
          }
          .item-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 5px;
            margin-right: 15px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
          }
          .highlight {
            color: #4CAF50;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Purchase Confirmation</h1>
          <p>Thank you for your purchase!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userData.firstName} ${userData.lastName}!</h2>
          
          <p>We're excited to confirm that your order has been successfully placed. Here are the details:</p>
          
          <div class="order-details">
            <h3>📋 Order Information</h3>
            <p><strong>Order ID:</strong> ${orderData._id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment Status:</strong> <span class="highlight">${orderData.status}</span></p>
            <p><strong>Total Amount:</strong> <span class="highlight">$${orderData.amount}</span></p>
          </div>
          
          <div class="order-details">
            <h3>🛍️ Item Details</h3>
            <div class="item-info">
              <img src="${itemData.image.url}" alt="${itemData.title}" class="item-image">
              <div>
                <h4>${itemData.title}</h4>
                <p>${itemData.description}</p>
                <p><strong>Price:</strong> $${itemData.price}</p>
              </div>
            </div>
          </div>
          
          <div class="order-details">
            <h3>📦 Delivery Information</h3>
            <p><strong>Delivery Address:</strong> ${orderData.address}</p>
            <p><strong>Contact Phone:</strong> ${orderData.phone}</p>
            <p><strong>Delivery Status:</strong> ${orderData.delivered ? 'Delivered' : 'Processing'}</p>
          </div>
          
          <p>We'll keep you updated on your order status. If you have any questions, feel free to contact us.</p>
          
          <p>Thank you for choosing CampusKart!</p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The CampusKart Team</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send order notification email to admin
   * @param {Object} orderData - Order information
   * @param {Object} userData - User information
   * @param {Object} itemData - Item information
   * @returns {Promise<boolean>} - Success status
   */
  async sendOrderNotificationToAdmin(orderData, userData, itemData) {
    try {
      const mailOptions = {
        from: "himanshudhage123@gmail.com",
        to: "himanshudhage123@gmail.com", // Admin email
        subject: "New Order Received - CampusKart",
        html: this.generateAdminNotificationTemplate(orderData, userData, itemData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Order notification email sent to admin successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Error sending order notification to admin:", error);
      return false;
    }
  }

  /**
   * Generate HTML email template for admin notification
   * @param {Object} orderData - Order information
   * @param {Object} userData - User information
   * @param {Object} itemData - Item information
   * @returns {string} - HTML email template
   */
  generateAdminNotificationTemplate(orderData, userData, itemData) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2196F3;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 8px 8px;
          }
          .order-details {
            background-color: white;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #2196F3;
          }
          .item-info {
            display: flex;
            align-items: center;
            margin: 15px 0;
          }
          .item-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 5px;
            margin-right: 15px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
          }
          .highlight {
            color: #2196F3;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 New Order Received</h1>
          <p>Action Required</p>
        </div>
        
        <div class="content">
          <h2>New Order Alert!</h2>
          
          <p>A new order has been placed on CampusKart. Please review the details below:</p>
          
          <div class="order-details">
            <h3>📋 Order Information</h3>
            <p><strong>Order ID:</strong> ${orderData._id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment Status:</strong> <span class="highlight">${orderData.status}</span></p>
            <p><strong>Total Amount:</strong> <span class="highlight">$${orderData.amount}</span></p>
            <p><strong>Payment ID:</strong> ${orderData.paymentId}</p>
          </div>
          
          <div class="order-details">
            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</p>
            <p><strong>Email:</strong> ${orderData.email}</p>
            <p><strong>Phone:</strong> ${orderData.phone}</p>
            <p><strong>Address:</strong> ${orderData.address}</p>
          </div>
          
          <div class="order-details">
            <h3>🛍️ Item Details</h3>
            <div class="item-info">
              <img src="${itemData.image.url}" alt="${itemData.title}" class="item-image">
              <div>
                <h4>${itemData.title}</h4>
                <p>${itemData.description}</p>
                <p><strong>Price:</strong> $${itemData.price}</p>
              </div>
            </div>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Verify payment status</li>
            <li>Prepare item for shipping</li>
            <li>Update order status in admin panel</li>
            <li>Send tracking information to customer</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>CampusKart Admin Panel</p>
          <p>This is an automated notification email.</p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();

