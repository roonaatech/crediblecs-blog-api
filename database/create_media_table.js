import pool from '../src/config/database.js';

const createMediaTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS media (
      id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      filename      VARCHAR(255)    NOT NULL,
      original_name VARCHAR(255)    NOT NULL,
      mime_type     VARCHAR(100)    NOT NULL,
      size          INT UNSIGNED    NOT NULL,
      disk_path     VARCHAR(255)    NOT NULL,
      public_url    VARCHAR(255)    NOT NULL,
      uploaded_by   BIGINT UNSIGNED NULL,
      created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES authors(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `;

  try {
    console.log('🚀 Creating media table...');
    await pool.execute(query);
    console.log('✅ Media table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating media table:', error);
    process.exit(1);
  }
};

createMediaTable();
