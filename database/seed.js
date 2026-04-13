import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Seed Script
 * Populates the database with initial data from seed.sql
 * 
 * Usage: node database/seed.js
 */
async function seed() {
  console.log('🌱 Seeding CredibleCS Blog database...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crediblecs_blog',
    multipleStatements: true,
  });

  try {
    // Read and execute seed data
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');

    console.log('📝 Inserting seed data...');
    await connection.query(seedData);

    // Show counts
    const tables = ['authors', 'categories', 'tags', 'posts', 'post_tags', 'media'];
    console.log('\n📊 Seed data summary:');

    for (const table of tables) {
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   ✓ ${table}: ${rows[0].count} rows`);
    }

    console.log('\n✅ Seed data inserted successfully!');

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  Some seed data already exists (duplicate entries skipped).');
      console.log('   If you want a fresh start, run: npm run db:reset');
    } else {
      console.error('❌ Seeding failed:', error.message);
      process.exit(1);
    }
  } finally {
    await connection.end();
  }

  console.log('\n🎉 Database seeding complete!');
  console.log('\nDefault admin login:');
  console.log('  Email:    admin@crediblecs.com');
  console.log('  Password: Admin@123\n');
  console.log('Start the server:  npm run dev\n');
}

seed();
