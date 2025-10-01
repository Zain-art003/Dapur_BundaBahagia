import fetch from 'node-fetch';

const testAPI = async () => {
  console.log('🔍 Testing API Endpoints...\n');

  const baseURL = 'http://localhost:8000';

  // Test orders endpoint
  try {
    console.log('📦 Testing orders endpoint...');
    const response = await fetch(`${baseURL}/api/orders`);
    const data = await response.json();

    if (response.ok && data.success) {
      const orders = data.data || [];
      console.log(`✅ Orders API: OK (${orders.length} orders found)`);

      // Show order details
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.id} - ${order.status} - ${order.payment_status} - Rp ${order.total_amount || 0}`);
      });

      // Calculate expected revenue
      const completedPaidOrders = orders.filter(order =>
        order.status === 'completed' && order.payment_status === 'paid'
      );
      const expectedRevenue = completedPaidOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

      console.log(`\n💰 Expected Revenue: Rp ${expectedRevenue.toLocaleString()}`);
      console.log(`   Completed & Paid Orders: ${completedPaidOrders.length}`);

    } else {
      console.log('❌ Orders API: FAILED');
      console.log('   Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Orders API: CANNOT CONNECT');
    console.log('   Error:', error.message);
    console.log('   Make sure backend is running on port 8000');
  }

  // Test menu items endpoint
  try {
    console.log('\n🍽️  Testing menu items endpoint...');
    const response = await fetch(`${baseURL}/api/menu-items`);
    const data = await response.json();

    if (response.ok && data.success) {
      const items = data.data || [];
      console.log(`✅ Menu Items API: OK (${items.length} items found)`);

      const availableItems = items.filter(item => item.status === 'available').length;
      const lowStockItems = items.filter(item => item.stock < 20 && item.stock > 0).length;
      const outOfStockItems = items.filter(item => item.stock === 0).length;

      console.log(`   Available: ${availableItems} | Low Stock: ${lowStockItems} | Out of Stock: ${outOfStockItems}`);
    } else {
      console.log('❌ Menu Items API: FAILED');
    }
  } catch (error) {
    console.log('❌ Menu Items API: CANNOT CONNECT');
  }

  // Test users endpoint
  try {
    console.log('\n👥 Testing users endpoint...');
    const response = await fetch(`${baseURL}/api/users`);
    const data = await response.json();

    if (response.ok && data.success) {
      const users = data.data || [];
      console.log(`✅ Users API: OK (${users.length} users found)`);

      const activeUsers = users.filter(user => user.status === 'active').length;
      console.log(`   Active Users: ${activeUsers}/${users.length}`);
    } else {
      console.log('❌ Users API: FAILED');
    }
  } catch (error) {
    console.log('❌ Users API: CANNOT CONNECT');
  }

  console.log('\n📋 Summary:');
  console.log('   If APIs return data but frontend shows 0, check:');
  console.log('   1. Frontend API service configuration');
  console.log('   2. Real-time data fetching in components');
  console.log('   3. State management issues');
  console.log('   4. Browser cache (try refresh with Ctrl+F5)');
};

testAPI();