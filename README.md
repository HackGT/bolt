# bolt
Simple and efficient hardware checkout system

# Server setup
Required items:

 - A postrgesql server and database
 - Install dependencies: `npm install`
    - **NOTE:** For server deployments, the `postinstall` NPM script, which will also run when you run `npm install`, will
    try to run the Knex (database abstraction layer) migrations.  Since you probably haven't added your database configuration,
    this step will fail.  Just ignore the error for now and follow the steps after this to properly run the migrations. 
 - Configure the required environment variables in `configs/config.json`.  You can copy and rename `configs/configs.json.example`.
 - Re-run the database migrations using `npm run knex:migrate:latest`.

By default, DB migrations will run automatically if you run `npm start`.  To avoid this, you can start the server using `npm run dev` or `npm run start:no-migration` and database migrations will *not* run before you start the server.

# Client setup

Note: the hardware desk page (/admin/desk) relies on a WebSocket connection to the server. The client assumes that you are
running the server on port 3000.  If this isn't right, then you'll need to update the port in

1. The `proxy` property in the **client's** package.json file
2. The local development WebSocket URL in `client/index.tsx`
3. `baseUrl` in `client/src/components/admin/AdminOverviewContainer.tsx`

to use the correct server port.  Make sure you don't commit the files with the changed port!
 
Required environment variables
-----

### Backend

| Variable | Description |
|----|----|
| secrets.adminKey | Random string of letters and numbers
| secrets.session | Random string of letters and numbers used to secure sessions
| secrets.groundTruth.url | URL to [Ground Truth](https://github.com/hackgt/ground-truth) authentication service
| secrets.groundTruth.id | Client ID provided by Ground Truth
| secrets.groundTruth.secret | Client secret provided by Ground Truth
| secrets.admins.domains | Email domains that will result in a user being automatically made an admin
| secrets.admins.emails | Email address that will result in a user being automatically made an admin
| secrets.server.postgresURL | URL to connect to the postgresql database.  If you need to supply database connection credentials, this is the place to do it.
| secrets.server.isProduction | Boolean indicating whether to run the server in production mode.
| secrets.server.defaultTimezone | Default server timezone

### Frontend

In /client, .env contains defaults for required variables.  Create .env.local to override these environment
variables, or define them as temporary environment variables in your shell.

| Variable | Description |
|----|----|
| REACT_APP_ENABLE_BUGSNAG | "true" or "false" whether to enable the Bugsnag integration.  Keep disabled for local development unless testing Bugsnag-specific features
| REACT_APP_BUGSNAG_API_KEY | Required if REACT_APP_ENABLE_BUGSNAG is enabled.  Value should be the Notifier API Key for the Bugsnag project

Development
====
- For local development:
  - Access server endpoints, such as authentication, using the development server.
  - For frontend development, run `npm start` inside the `/client` directory.
- You can find GraphiQL at `/api/graphiql`, but note that this endpoint is restricted to admin users.  For local development,
promote your account to an admin in order to access GraphiQL.

Code Style
----
Code style is enforced by tslint.  The project standard is 4-space indentation; please ensure that any files you change
comply with this.

If you use an editor like IntelliJ, you can automatically apply most of the code style specifications found in `tslint.json`.

Database
----
**Note** - If you add an item to the database manually (e.g., by manually executing SQL queries in Postgres),
knex (our DB query builder) will not know about this and you'll get errors on any table that has an auto-incrementing
primary key.  Solution: keep running your query (if the IDs are still a low number) and eventually knex will catch up, or
only insert rows into these tables through existing Bolt APIs (e.g., create items using the GraphQL API or web UI).
Source: https://github.com/tgriesser/knex/issues/1855#issuecomment-416076299
