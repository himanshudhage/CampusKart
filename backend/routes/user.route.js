import express from "express";
import {
  login,
  logout,
  purchases,
  signup,
  getAwaitingPickup,
  getReceivedItems,
  debugUsers,
} from "../controllers/user.controller.js";
import userMiddleware from "../middlewares/user.mid.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/debug-users", debugUsers); // Debug endpoint
router.get("/purchases", userMiddleware, purchases);
router.get("/awaiting-pickup", userMiddleware, getAwaitingPickup);
router.get("/received-items", userMiddleware, getReceivedItems);

export default router;