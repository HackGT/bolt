require("ts-node/register"); // this line is what makes Knex migrations work with TypeScript!  Thanks to https://gist.github.com/tukkajukka/9893e5f111862d06044b73fa944a8741
const fs = require("fs");


// Some duplicated code here from common.ts, but we can't use import in this file and we only need a couple values for knex
const path = require("path");

let connectionUrl;
if (!(process.env.PRODUCTION && process.env.PRODUCTION.toLowerCase() === "true")) {
    let config;
    try {
        config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./config", "config.json"), "utf8"));
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }

    if (config.server && config.server.postgresURL) {
        connectionUrl = config.server.postgresURL;
    }
}

if (process.env.POSTGRES_URL) {
    // @ts-ignore
    connectionUrl = process.env.POSTGRES_URL;
}

const migrations = {
    tableName: "knex_migrations",
    directory: path.normalize(path.join(__dirname, "/migrations"))
};

module.exports = {
    client: "pg",
    connection: connectionUrl,
    migrations
};
