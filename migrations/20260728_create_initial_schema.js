/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Enable pgcrypto extension for gen_random_uuid()
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // 1. Roles Table (UUID PK)
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('code', 50).notNullable().unique(); // 'superAdmin', 'admin', 'user'
    table.string('name', 255).notNullable();
    table.text('description');
    table.timestamps(true, true);
  });

  // 2. Organizations Table (UUID PK + unique slug for vanity URLs)
  await knex.schema.createTable('organizations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('slug', 255).notNullable().unique(); // 'dialedin', 'acme'
    table.string('name', 255).notNullable();
    table.timestamps(true, true);
  });

  // 3. Organization Statuses Table (Customizable per Organization)
  await knex.schema.createTable('organization_statuses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name', 50).notNullable(); // e.g. 'inprocess', 'ready_for_qa'
    table.string('label', 255).notNullable(); // e.g. 'In Process', 'Ready for QA'
    table.string('color', 50).defaultTo('orange');
    table.integer('display_order').defaultTo(0);
    table.boolean('is_default').defaultTo(false);
    table.timestamps(true, true);
    table.unique(['organization_id', 'name']);
  });

  // 4. Organization Dynamic Fields Schema Table
  await knex.schema.createTable('organization_fields', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('label', 255).notNullable();
    table.string('type', 50).notNullable(); // text, textarea, number, dropdown, multi_select, date, boolean, url
    table.text('default_value');
    table.boolean('is_required').defaultTo(false);
    table.timestamps(true, true);
    table.unique(['organization_id', 'name']);
  });

  // 5. Organization Field Options Table (Normalized Dropdown/Multi-select choices)
  await knex.schema.createTable('organization_field_options', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('field_id').references('id').inTable('organization_fields').onDelete('CASCADE');
    table.string('option_label', 255).notNullable();
    table.string('option_value', 255).notNullable();
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
  });

  // 6. Users Table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username', 255).notNullable().unique(); // Vanity ID
    table.string('name', 255).notNullable();
    table.string('email', 255).unique();
    table.text('password_hash').notNullable();
    table.uuid('role_id').references('id').inTable('roles').onDelete('SET NULL');
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // 7. User Preferences Table
  await knex.schema.createTable('user_preferences', (table) => {
    table.uuid('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
    table.string('default_project', 255);
    table.jsonb('preferences').defaultTo('{}');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 8. User Projects Table
  await knex.schema.createTable('user_projects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['organization_id', 'name']);
  });

  // 9. Tasks Table
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('nick_name', 255);
    table.string('clickup_id', 255);
    table.string('status', 50).notNullable().defaultTo('inprocess');
    table.uuid('status_id').references('id').inTable('organization_statuses').onDelete('SET NULL');
    table.timestamp('work_date').defaultTo(knex.fn.now());
    table.string('project', 255);
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.decimal('allocated_hours', 10, 2).defaultTo(0);
    table.decimal('billed_hours', 10, 2).defaultTo(0);
    table.decimal('actual_hours', 10, 2).defaultTo(0);
    table.timestamps(true, true);
  });

  // 10. Task Custom Field Values Table
  await knex.schema.createTable('task_custom_values', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.string('field_name', 255).notNullable();
    table.text('field_value');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['task_id', 'field_name']);
  });

  // 11. Task Doc Links Table
  await knex.schema.createTable('task_doc_links', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.string('label', 255).notNullable();
    table.text('url').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 12. Time Entries Table
  await knex.schema.createTable('time_entries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.timestamp('date').notNullable().defaultTo(knex.fn.now());
    table.decimal('allocated_hours', 10, 2).defaultTo(0);
    table.decimal('billed_hours', 10, 2).defaultTo(0);
    table.decimal('actual_hours', 10, 2).defaultTo(0);
    table.text('note');
    table.string('logged_by', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 13. Status History Table
  await knex.schema.createTable('status_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.string('status', 50).notNullable();
    table.string('changed_by', 255);
    table.timestamp('timestamp').defaultTo(knex.fn.now());
  });

  // 14. Settings Table
  await knex.schema.createTable('settings', (table) => {
    table.string('key', 255).primary();
    table.jsonb('value').notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // --- Enable Row-Level Security (RLS) ---
  const rlsTables = [
    'tasks', 'organization_statuses', 'organization_fields', 
    'organization_field_options', 'user_projects', 'task_custom_values', 
    'task_doc_links', 'time_entries', 'status_history'
  ];

  for (const t of rlsTables) {
    await knex.raw(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;`);
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('status_history');
  await knex.schema.dropTableIfExists('time_entries');
  await knex.schema.dropTableIfExists('task_doc_links');
  await knex.schema.dropTableIfExists('task_custom_values');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('user_projects');
  await knex.schema.dropTableIfExists('user_preferences');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('organization_field_options');
  await knex.schema.dropTableIfExists('organization_fields');
  await knex.schema.dropTableIfExists('organization_statuses');
  await knex.schema.dropTableIfExists('organizations');
  await knex.schema.dropTableIfExists('roles');
};
