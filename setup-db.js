import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database...');

    // PostgreSQL path for Windows
    const psqlPath = '"C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe"';
    
    // Step 1: Create database
    console.log('📦 Creating database...');
    try {
      await execAsync(`${psqlPath} -U postgres -c "CREATE DATABASE restaurant;"`);
      console.log('✅ Database "restaurant" created successfully');
    } catch (error) {
      if (error.stderr && error.stderr.includes('already exists')) {
        console.log('ℹ️  Database "restaurant" already exists');
      } else {
        console.error('❌ Error creating database:', error.message);
        throw error;
      }
    }

    // Step 2: Run schema
    console.log('🏗️  Creating tables...');
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      await execAsync(`${psqlPath} -U postgres -d restaurant -f "${schemaPath}"`);
      console.log('✅ Database schema created successfully');
    } else {
      console.error('❌ Schema file not found:', schemaPath);
      throw new Error('Schema file not found');
    }

    // Step 3: Seed data
    console.log('🌱 Seeding initial data...');
    const seedPath = path.join(process.cwd(), 'seed.js');
    if (fs.existsSync(seedPath)) {
      await execAsync('node seed.js');
      console.log('✅ Database seeded successfully');
    } else {
      console.log('ℹ️  No seed file found, skipping seeding');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('🔗 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n📋 Manual setup instructions:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Run: psql -U postgres -c "CREATE DATABASE restaurant;"');
    console.log('3. Run: psql -U postgres -d restaurant -f schema.sql');
    console.log('4. Run: node seed.js');
    process.exit(1);
  }
};

setupDatabase();