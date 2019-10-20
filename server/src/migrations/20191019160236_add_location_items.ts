import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    const existingLocations = await knex.from("locations");
    console.log(existingLocations);
    let defaultLocation;
    if (!existingLocations.length) { // create a default location if one doesn't exist
        defaultLocation = await knex("locations").insert({location_name: "HackGT Hardware Desk"}).returning(["location_id", "location_name"]);
        defaultLocation = defaultLocation[0];
        console.log(defaultLocation);

    } else {
        defaultLocation = existingLocations[0];

    }
    return knex.schema.table("items", table => {
            table.integer("location_id").unsigned()
                .references("location_id").inTable("locations")
                .notNullable().defaultTo(defaultLocation.location_id);
        }
    );
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.table("locations", table => {
        table.dropColumns("location_id", "location_name");
    });
}

