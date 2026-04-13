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
        // If the table doesn't exist yet, it means db:setup hasn't run in UAT yet. 
        // When it does run, schema.sql already contains the new schema definition.
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('      (Table does not exist yet. It will be created fully updated via db:setup)');
            return true;
        }
        throw error; // Let the migration runner catch any actual lethal errors
    }
}
