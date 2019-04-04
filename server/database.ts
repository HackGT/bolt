import { config } from "./common";

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

async function createTable(tableName: string, callback: (builder: knex.CreateTableBuilder) => any) {
	let exists = await DB.schema.withSchema("public").hasTable(tableName);
	if (!exists) {
		await DB.schema.withSchema("public").createTable(tableName, callback);
		console.log(`Created table ${tableName}`);
	}
}

export async function findUserByID(id: string): Promise<IUser | null> {
	let rows = await DB.from("users").where({ uuid: id });
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
}).catch(err => { throw err });
