export async function up(pool) {
    try {
        await pool.query(`
            ALTER TABLE contact_submissions
            MODIFY COLUMN status ENUM('new', 'contacted', 'resolved', 'consumed') DEFAULT 'new';
        `);
        return true;
    } catch (error) {
        throw error;
    }
}
