export async function up(knex) {
    await knex.schema.createTable('users', (table) => {
        table.increments('id');
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.string('email').notNullable().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('messages', (table) => {
        table.increments('id');
        table.string('content');
        table.integer('sender_id').unsigned();
        table.foreign('sender_id').references('users.id');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    const insertedUsers = await knex('users').insert({
        username: 'exampleUser2',
        password: 'examplePassword',
        email: 'user2@example.com'
    }).returning('id');

    const userId = insertedUsers[0].id;
    console.log('User ID:', userId);

    await knex('messages').insert({
        content: 'This message was sent with the migration.',
        sender_id: userId
    });

    console.log('Inserted message');
    return knex('messages').where('sender_id', userId);
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('messages');
    await knex.schema.dropTableIfExists('users');
}
