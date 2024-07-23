/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('sports', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('machine_name').notNullable().unique();
      table.string('games_league').notNullable();
      table.boolean('active').defaultTo(true);
      table.timestamps(true, true);
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('sports');
  };
