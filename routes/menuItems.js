import express from "express";
import { 
  getMenuItems, 
  getMenuItem,     // Tambahan untuk get single item
  createMenuItem,
  updateMenuItem,  
  deleteMenuItem   
} from "../controllers/menuItemsController.js";

const router = express.Router();

// Routes untuk menu items
router.get("/", getMenuItems);           // GET /api/menu-items
router.get("/:id", getMenuItem);         // GET /api/menu-items/:id  
router.post("/", createMenuItem);        // POST /api/menu-items
router.put("/:id", updateMenuItem);      // PUT /api/menu-items/:id
router.delete("/:id", deleteMenuItem);   // DELETE /api/menu-items/:id

export default router;