import express from "express";
import { getPayments, createPayment } from "../controllers/paymentsController.js";
const router = express.Router();

router.get("/", getPayments);
router.post("/", createPayment);

export default router;
