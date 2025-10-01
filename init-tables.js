import pool from './db.js';

const createTables = async () => {
  try {
    console.log('🚀 Creating tables in postgres database...');

    // Create tables one by one
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Menu items table
      `CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'unavailable')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
        order_type VARCHAR(20) DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway')),
        table_number VARCHAR(10),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'completed', 'cancelled')),
        total_amount DECIMAL(10,2) DEFAULT 0,
        payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'debit', 'credit')),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Order items table
      `CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Payments table
      `CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(20) NOT NULL CHECK (method IN ('cash', 'debit', 'credit')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id)',
      'CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)'
    ];

    // Execute table creation
    for (const [index, tableSQL] of tables.entries()) {
      const tableName = ['users', 'categories', 'menu_items', 'orders', 'order_items', 'payments'][index];
      console.log(`📋 Creating table: ${tableName}`);
      await pool.query(tableSQL);
      console.log(`✅ Table ${tableName} created successfully`);
    }

    // Execute index creation
    console.log('🔍 Creating indexes...');
    for (const indexSQL of indexes) {
      try {
        await pool.query(indexSQL);
      } catch (error) {
        console.log(`ℹ️  Index might already exist: ${error.message}`);
      }
    }
    console.log('✅ Indexes creation completed');

    // Create update trigger function
    console.log('⚡ Creating update triggers...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for each table
    const triggerTables = ['users', 'categories', 'menu_items', 'orders', 'payments'];
    for (const table of triggerTables) {
      await pool.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at 
        BEFORE UPDATE ON ${table} 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }
    console.log('✅ Triggers created successfully');

    console.log('🎉 All tables created successfully!');
    console.log('🌱 Now running seed data...');

    // Insert default categories
    const defaultCategories = [
      { name: 'Makanan Pembuka', description: 'Appetizers and starters' },
      { name: 'Makanan Utama', description: 'Main courses' },
      { name: 'Makanan Penutup', description: 'Desserts and sweets' },
      { name: 'Minuman', description: 'Beverages and drinks' }
    ];

    for (const category of defaultCategories) {
      try {
        await pool.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
          [category.name, category.description]
        );
        console.log(`✅ Inserted category: ${category.name}`);
      } catch (error) {
        console.log(`ℹ️  Category ${category.name} already exists or error: ${error.message}`);
      }
    }

    // Insert default users
    console.log('👥 Creating default users...');
    const defaultUsers = [
      {
        email: 'admin@dapurbunda.com',
        password: 'admin123',
        full_name: 'Administrator',
        role: 'admin',
        phone: '081234567890'
      },
      {
        email: 'customer@example.com',
        password: 'customer123',
        full_name: 'Customer Demo',
        role: 'customer',
        phone: '081234567891'
      }
    ];

    for (const user of defaultUsers) {
      try {
        await pool.query(
          'INSERT INTO users (email, password, full_name, role, phone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
          [user.email, user.password, user.full_name, user.role, user.phone]
        );
        console.log(`✅ Inserted user: ${user.email} (${user.role})`);
      } catch (error) {
        console.log(`ℹ️  User ${user.email} already exists or error: ${error.message}`);
      }
    }

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    process.exit();
  }
};

createTables();