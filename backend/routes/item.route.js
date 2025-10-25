import express from "express";
import {
  buyItems,
  itemDetails,
  createItem,
  deleteItem,
  getItems,
  updateItem,
} from "../controllers/item.controller.js";
import userMiddleware from "../middlewares/user.mid.js";
import adminMiddleware from "../middlewares/admin.mid.js";

const router = express.Router();

router.post("/create", adminMiddleware, createItem);
router.put("/update/:itemId", adminMiddleware, updateItem);
router.delete("/delete/:itemId", adminMiddleware, deleteItem);

router.get("/items", getItems);
router.get("/:itemId", itemDetails);

router.post("/buy/:itemId", userMiddleware, buyItems);

export default router;
