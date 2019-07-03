import {config} from "./common";
//
// Database connection
//
import knex from "knex";

const DBConfig: knex.Config = {
    client: "pg",
    connection: config.server.postgresURL,
    searchPath: ["knex", "public"]
};

export const DB = knex(DBConfig);

// Set up sessions table used by connect-pg-simple (our session store)
// From: https://github.com/voxpelli/node-connect-pg-simple/blob/master/table.sql
async function setUpSessionsTable() {
    const exists = await DB.schema.withSchema("public").hasTable("session");
    if (!exists) {
        await DB.raw(`
			CREATE TABLE "session" (
				"sid" varchar NOT NULL COLLATE "default",
				"sess" json NOT NULL,
				"expire" timestamp(6) NOT NULL
			)
			WITH (OIDS=FALSE);
			ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
		`);
        console.log("Created session table");
    }
}
setUpSessionsTable().catch(err => { throw err; });

async function createTable(tableName: string, callback: (builder: knex.CreateTableBuilder) => any) {
    const exists = await DB.schema.withSchema("public").hasTable(tableName);
    if (!exists) {
        await DB.schema.withSchema("public").createTable(tableName, callback);
        console.log(`Created table ${tableName}`);
    }
}

export async function findUserByID(id: string): Promise<IUser | null> {
    const rows = await DB.from("users").where({ uuid: id });
    if (rows[0]) {
        return rows[0] as IUser;
    }
    return null;
}

export async function createRecord<T extends object>(tableName: string, data: T) {
    await DB.into(tableName).insert(data);
    return data;
}

//
// Users
//
export interface IUser {
    uuid: string; // Primary key
    token: string; // Ground Truth token

    name: string;
    email: string;
    phone: string;
    slackUsername: string;

    haveID: boolean;
    admin: boolean;
}
createTable("users", table => {
    table.uuid("uuid").notNullable().unique().primary();
    table.string("token", 256);

    table.text("name").notNullable();
    table.text("email").notNullable();
    table.text("phone").notNullable();
    table.text("slackUsername").notNullable();
    table.boolean("haveID").notNullable().defaultTo(false);
    table.boolean("admin").notNullable().defaultTo(false);
}).then(() => {
    createTable("categories", table => {
        table.increments("category_id"); // use of increments also makes this the primary key
        table.text("category_name").notNullable().unique();
    });
}).then(() => {
    createTable("items", table => {
        table.increments("item_id"); // use of increments also makes this the primary key
        table.text("item_name").notNullable();
        table.text("description").notNullable();
        table.text("imageUrl").notNullable();
        table.integer("category_id").unsigned().references("category_id").inTable("categories").notNullable();
        table.integer("totalAvailable").notNullable();
        table.integer("maxRequestQty").notNullable();
        table.decimal("price", 6, 2).nullable().defaultTo(0);
        table.boolean("hidden").notNullable().defaultTo(false);
        table.boolean("returnRequired").notNullable().defaultTo(true);
        table.boolean("approvalRequired").notNullable().defaultTo(true);
        table.text("owner").notNullable();
    });
}).then(() => {
    const REQUEST_STATUSES: string[] = [
        "SUBMITTED",
        "APPROVED",
        "DENIED",
        "ABANDONED",
        "READY_FOR_PICKUP",
        "FULFILLED",
        "RETURNED",
        "LOST",
        "DAMAGED"
    ];

    createTable("requests", table => {
        table.increments("request_id"); // use of increments also makes this the primary key
        table.integer("request_item_id").unsigned().references("item_id").inTable("items").notNullable();
        table.integer("quantity").unsigned().notNullable();
        table.uuid("user_id").references("uuid").inTable("users").notNullable();
        table.enum("status", REQUEST_STATUSES);
        table.timestamps(true, true); // adds timestamps with timezones to requests,
        //     the caveat is that as of 2019 the TIMESTAMP  type will overflow in 2038... FYI future Earthlings working
        //     on this project.  http://code.openark.org/blog/mysql/timestamp-vs-datetime-which-should-i-be-using
    });
}).catch(err => { throw err; });

//
// Items
//
export interface Category {
    id: number;
    name: string;
}

export interface IItem {
    id: number; // Primary key
    name: string;
    description: string;
    imageUrl: string;
    categoryId: number;
    totalAvailable: number;
    maxRequestQty: number;
    price: number;
    hidden: boolean;
    returnRequired: boolean;
    approvalRequired: boolean;
    owner: string;
}
