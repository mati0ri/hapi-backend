/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // Création de la table users en premier
    await knex.schema.createTable('users', (table) => {
        table.increments('id');
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.string('email').notNullable().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Ensuite, création de la table Messages
    await knex.schema.createTable('Messages', (table) => {
        table.increments('id');
        table.string('content');
        table.integer('sender_id').unsigned();
        table.foreign('sender_id').references('users.id'); // Clé étrangère faisant référence à users.id
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Insérer un message exemple (facultatif)
    await knex('Messages').insert([
        { content: 'This message was sent with the migration.', sender_id: 1 } // Assurez-vous que le sender_id 1 existe
    ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    // Supprimer la table Messages en premier à cause de la dépendance
    await knex.schema.dropTableIfExists('Messages');

    // Ensuite, supprimer la table users
    await knex.schema.dropTableIfExists('users');
};

