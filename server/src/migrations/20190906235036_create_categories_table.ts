import { Knex } from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("categories", table => {
    table.increments("category_id"); // use of increments also makes this the primary key
    table.text("category_name").notNullable().unique();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTableIfExists("categories");
}
