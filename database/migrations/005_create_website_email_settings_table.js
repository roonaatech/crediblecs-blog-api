export async function up(pool) {
    try {
        // 1. Create table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS website_email_settings (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                website VARCHAR(255) NOT NULL UNIQUE,
                sender_email VARCHAR(255) NOT NULL,
                recipient_email VARCHAR(255) NOT NULL,
                email_subject VARCHAR(255) NULL,
                email_body TEXT NULL,
                smtp_host VARCHAR(255) NULL,
                smtp_port INT NULL,
                smtp_user VARCHAR(255) NULL,
                smtp_pass VARCHAR(255) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_website_email_settings_website (website)
            ) ENGINE=InnoDB;
        `);

        // 2. Seed default settings for CCS if not exists
        const [existing] = await pool.query('SELECT id FROM website_email_settings WHERE website = ?', ['CCS']);
        if (existing.length === 0) {
            await pool.query(`
                INSERT INTO website_email_settings (website, sender_email, recipient_email, email_subject, email_body)
                VALUES (?, ?, ?, ?, ?)
            `, [
                'CCS',
                'noreply@crediblecs.com',
                'leads@crediblecs.com',
                'New Contact Submission - {{website}}',
                'You have received a new contact submission on {{website}} from {{name}}.\n\nName: {{name}}\nPhone: {{phone}}\nEmail: {{email}}\nService: {{service}}\nMessage: {{message}}\n\nSource Website: {{website}}'
            ]);
        }
        
        return true;
    } catch (error) {
        console.error('Error running migration 005_create_website_email_settings_table:', error);
        throw error;
    }
}
