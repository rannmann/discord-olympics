/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('sports', function (table) {
            table.uuid('id').primary();
            table.string('name').notNullable();
            table.string('machine_name').notNullable().unique();
            table.string('games_league').notNullable();
            table.boolean('active').defaultTo(true);
            table.timestamps(true, true);
        })
        .createTable('events', table => {
            table.uuid('id').primary();
            table.string('title').notNullable();
            table.string('status').notNullable();
            table.bigInteger('start_date').notNullable();
            table.bigInteger('end_date').notNullable();
            table.boolean('is_medal_session').notNullable();
            table.integer('sport_id').unsigned().notNullable();
            table.foreign('sport_id').references('id').inTable('sports');
            table.text('video_url').notNullable();
            table.text('hero_image').notNullable();
            table.text('thumbnail').notNullable();
            table.text('summary').notNullable();
        })
        .createTable('countries', function (table) {
            table.uuid('id').primary();
            table.string('name').notNullable();
            table.string('code').notNullable();
        })
        .createTable('athletes', function (table) {
            table.uuid('id').primary();
            table.string('type').notNullable();
            table.string('name').notNullable();
            table.string('machine_name').notNullable();
            table.integer('athlete_id'); // Nullable.
        })
        // Now add pivot tables for countries/athletes for events
        .createTable('event_countries', function (table) {
            table.uuid('event_id').notNullable();
            table.foreign('event_id').references('id').inTable('events');
            table.uuid('country_id').notNullable();
            table.foreign('country_id').references('id').inTable('countries');
            table.unique(['event_id', 'country_id']);
        })
        .createTable('event_athletes', function (table) {
            table.uuid('event_id').notNullable();
            table.foreign('event_id').references('id').inTable('events');
            table.uuid('athlete_id').notNullable();
            table.foreign('athlete_id').references('id').inTable('athletes');
            table.unique(['event_id', 'athlete_id']);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTable('sports')
        .dropTable('event_athletes')
        .dropTable('event_countries')
        .dropTable('athletes')
        .dropTable('countries')
        .dropTable('events');
};