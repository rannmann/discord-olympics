// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './data/olympics.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    }
  }
};
