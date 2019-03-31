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

export async function findUserByID(tableName: string, id: string): Promise<IUser | null> {
	DB.from("Users").where({ uuid: "52c3cbc9-ae9b-4496-ae4c-903b5e211152" }).then(rows => {
		console.log(rows);
	});
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
createTable("Users", table => {
	table.uuid("uuid").notNullable().unique().primary();
	table.string("token", 256);

	table.text("name").notNullable();
	table.text("email").notNullable();
	table.text("phone").notNullable();
	table.text("slackUsername").notNullable();
	table.boolean("haveID").notNullable().defaultTo(false);
	table.boolean("admin").notNullable().defaultTo(false);
}).catch(err => { throw err });
