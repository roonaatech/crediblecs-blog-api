import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Setup Script
 * Creates the database and all tables from schema.sql
 * 
 * Usage: node database/setup.js
 */
async function setup() {
  console.log('🔧 Setting up CredibleCS Blog database...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Creating database and tables...');
    await connection.query(schema);
    console.log('✅ Database schema created successfully!\n');

    // Show created tables
    const [tables] = await connection.query(
      `SELECT TABLE_NAME, TABLE_ROWS 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME || 'crediblecs_blog']
    );

    console.log('📋 Tables created:');
    tables.forEach(t => {
      console.log(`   ✓ ${t.TABLE_NAME}`);
    });
    console.log(`\n   Total: ${tables.length} tables\n`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }

  console.log('🎉 Database setup complete!\n');
  console.log('Next steps:');
  console.log('  1. Run seed data:  node database/seed.js');
  console.log('  2. Start server:   npm run dev\n');
}

setup();
