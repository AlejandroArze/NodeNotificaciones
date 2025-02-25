exports.up = function(knex) {
  return knex.schema.createTable('user_sessions', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('last_login').defaultTo(knex.fn.now());
    table.timestamp('last_activity').defaultTo(knex.fn.now());
    table.boolean('is_active').defaultTo(true);
    table.string('ip_address', 45);
    table.text('user_agent');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_sessions');
}; 