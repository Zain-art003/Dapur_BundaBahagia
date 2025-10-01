import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

export async function getMenuItems(req, res) {
  try {
    // Join dengan categories untuk mendapatkan nama kategori
    const result = await pool.query(`
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.category_id,
        mi.stock,
        mi.image_url,
        mi.status,
        mi.created_at,
        mi.updated_at,
        c.name as category_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      ORDER BY mi.created_at DESC
    `);

    // Map category names for default categories
    const defaultCategoryMap = {
      'appetizer': 'Makanan Pembuka',
      'main-course': 'Makanan Utama',
      'dessert': 'Makanan Penutup',
      'beverage': 'Minuman'
    };

    const menuItems = result.rows.map(item => ({
      ...item,
      category_name: item.category_name || defaultCategoryMap[item.category_id] || 'Unknown'
    }));

    res.json({
      success: true,
      data: menuItems
    });
  } catch (err) {
    console.error("Database error, returning empty menu items:", err.message);
    // Return empty array if database fails
    res.json({
      success: true,
      data: []
    });
  }
}

export async function createMenuItem(req, res) {
  try {
    const { name, description, price, category_id, stock, image_url, status } = req.body;
    
    // Validasi input
    if (!name || !price || !category_id || stock === undefined || stock === null) {
      return res.status(400).json({ 
        success: false,
        error: "Nama, harga, kategori, dan stok wajib diisi" 
      });
    }

    // Pastikan price dan stock adalah angka
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      return res.status(400).json({ 
        success: false,
        error: "Harga dan stok harus berupa angka" 
      });
    }

    if (parsedPrice <= 0 || parsedStock < 0) {
      return res.status(400).json({ 
        success: false,
        error: "Harga harus lebih dari 0 dan stok tidak boleh negatif" 
      });
    }

    const id = uuidv4();
    
    // Pastikan kategori valid (allow default categories)
    const defaultCategoryIds = ['appetizer', 'main-course', 'dessert', 'beverage'];
    const isDefaultCategory = defaultCategoryIds.includes(category_id);

    if (!isDefaultCategory) {
      try {
        const categoryCheck = await pool.query(
          "SELECT id FROM categories WHERE id = $1",
          [category_id]
        );

        if (categoryCheck.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: "Kategori tidak valid"
          });
        }
      } catch (dbError) {
        // If database fails, only allow default categories
        return res.status(400).json({
          success: false,
          error: "Kategori tidak valid"
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO menu_items 
       (id, name, description, price, category_id, stock, image_url, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        id, 
        name, 
        description || null, 
        parsedPrice, 
        category_id, 
        parsedStock, 
        image_url || null, 
        status || 'available'
      ]
    );

    // Ambil data lengkap dengan category name untuk response
    const fullResult = await pool.query(`
      SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi 
      LEFT JOIN categories c ON mi.category_id = c.id 
      WHERE mi.id = $1
    `, [id]);

    res.json({ 
      success: true,
      message: "Menu item berhasil dibuat", 
      data: fullResult.rows[0] 
    });
  } catch (err) {
    console.error("Error creating menu item:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

export async function updateMenuItem(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, stock, image_url, status } = req.body;

    // Validasi input
    if (!name || !price || !category_id || stock === undefined || stock === null) {
      return res.status(400).json({ 
        success: false,
        error: "Nama, harga, kategori, dan stok wajib diisi" 
      });
    }

    // Pastikan price dan stock adalah angka
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      return res.status(400).json({ 
        success: false,
        error: "Harga dan stok harus berupa angka" 
      });
    }

    if (parsedPrice <= 0 || parsedStock < 0) {
      return res.status(400).json({ 
        success: false,
        error: "Harga harus lebih dari 0 dan stok tidak boleh negatif" 
      });
    }

    // Pastikan kategori exists
    if (category_id) {
      const categoryCheck = await pool.query(
        "SELECT id FROM categories WHERE id = $1", 
        [category_id]
      );
      
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: "Kategori tidak valid" 
        });
      }
    }

    const result = await pool.query(
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, category_id = $4, 
           stock = $5, image_url = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 
       RETURNING *`,
      [name, description, parsedPrice, category_id, parsedStock, image_url, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Menu item tidak ditemukan" 
      });
    }

    // Ambil data lengkap dengan category name untuk response
    const fullResult = await pool.query(`
      SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi 
      LEFT JOIN categories c ON mi.category_id = c.id 
      WHERE mi.id = $1
    `, [id]);

    res.json({ 
      success: true,
      message: "Menu item berhasil diupdate", 
      data: fullResult.rows[0] 
    });
  } catch (err) {
    console.error("Error updating menu item:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

export async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;
    
    // Check if menu item exists first
    const checkResult = await pool.query(
      "SELECT id, name FROM menu_items WHERE id = $1", 
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Menu item tidak ditemukan" 
      });
    }

    const menuName = checkResult.rows[0].name;

    // Delete the menu item
    const result = await pool.query(
      "DELETE FROM menu_items WHERE id = $1 RETURNING id", 
      [id]
    );

    res.json({ 
      success: true,
      message: `Menu "${menuName}" berhasil dihapus`,
      data: { id: result.rows[0].id }
    });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    
    // Check if it's a foreign key constraint error
    if (err.code === '23503') {
      res.status(400).json({ 
        success: false,
        error: "Menu item tidak dapat dihapus karena masih terkait dengan pesanan yang ada" 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }
}

// Tambahan: Get single menu item
export async function getMenuItem(req, res) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi 
      LEFT JOIN categories c ON mi.category_id = c.id 
      WHERE mi.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Menu item tidak ditemukan" 
      });
    }

    res.json({ 
      success: true,
      data: result.rows[0] 
    });
  } catch (err) {
    console.error("Error fetching menu item:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}