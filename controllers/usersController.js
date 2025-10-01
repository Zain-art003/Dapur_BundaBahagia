import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

// Login user
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Email atau password salah" });
    }

    const user = result.rows[0];

    // Use bcrypt for secure password comparison
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: "Email atau password salah" });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = `token_${Date.now()}_${user.id}`;

    res.json({
      success: true,
      data: userWithoutPassword,
      token,
      message: "Login berhasil",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all users
export async function getUsers(req, res) {
  try {
    const result = await pool.query("SELECT id, email, full_name, role, phone, created_at FROM users ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Create user
export async function createUser(req, res) {
  try {
    const { email, password, full_name, role, phone } = req.body;
    const id = uuidv4();

    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Email sudah terdaftar" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (id, email, password, full_name, role, phone) VALUES ($1,$2,$3,$4,$5,$6)",
      [id, email, hashedPassword, full_name, role, phone]
    );

    res.json({ success: true, data: { id }, message: "User berhasil dibuat" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update user
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { full_name, phone } = req.body;

    const result = await pool.query(
      "UPDATE users SET full_name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [full_name, phone, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }

    res.json({ success: true, data: result.rows[0], message: "User berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete user
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }

    res.json({ success: true, message: "User berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
