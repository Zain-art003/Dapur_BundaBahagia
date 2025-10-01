import pool from './db.js';

async function checkOrders() {
  try {
    console.log('🔍 Checking orders in database...');

    const result = await pool.query(`
      SELECT id, total_amount, status, payment_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log('📦 Found orders:', result.rows.length);
    console.log('📊 Order details:');

    result.rows.forEach((order, index) => {
      console.log(`${index + 1}. ID: ${order.id}`);
      console.log(`   Total Amount: ${order.total_amount} (type: ${typeof order.total_amount})`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.payment_status}`);
      console.log(`   Created: ${order.created_at}`);
      console.log('---');
    });

    // Calculate total revenue
    const completedOrders = result.rows.filter(order => order.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => {
      const amount = parseFloat(order.total_amount) || 0;
      console.log(`Adding ${amount} from order ${order.id}`);
      return sum + amount;
    }, 0);

    console.log(`💰 Total revenue from completed orders: ${totalRevenue}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

checkOrders();