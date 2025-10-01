// backend/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add connection timeout and retry logic
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Test database connection
pool.on('connect', (client) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Database connected successfully');
  }
});

pool.on('error', (err, client) => {
  console.error('❌ Database connection error:', err.message);
  console.error('💡 Make sure PostgreSQL is running and credentials are correct');
});

export default pool;
