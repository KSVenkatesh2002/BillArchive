/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if there are any null emails and backfill them
  await knex.raw(`UPDATE users SET email = username || '@example.com' WHERE email IS NULL`);

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('username');
  });

  await knex.schema.alterTable('users', (table) => {
    table.string('email', 255).notNullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('username', 255);
  });

  // Backfill usernames
  await knex.raw(`UPDATE users SET username = split_part(email, '@', 1)`);

  await knex.schema.alterTable('users', (table) => {
    table.string('username', 255).notNullable().alter();
  });
};
