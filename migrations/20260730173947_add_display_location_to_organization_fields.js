/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('organization_fields', (table) => {
    table.string('display_location', 50).defaultTo('table');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('organization_fields', (table) => {
    table.dropColumn('display_location');
  });
};
