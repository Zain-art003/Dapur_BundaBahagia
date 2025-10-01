const fetch = await import('node-fetch');

const testFrontendAPI = async () => {
  console.log('🔍 Testing Frontend API Integration...\n');

  const baseURL = 'http://localhost:8000';

  // Test all endpoints that frontend uses
  const endpoints = [
    { name: 'Orders', url: '/api/orders', method: 'GET' },
    { name: 'Menu Items', url: '/api/menu-items', method: 'GET' },
    { name: 'Categories', url: '/api/categories', method: 'GET' },
    { name: 'Users', url: '/api/users', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint.name}...`);

      const response = await fetch(`${baseURL}${endpoint.url}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const count = Array.isArray(data.data) ? data.data.length : 'N/A';
        console.log(`   ✅ ${endpoint.name}: OK (${count} items)`);

        // Show sample data
        if (data.data && data.data.length > 0) {
          const sample = data.data[0];
          console.log(`   📄 Sample: ${JSON.stringify(sample).substring(0, 100)}...`);
        }
      } else {
        console.log(`   ❌ ${endpoint.name}: FAILED`);
        console.log(`   Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: CANNOT CONNECT`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }

  // Test specific order update
  console.log('🔧 Testing Order Status Update...');
  try {
    // First get existing orders
    const ordersResponse = await fetch(`${baseURL}/api/orders`);
    const ordersData = await ordersResponse.json();

    if (ordersData.success && ordersData.data && ordersData.data.length > 0) {
      const testOrder = ordersData.data[0];
      console.log(`   📝 Testing order: ${testOrder.id}`);

      // Update order status
      const updateResponse = await fetch(`${baseURL}/api/orders/${testOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          payment_status: 'paid'
        })
      });

      const updateData = await updateResponse.json();

      if (updateResponse.ok && updateData.success) {
        console.log(`   ✅ Order updated successfully`);
        console.log(`   New status: ${updateData.data.status}`);
        console.log(`   New payment: ${updateData.data.payment_status}`);
      } else {
        console.log(`   ❌ Order update failed: ${updateData.error}`);
      }
    } else {
      console.log('   ⚠️  No orders to test update');
    }
  } catch (error) {
    console.log(`   ❌ Order update test failed: ${error.message}`);
  }

  console.log('\n📋 Summary:');
  console.log('   If all APIs return data but frontend shows 0:');
  console.log('   1. Check browser console for React errors');
  console.log('   2. Check if useEffect dependencies are correct');
  console.log('   3. Try clearing browser cache');
  console.log('   4. Check if component is re-rendering');
};

testFrontendAPI();