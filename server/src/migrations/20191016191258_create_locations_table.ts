import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable("locations", table => {
        table.increments("location_id"); // use of increments also makes this the primary key
        table.text("location_name").notNullable().unique();
        table.boolean("location_hidden").notNullable().defaultTo(false);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists("locations");
}
