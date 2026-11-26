// После восстановления данных SERIAL-счётчики могут отстать от существующих ID.
// Имена таблиц задаются только кодом приложения, не пользовательским вводом.
export async function alignSerialSequences(pool, tables) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const table of tables) {
      await client.query(`LOCK TABLE ${table} IN SHARE MODE`);
      await client.query(`
        SELECT setval(
          pg_get_serial_sequence('${table}', 'id'),
          GREATEST(COALESCE(MAX(id), 1), (SELECT last_value FROM ${table}_id_seq)),
          true
        )
        FROM ${table}
      `);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
