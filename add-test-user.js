import pool from './db.js';
import { v4 as uuidv4 } from 'uuid';

const addTestUsers = async () => {
  try {
    console.log('🌱 Adding test users...');

    const testUsers = [
      {
        id: uuidv4(),
        email: 'admin@bunda-bahagia.com',
        password: 'admin123',
        full_name: 'Administrator',
        role: 'admin',
        phone: '08123456789',
        status: 'active'
      },
      {
        id: uuidv4(),
        email: 'customer1@example.com',
        password: 'customer123',
        full_name: 'John Doe',
        role: 'customer',
        phone: '08198765432',
        status: 'active'
      },
      {
        id: uuidv4(),
        email: 'customer2@example.com',
        password: 'customer123',
        full_name: 'Jane Smith',
        role: 'customer',
        phone: '08987654321',
        status: 'active'
      }
    ];

    for (const user of testUsers) {
      const { id, email, password, full_name, role, phone, status } = user;

      // Check if user already exists
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        console.log(`ℹ️  User ${email} already exists, skipping...`);
        continue;
      }

      await pool.query(
        'INSERT INTO users (id, email, password, full_name, role, phone, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, email, password, full_name, role, phone, status]
      );
      console.log(`✅ Added user: ${full_name} (${email})`);
    }

    console.log('🎉 Test users added successfully!');

    // Show all users
    const result = await pool.query('SELECT id, email, full_name, role, phone, status, created_at FROM users ORDER BY created_at DESC');
    console.log('\n📋 Current users in database:');
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email}) - ${user.role} - ${user.status}`);
    });

  } catch (error) {
    console.error('❌ Error adding test users:', error);
  } finally {
    process.exit();
  }
};

addTestUsers();