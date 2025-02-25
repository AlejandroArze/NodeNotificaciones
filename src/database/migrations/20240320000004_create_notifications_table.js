exports.up = function(knex) {
  return knex.schema
    .raw('CREATE TYPE notification_status_enum AS ENUM (\'pending\', \'sent\', \'failed\', \'read\')')
    .then(() => {
      return knex.schema.createTable('notifications', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('title', 255).notNullable();
        table.text('body').notNullable();
        table.jsonb('data');
        table.string('type', 50).notNullable();
        table.specificType('status', 'notification_status_enum').defaultTo('pending');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('sent_at');
        table.timestamp('read_at');
        
        table.index('user_id');
        table.index('status');
        table.index('type');
      });
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('notifications')
    .then(() => {
      return knex.schema.raw('DROP TYPE IF EXISTS notification_status_enum');
    });
}; 