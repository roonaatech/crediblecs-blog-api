export async function up(pool) {
    try {
        await pool.query(`
            ALTER TABLE contact_submissions
            ADD COLUMN message TEXT NULL AFTER service;
        `);
        return true;
    } catch (error) {
        // If the column was already added by a previous manual attempt, gracefully slide over it
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('      (Column already exists manually, safely continuing)');
            return true;
        }
        throw error; // Let the migration runner catch any actual lethal errors
    }
}
