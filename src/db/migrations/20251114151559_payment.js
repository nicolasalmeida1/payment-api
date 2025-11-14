export function up(knex) {
  return knex.schema.createTable('payment', (table) => {
    table.uuid('id').primary();
    table.string('cpf', 11).notNullable();
    table.string('description').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table
      .enu('payment_method', ['PIX', 'CREDIT_CARD'], {
        useNative: true,
        enumName: 'payment_method',
      })
      .notNullable();
    table
      .enu('status', ['PENDING', 'PAID', 'FAIL'], {
        useNative: true,
        enumName: 'payment_status',
      })
      .notNullable()
      .defaultTo('PENDING');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema
    .dropTable('payment')
    .raw('DROP TYPE IF EXISTS payment_method')
    .raw('DROP TYPE IF EXISTS payment_status');
}
