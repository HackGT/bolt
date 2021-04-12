import { Knex } from "knex";

export async function up(knex: Knex): Promise<any> {
    const REQUEST_STATUSES: string[] = [
        "SUBMITTED",
        "APPROVED",
        "DENIED",
        "ABANDONED",
        "CANCELLED",
        "READY_FOR_PICKUP",
        "FULFILLED",
        "RETURNED",
        "LOST",
        "DAMAGED"
    ];

    return knex.schema.createTable("requests", table => {
        table.increments("request_id"); // use of increments also makes this the primary key
        table.integer("request_item_id").unsigned().references("item_id").inTable("items").notNullable();
        table.integer("quantity").unsigned().notNullable();
        table.uuid("user_id").references("uuid").inTable("users").notNullable();
        table.enum("status", REQUEST_STATUSES);
        table.timestamps(true, true); // adds timestamps with timezones to requests,
        //     the caveat is that as of 2019 the TIMESTAMP type will overflow in 2038... FYI future Earthlings working
        //     on this project.  http://code.openark.org/blog/mysql/timestamp-vs-datetime-which-should-i-be-using
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists("requests");
}

