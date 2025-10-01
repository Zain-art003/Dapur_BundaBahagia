// Using curl instead of node-fetch

const { exec } = await import('child_process');
const { promisify } = await import('util');
const execAsync = promisify(exec);

const debugDashboard = async () => {
  console.log('🔍 Debugging Dashboard Data...\n');

  const baseURL = 'http://localhost:8000';

  // Test orders endpoint
  try {
    console.log('📦 Testing orders endpoint...');
    const { stdout: ordersStdout } = await execAsync(`curl -s ${baseURL}/api/orders`);
    const ordersData = JSON.parse(ordersStdout);

    console.log('Response data:', ordersStdout);

    if (ordersData.success) {
      const orders = ordersData.data || [];
      console.log(`\n✅ Orders API: OK (${orders.length} orders found)`);

      // Analyze orders
      const completedOrders = orders.filter(order => order.status === 'completed' && order.payment_status === 'paid');
      const pendingOrders = orders.filter(order => order.status === 'pending');

      console.log('\n📊 Order Analysis:');
      console.log(`   Total Orders: ${orders.length}`);
      console.log(`   Completed & Paid: ${completedOrders.length}`);
      console.log(`   Pending: ${pendingOrders.length}`);
      console.log(`   Expected Revenue: Rp ${completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString()}`);

      // Show sample order
      if (orders.length > 0) {
        console.log('\n📄 Sample Order:');
        console.log(JSON.stringify(orders[0], null, 2));
      }

    } else {
      console.log('❌ Orders API: FAILED');
      console.log('Error:', ordersData.error);
    }
  } catch (error) {
    console.log('❌ Orders API: CANNOT CONNECT');
    console.log('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: npm start');
    console.log('2. Check if orders exist in database');
    console.log('3. Check orders table structure');
  }

  // Test menu items
  try {
    console.log('\n🍽️  Testing menu items endpoint...');
    const { stdout: menuStdout } = await execAsync(`curl -s ${baseURL}/api/menu-items`);
    const menuData = JSON.parse(menuStdout);

    if (menuData.success) {
      const items = menuData.data || [];
      console.log(`✅ Menu Items API: OK (${items.length} items found)`);

      const availableItems = items.filter(item => item.status === 'available').length;
      console.log(`   Available Items: ${availableItems}`);
    } else {
      console.log('❌ Menu Items API: FAILED');
    }
  } catch (error) {
    console.log('❌ Menu Items API: CANNOT CONNECT');
  }

  console.log('\n📋 Next Steps:');
  console.log('   1. If orders API returns data but frontend shows 0:');
  console.log('      - Check browser console for errors');
  console.log('      - Try hard refresh: Ctrl+Shift+R');
  console.log('      - Check if React component is rendering');
  console.log('');
  console.log('   2. If orders API returns empty:');
  console.log('      - Create some test orders');
  console.log('      - Update order status to completed & paid');
  console.log('');
  console.log('   3. If orders API fails to connect:');
  console.log('      - Restart backend server');
  console.log('      - Check port 8000 is available');
};

debugDashboard();