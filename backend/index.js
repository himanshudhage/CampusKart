// backend/index.js

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fileUpload from "express-fileupload"; 
import { v2 as cloudinary } from "cloudinary";
import itemRoute from "./routes/item.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import cookieParser from "cookie-parser"; 
import orderRoute from "./routes/order.route.js";
import cors from "cors";
dotenv.config();

const app = express(); 

const port = process.env.PORT || 4002;
const DB_URI = process.env.MONGO_URI;
  
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// MongoDB connection
try {
  await mongoose.connect(DB_URI || "mongodb://localhost:27017/campuskart", {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    bufferCommands: false // Disable mongoose buffering
  });
  console.log("Connected to MongoDB");
} catch (error) {
  console.log("MongoDB connection error:", error);
  console.log("Please make sure MongoDB is running on your system");
}

// Routes
app.use("/api/v1/item", itemRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/order", orderRoute);

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
}); 
// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
