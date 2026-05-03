import mysql from 'mysql2/promise';
import env from './env.js';

/**
 * MySQL Connection Pool
 * Uses mysql2/promise for async/await support with connection pooling.
 */
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  connectionLimit: env.db.connectionLimit,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: 'Z',           // Serialize JS Date params as UTC strings
  // Return dates as strings to avoid timezone issues
  dateStrings: true,
  // Support multiple statements for setup scripts
  multipleStatements: false,
});

// Force every connection to use UTC so TIMESTAMP values are stored and returned in UTC,
// regardless of the MySQL server's system timezone.
pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

/**
 * Test database connection on startup
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    throw error;
  }
}

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Execute a query and return first row
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} First row or null
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

/**
 * Execute an INSERT and return the inserted ID
 * @param {string} sql - INSERT SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<number>} Inserted row ID
 */
export async function insert(sql, params = []) {
  const [result] = await pool.query(sql, params);
  return result.insertId;
}

/**
 * Execute an UPDATE/DELETE and return affected rows count
 * @param {string} sql - UPDATE/DELETE SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<number>} Affected rows count
 */
export async function execute(sql, params = []) {
  const [result] = await pool.query(sql, params);
  return result.affectedRows;
}

/**
 * Get a connection from the pool for transactions
 * @returns {Promise<PoolConnection>}
 */
export async function getConnection() {
  return pool.getConnection();
}

export default pool;
