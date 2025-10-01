import express from "express";
import { 
  getOrders, 
  createOrder,
  updateOrderStatus,
  getOrderById,
  getDashboardStats
} from "../controllers/ordersController.js";

const router = express.Router();

// Dashboard stats route (before parameterized routes)
router.get("/dashboard/stats", getDashboardStats);

// CRUD routes for orders
router.get("/", getOrders);                    // GET /api/orders
router.get("/:id", getOrderById);              // GET /api/orders/:id
router.post("/", createOrder);                 // POST /api/orders
router.put("/:id/status", updateOrderStatus);  // PUT /api/orders/:id/status

export default router;