exports.up = function(knex) {
  return knex.schema
    .raw('CREATE TYPE device_type_enum AS ENUM (\'android\', \'ios\', \'web\')')
    .then(() => {
      return knex.schema.createTable('device_tokens', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('device_token', 255).unique().notNullable();
        table.specificType('device_type', 'device_type_enum').notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('last_used_at').defaultTo(knex.fn.now());
        
        table.index('user_id');
        table.index('device_token');
      });
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('device_tokens')
    .then(() => {
      return knex.schema.raw('DROP TYPE IF EXISTS device_type_enum');
    });
}; 