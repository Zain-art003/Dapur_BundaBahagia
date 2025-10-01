import pool from './db.js';

const debugLogin = async () => {
  try {
    console.log('🔍 Debugging Login Issues...\n');

    // Test database connection
    console.log('1. Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection: OK\n');

    // Check existing users
    console.log('2. Checking existing users...');
    const userResult = await pool.query('SELECT email, full_name, role FROM users ORDER BY created_at');
    const users = userResult.rows;

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 Run: npm run db:init');
      return;
    }

    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - ${user.role}`);
    });

    // Test login for each user
    console.log('\n3. Testing login functionality...');
    const bcrypt = await import('bcrypt');

    for (const user of users) {
      try {
        const testPassword = user.email.includes('admin') ? 'admin123' : 'customer123';
        const isValidPassword = await bcrypt.default.compare(testPassword, user.password);

        if (isValidPassword) {
          console.log(`✅ Login successful for: ${user.email} with password: ${testPassword}`);
        } else {
          console.log(`❌ Login failed for: ${user.email} with password: ${testPassword}`);
          console.log(`   Password in database might be different`);
        }
      } catch (error) {
        console.log(`❌ Error testing login for: ${user.email}`);
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('\n📋 Summary:');
    console.log('   Make sure to use the correct credentials from the list above');
    console.log('   If passwords don\'t work, the database might have different passwords');
    console.log('   Run: npm run db:init to reset with default credentials');

  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Start PostgreSQL: net start postgresql');
    console.error('2. Check .env configuration');
    console.error('3. Test connection: psql -h localhost -p 5432 -U postgres -d postgres');
  } finally {
    process.exit();
  }
};

debugLogin();