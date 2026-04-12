import pool from '../src/config/database.js';

const checkTables = async () => {
  try {
    const [rows] = await pool.execute('SHOW TABLES');
    console.log('📋 Tables in database:');
    rows.forEach(row => {
      console.log(`   - ${Object.values(row)[0]}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    process.exit(1);
  }
};

checkTables();
