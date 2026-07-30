const knex = require('knex');
const config = require('../knexfile.js');
const db = knex(config.development || config);

async function test() {
  try {
    const orgs = await db('organizations').select('*');
    console.log('Orgs:', orgs.map(o => ({ id: o.id, slug: o.slug, name: o.name, enabled_fields: o.enabled_fields })));
  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

test();
