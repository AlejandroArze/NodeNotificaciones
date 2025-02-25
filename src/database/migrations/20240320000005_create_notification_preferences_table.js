exports.up = function(knex) {
  return knex.schema.createTable('notification_preferences', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('notification_type', 50).notNullable();
    table.boolean('is_enabled').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['user_id', 'notification_type']);
    table.index('user_id');
    table.index('notification_type');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notification_preferences');
}; 