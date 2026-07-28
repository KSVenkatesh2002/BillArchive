require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('\n❌ [Knex Error] DATABASE_URL is missing in .env.local!');
  console.error('Please add DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.ylsnxcnucnaxngjdusuo.supabase.co:5432/postgres to .env.local before running migrations.\n');
}

module.exports = {
  client: 'pg',
  connection: connectionString ? {
    connectionString,
    ssl: { rejectUnauthorized: false }
  } : {},
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

