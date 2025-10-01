import pool from './db.js';
import { v4 as uuidv4 } from 'uuid';

const seedCategories = async () => {
  try {
    console.log('🌱 Seeding default categories...');

    const defaultCategories = [
      { name: 'Makanan Pembuka', description: 'Appetizers and starters' },
      { name: 'Makanan Utama', description: 'Main courses' },
      { name: 'Makanan Penutup', description: 'Desserts and sweets' },
      { name: 'Minuman', description: 'Beverages and drinks' }
    ];

    for (const category of defaultCategories) {
      const id = uuidv4();
      await pool.query(
        'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [id, category.name, category.description]
      );
      console.log(`✅ Inserted category: ${category.name}`);
    }

    console.log('🎉 Categories seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    process.exit();
  }
};

seedCategories();