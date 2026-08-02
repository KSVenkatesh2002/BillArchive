const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres:VR6SuperBaseBill@db.ylsnxcnucnaxngjdusuo.supabase.co:5432/postgres'
});

async function main() {
  const users = await db('users').select('*');
  console.log('Users:');
  console.table(users);
  
  const orgs = await db('organizations').select('*');
  console.log('Orgs:');
  console.table(orgs);
  
  const roles = await db('roles').select('*');
  console.log('Roles:');
  console.table(roles);

  process.exit(0);
}

main().catch(console.error);
