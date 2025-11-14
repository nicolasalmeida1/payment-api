export function up(knex) {
  return knex.schema.createTable('payment_history', (table) => {
    table.increments('id').primary();

    table
      .uuid('payment_id')
      .notNullable()
      .references('id')
      .inTable('payment')
      .onDelete('CASCADE');

    table.string('event').notNullable();
    table.jsonb('event_data').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable('payment_history');
}
