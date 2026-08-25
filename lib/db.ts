import pg from "pg";

const globalForDb = globalThis as unknown as { atlasPool?: pg.Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return new pg.Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 });
}

function getPool() {
  if (!globalForDb.atlasPool) globalForDb.atlasPool = createPool();
  return globalForDb.atlasPool;
}

export const pool = {
  query<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: unknown[] = []) {
    return getPool().query<T>(text, params);
  },
};

export async function rows<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function one<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result.rows[0] ?? null;
}

export async function withTransaction<T>(work: (client: pg.PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
