import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

export async function getCategories(req, res) {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY created_at DESC");

    // If no categories found, return default categories
    if (result.rows.length === 0) {
      const defaultCategories = [
        { id: 'appetizer', name: 'Makanan Pembuka', description: 'Appetizers and starters' },
        { id: 'main-course', name: 'Makanan Utama', description: 'Main courses' },
        { id: 'dessert', name: 'Makanan Penutup', description: 'Desserts and sweets' },
        { id: 'beverage', name: 'Minuman', description: 'Beverages and drinks' }
      ];
      return res.json({
        success: true,
        data: defaultCategories
      });
    }

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error("Database error, returning default categories:", err.message);
    // Return default categories if database connection fails
    const defaultCategories = [
      { id: 'appetizer', name: 'Makanan Pembuka', description: 'Appetizers and starters' },
      { id: 'main-course', name: 'Makanan Utama', description: 'Main courses' },
      { id: 'dessert', name: 'Makanan Penutup', description: 'Desserts and sweets' },
      { id: 'beverage', name: 'Minuman', description: 'Beverages and drinks' }
    ];
    res.json({
      success: true,
      data: defaultCategories
    });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    const id = uuidv4();
    await pool.query(
      "INSERT INTO categories (id, name, description) VALUES ($1,$2,$3)",
      [id, name, description]
    );
    res.json({
      success: true,
      data: { id, name, description },
      message: "Category created successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
