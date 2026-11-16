import express from "express";
import { getProducts, createOrder, verifyPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/products", getProducts);
router.post("/create/order", createOrder);
router.post("/create/order/:productId", createOrder);
router.post("/verify", verifyPayment);

export default router;
