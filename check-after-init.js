import pool from './db.js';

const checkAfterInit = async () => {
  try {
    console.log('🔍 Checking Database After Init...\n');

    // Test database connection
    console.log('1. Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection: OK\n');

    // Check tables
    console.log('2. Checking tables...');
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found after init!');
      return;
    }

    console.log(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Check users
    console.log('\n3. Checking users...');
    const usersResult = await pool.query('SELECT email, full_name, role FROM users ORDER BY created_at');
    const users = usersResult.rows;

    if (users.length === 0) {
      console.log('❌ No users found after init!');
      console.log('💡 Something went wrong with user creation');
      return;
    }

    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - ${user.role}`);
    });

    // Test password hashing
    console.log('\n4. Testing password hashing...');
    const bcrypt = await import('bcrypt');

    for (const user of users) {
      const testPassword = user.email.includes('admin') ? 'admin123' : 'customer123';

      try {
        // Check if password is hashed
        const isHashed = user.password.length === 60 && user.password.startsWith('$2b$');
        console.log(`   ${user.email}: ${isHashed ? '✅ Hashed' : '❌ Plain text'} (${user.password.length} chars)`);

        // Test password comparison
        const isValidPassword = await bcrypt.default.compare(testPassword, user.password);
        console.log(`   Login test with "${testPassword}": ${isValidPassword ? '✅ SUCCESS' : '❌ FAILED'}`);
      } catch (error) {
        console.log(`   ${user.email}: ❌ Error - ${error.message}`);
      }
    }

    console.log('\n📋 Recommendations:');
    console.log('   Use the credentials shown above');
    console.log('   Make sure frontend sends requests to http://localhost:8000');

  } catch (error) {
    console.error('❌ Database check failed!');
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
};

checkAfterInit();