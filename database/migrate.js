import fs from 'fs/promises';
import path from 'path';
import pool from '../src/config/database.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
    console.log('🚀 Starting Database Migrations runner...');
    
    // 1. Create migrations tracking table if not exists
    await pool.query(`
        CREATE TABLE IF NOT EXISTS system_migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            migration_name VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `);

    // 2. Scan the migrations folder
    const migrationsDir = path.join(__dirname, 'migrations');
    
    try {
        await fs.access(migrationsDir);
    } catch {
        await fs.mkdir(migrationsDir);
        console.log(`📁 Created migrations directory: ${migrationsDir}`);
    }

    const files = await fs.readdir(migrationsDir);
    // Sort files chronologically so e.g. 001_, 002_, 003_ execute in exact order
    const scriptFiles = files.filter(f => f.endsWith('.js')).sort();

    // 3. Execute all pending scripts securely
    for (const file of scriptFiles) {
        const [rows] = await pool.query('SELECT * FROM system_migrations WHERE migration_name = ?', [file]);
        if (rows.length === 0) {
            console.log(`\n⏳ Running Migration: ${file}...`);
            try {
                const filePath = path.join(migrationsDir, file);
                const fileUrl = new URL(`file://${filePath}`).href; 
                // Dynamically import the module
                const migration = await import(fileUrl);
                
                if (typeof migration.up === 'function') {
                    // Inject the MySQL pool directly into the script natively
                    await migration.up(pool);
                    
                    // Mark as completed entirely
                    await pool.query('INSERT INTO system_migrations (migration_name) VALUES (?)', [file]);
                    console.log(`✅ Successfully completed: ${file}`);
                } else {
                    console.error(`❌ Skipped ${file}: Missing export async function up(pool) {}`);
                }
            } catch (err) {
                console.error(`❌ Migration crashed on ${file}:`, err);
                process.exit(1); // Fail abruptly to prevent catastrophic schema cascade
            }
        } else {
             console.log(`⏭️  Skipping ${file} (Already executed in this environment)`);
        }
    }
    
    console.log('\n🎉 All migrations completed and synced!');
    process.exit(0);
}

runMigrations();
