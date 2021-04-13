import { Knex } from "knex";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable("items", table => {
    table.increments("item_id"); // use of increments also makes this the primary key
    table.text("item_name").notNullable();
    table.text("description").notNullable();
    table.text("imageUrl").notNullable();
    table
      .integer("category_id")
      .unsigned()
      .references("category_id")
      .inTable("categories")
      .notNullable();
    table.integer("totalAvailable").notNullable();
    table.integer("maxRequestQty").notNullable();
    table.decimal("price", 6, 2).nullable().defaultTo(0);
    table.boolean("hidden").notNullable().defaultTo(false);
    table.boolean("returnRequired").notNullable().defaultTo(true);
    table.boolean("approvalRequired").notNullable().defaultTo(true);
    table.text("owner").notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTableIfExists("items");
}
