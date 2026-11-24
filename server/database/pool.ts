import pg from 'pg';

const { DATABASE_URL, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT, PGHOST } = process.env;

if (!DATABASE_URL && (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_PORT || !PGHOST)) {
  throw new Error('Set DATABASE_URL or the PostgreSQL connection variables in .env');
}

export const pool = new pg.Pool(DATABASE_URL ? { connectionString: DATABASE_URL } : {
  host: PGHOST,
  port: Number(POSTGRES_PORT),
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
});

pool.on('error', (error) => {
  console.error('Unexpected idle database connection error', error);
});
