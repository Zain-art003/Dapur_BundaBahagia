import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

export async function getOrders(req, res) {
  try {
    const { customer_id, status } = req.query;
    
    let query = `
      SELECT 
        o.*,
        u.full_name as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (customer_id) {
      conditions.push(`o.customer_id = $${params.length + 1}`);
      params.push(customer_id);
    }
    
    if (status) {
      conditions.push(`o.status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
}

export async function createOrder(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      customer_id, 
      order_type, 
      table_number, 
      payment_method = 'cash', 
      order_items = [] 
    } = req.body;

    // Validasi input
    if (!customer_id || !order_type || !order_items.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: "Customer ID, order type, dan order items wajib diisi" 
      });
    }

    if (order_type === 'dine-in' && !table_number) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: "Nomor meja wajib untuk dine-in" 
      });
    }

    // Validasi customer exists
    const customerCheck = await client.query(
      "SELECT id FROM users WHERE id = $1", 
      [customer_id]
    );
    
    if (customerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: "Customer tidak valid" 
      });
    }

    // Validasi dan hitung total amount
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of order_items) {
      if (!item.menu_item_id || !item.quantity || item.quantity <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false,
          error: "Menu item ID dan quantity valid diperlukan" 
        });
      }

      // Check menu item exists dan available
      const menuResult = await client.query(
        "SELECT id, name, price, stock, status FROM menu_items WHERE id = $1", 
        [item.menu_item_id]
      );

      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false,
          error: `Menu item ${item.menu_item_id} tidak ditemukan` 
        });
      }

      const menuItem = menuResult.rows[0];

      if (menuItem.status !== 'available') {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false,
          error: `Menu "${menuItem.name}" sedang tidak tersedia` 
        });
      }

      if (menuItem.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false,
          error: `Stok "${menuItem.name}" tidak mencukupi. Tersedia: ${menuItem.stock}` 
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal: itemTotal,
        menu_name: menuItem.name
      });
    }

    // Create order
    const orderId = uuidv4();
    const orderResult = await client.query(
      `INSERT INTO orders 
       (id, customer_id, order_type, table_number, status, total_amount, payment_method, payment_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        orderId,
        customer_id,
        order_type,
        table_number,
        'pending',
        totalAmount,
        payment_method,
        'pending'
      ]
    );

    // Create order items dan update stock
    for (const item of validatedItems) {
      // Insert order item
      await client.query(
        `INSERT INTO order_items
         (id, order_id, menu_item_id, quantity, price, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          uuidv4(),
          orderId,
          item.menu_item_id,
          item.quantity,
          item.price,
          item.subtotal
        ]
      );

      // Update stock
      await client.query(
        `UPDATE menu_items 
         SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [item.quantity, item.menu_item_id]
      );
    }

    await client.query('COMMIT');

    // Get complete order data for response
    const completeOrder = await pool.query(`
      SELECT 
        o.*,
        u.full_name as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.id = $1
    `, [orderId]);

    res.json({ 
      success: true,
      message: "Pesanan berhasil dibuat", 
      data: {
        ...completeOrder.rows[0],
        order_items: validatedItems
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating order:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    // Validasi status
    const validStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'refunded'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: "Status tidak valid" 
      });
    }

    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({ 
        success: false,
        error: "Status pembayaran tidak valid" 
      });
    }

    // Update fields yang diberikan
    const updateFields = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      updateFields.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (payment_status) {
      updateFields.push(`payment_status = $${paramCount}`);
      params.push(payment_status);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Tidak ada field yang diupdate" 
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await pool.query(
      `UPDATE orders 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount} 
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Pesanan tidak ditemukan" 
      });
    }

    res.json({ 
      success: true,
      message: "Status pesanan berhasil diupdate", 
      data: result.rows[0] 
    });

  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    
    // Get order with customer info
    const orderResult = await pool.query(`
      SELECT 
        o.*,
        u.full_name as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Pesanan tidak ditemukan" 
      });
    }

    // Get order items
    const itemsResult = await pool.query(`
      SELECT 
        oi.*,
        mi.name as menu_name,
        mi.description as menu_description
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at
    `, [id]);

    const orderData = {
      ...orderResult.rows[0],
      order_items: itemsResult.rows
    };

    res.json({ 
      success: true,
      data: orderData 
    });

  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

export async function getDashboardStats(req, res) {
  try {
    // Get stats untuk dashboard
    const statsQueries = await Promise.all([
      // Total orders
      pool.query("SELECT COUNT(*) as total_orders FROM orders"),
      
      // Total revenue
      pool.query("SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE payment_status = 'paid'"),
      
      // Today's revenue
      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) as today_revenue 
        FROM orders 
        WHERE payment_status = 'paid' 
        AND DATE(created_at) = CURRENT_DATE
      `),
      
      // Active users count
      pool.query("SELECT COUNT(*) as active_users FROM users WHERE role = 'customer'"),
      
      // Menu items count
      pool.query("SELECT COUNT(*) as menu_items FROM menu_items WHERE status = 'available'"),
      
      // Pending orders count
      pool.query("SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending'")
    ]);

    const stats = {
      total_orders: parseInt(statsQueries[0].rows[0].total_orders),
      total_revenue: parseFloat(statsQueries[1].rows[0].total_revenue),
      today_revenue: parseFloat(statsQueries[2].rows[0].today_revenue),
      active_users: parseInt(statsQueries[3].rows[0].active_users),
      menu_items: parseInt(statsQueries[4].rows[0].menu_items),
      pending_orders: parseInt(statsQueries[5].rows[0].pending_orders)
    };

    res.json({ 
      success: true,
      data: stats 
    });

  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}