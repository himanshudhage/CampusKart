import dotenv from "dotenv";
dotenv.config();

const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD || "your_jwt_user_secret_key_here";
const JWT_ADMIN_PASSWORD = process.env.JWT_ADMIN_PASSWORD || "your_jwt_admin_secret_key_here";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "your_stripe_secret_key";
export default {
  JWT_USER_PASSWORD,
  JWT_ADMIN_PASSWORD,
  STRIPE_SECRET_KEY,
};  
