import {config} from "./common";
//
// Database connection
//
import { Knex, knex } from "knex";
import * as path from "path";

const migrations = {
    tableName: "knex_migrations",
    directory: path.normalize(path.join(__dirname, "/migrations"))
};

const DBConfig: Knex.Config = {
    client: "pg",
    connection: config.server.postgresURL,
    searchPath: ["knex", "public"],
    migrations
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
