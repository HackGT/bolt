require('ts-node/register');
const fs = require("fs");


// Some duplicated code here from common.ts, but we can't use import in this file and we only need a couple values for knex
const path = require("path");
let config;
try {
    config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./config", "config.json"), "utf8"));
} catch (err) {
    if (err.code !== "ENOENT") {
        throw err;
    }
}
let URL;
let NODE_ENV = "development";

if (config.server) {
    if (config.server.postgresURL) {
        URL = config.server.postgresURL;
    }
    if (config.server.isProduction) {
        NODE_ENV = "production";
    }
}

if (process.env.POSTGRES_URL) {
    URL = process.env.POSTGRES_URL;
}

if (process.env.PRODUCTION && process.env.PRODUCTION.toLowerCase() === "true") {
    NODE_ENV = "production";
}

const migrations = {
    tableName: "knex_migrations",
    directory: path.normalize(path.join(__dirname, "/migrations"))
};

module.exports[NODE_ENV] = {
    client: 'pg',
    connection: URL,
    migrations
};
