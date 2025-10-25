import express from "express";
import { login, logout, signup, getPurchaseData, getAdminItems, updateDeliveredStatus } from "../controllers/admin.controller.js";
import adminMiddleware from "../middlewares/admin.mid.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/items", adminMiddleware, getAdminItems);
router.get("/purchases", adminMiddleware, getPurchaseData);
router.put("/orders/:orderId/delivered", adminMiddleware, updateDeliveredStatus);

export default router;