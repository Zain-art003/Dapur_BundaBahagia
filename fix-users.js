import pool from './db.js';

const fixUsers = async () => {
  try {
    console.log('🔧 Fixing Users in Database...\n');

    // Check current users
    console.log('1. Current users in database:');
    const existingUsers = await pool.query('SELECT email, full_name, role, password FROM users ORDER BY created_at');
    const users = existingUsers.rows;

    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      const pwdStatus = user.password ? '✅ Has password' : '❌ No password';
      console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - ${user.role} - ${pwdStatus}`);
    });

    // Delete all existing users
    console.log('\n2. Cleaning existing users...');
    await pool.query('DELETE FROM users');
    console.log('✅ All users deleted');

    // Insert fresh users with proper hashing
    console.log('\n3. Inserting fresh users...');
    const bcrypt = await import('bcrypt');

    const defaultUsers = [
      {
        email: 'admin@dapurbunda.com',
        password: await bcrypt.default.hash('admin123', 10),
        full_name: 'Administrator',
        role: 'admin',
        phone: '081234567890'
      },
      {
        email: 'customer@example.com',
        password: await bcrypt.default.hash('customer123', 10),
        full_name: 'Customer Demo',
        role: 'customer',
        phone: '081234567891'
      }
    ];

    for (const user of defaultUsers) {
      try {
        await pool.query(
          'INSERT INTO users (email, password, full_name, role, phone) VALUES ($1, $2, $3, $4, $5)',
          [user.email, user.password, user.full_name, user.role, user.phone]
        );
        console.log(`✅ Inserted: ${user.full_name} (${user.email})`);
      } catch (error) {
        console.log(`❌ Failed to insert ${user.email}: ${error.message}`);
      }
    }

    // Verify the fix
    console.log('\n4. Verifying the fix...');
    const verifyUsers = await pool.query('SELECT email, full_name, role FROM users ORDER BY created_at');
    const fixedUsers = verifyUsers.rows;

    console.log(`✅ Found ${fixedUsers.length} clean users:`);
    fixedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - ${user.role}`);
    });

    // Test password hashing
    console.log('\n5. Testing password hashing...');
    const testUsers = await pool.query('SELECT email, password FROM users ORDER BY created_at');

    for (const user of testUsers.rows) {
      const testPassword = user.email.includes('admin') ? 'admin123' : 'customer123';

      try {
        const isValidPassword = await bcrypt.default.compare(testPassword, user.password);
        console.log(`   ${user.email} with "${testPassword}": ${isValidPassword ? '✅ SUCCESS' : '❌ FAILED'}`);
      } catch (error) {
        console.log(`   ${user.email}: ❌ Error - ${error.message}`);
      }
    }

    console.log('\n🎉 Users fixed successfully!');
    console.log('\n📋 Use these credentials:');
    console.log('   Admin: admin@dapurbunda.com / admin123');
    console.log('   Customer: customer@example.com / customer123');

  } catch (error) {
    console.error('❌ Failed to fix users!');
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
};

fixUsers();