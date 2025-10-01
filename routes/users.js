import express from "express";
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  loginUser 
} from "../controllers/usersController.js";

const router = express.Router();

// Login route - harus di atas route dengan parameter :id
router.post("/login", loginUser);

// CRUD routes
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;