export async function up(pool) {
    try {
        await pool.query(`
            ALTER TABLE contact_submissions
            ADD COLUMN website VARCHAR(255) NULL AFTER message;
        `);
        return true;
    } catch (error) {
        // If the column was already added by a previous manual attempt, gracefully skip
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('      (Column already exists, safely continuing)');
            return true;
        }
        // If the table doesn't exist yet, schema.sql already has the column
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('      (Table does not exist yet. It will be created fully updated via db:setup)');
            return true;
        }
        throw error;
    }
}
