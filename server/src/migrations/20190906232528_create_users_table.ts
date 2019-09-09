import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable("users", table => {
        table.uuid("uuid").notNullable().unique().primary();
        table.string("token", 256);

        table.text("name").notNullable();
        table.text("email").notNullable();
        table.text("phone").notNullable();
        table.text("slackUsername").notNullable();
        table.boolean("haveID").notNullable().defaultTo(false);
        table.boolean("admin").notNullable().defaultTo(false);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists("users");
}

