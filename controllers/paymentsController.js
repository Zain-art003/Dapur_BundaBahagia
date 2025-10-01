import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

export async function getPayments(req, res) {
  try {
    const result = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createPayment(req, res) {
  try {
    const { order_id, amount, method, status, transaction_id } = req.body;
    const id = uuidv4();
    await pool.query(
      "INSERT INTO payments (id, order_id, amount, method, status, transaction_id) VALUES ($1,$2,$3,$4,$5,$6)",
      [id, order_id, amount, method, status, transaction_id]
    );
    res.json({ message: "Payment created", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

