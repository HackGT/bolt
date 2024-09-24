# bolt

Simple and efficient hardware checkout system

## Required environment variables

### Backend

| Variable                       | Description                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| secrets.adminKey               | Random string of letters and numbers                                                                                          |
| secrets.session                | Random string of letters and numbers used to secure sessions                                                                  |
| secrets.groundTruth.url        | URL to [Ground Truth](https://github.com/hackgt/ground-truth) authentication service                                          |
| secrets.groundTruth.id         | Client ID provided by Ground Truth                                                                                            |
| secrets.groundTruth.secret     | Client secret provided by Ground Truth                                                                                        |
| secrets.admins.domains         | Email domains that will result in a user being automatically made an admin                                                    |
| secrets.admins.emails          | Email address that will result in a user being automatically made an admin                                                    |
| secrets.server.postgresURL     | URL to connect to the postgresql database. If you need to supply database connection credentials, this is the place to do it. |
| secrets.server.isProduction    | Boolean indicating whether to run the server in production mode.                                                              |
| secrets.server.defaultTimezone | Default server timezone                                                                                                       |

### Frontend

In /client, .env contains defaults for required variables. Create .env.local to override these environment
variables, or define them as temporary environment variables in your shell.

| Variable                  | Description                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| REACT_APP_API_ENVIRONMENT  | "production" or "development" depending on the environment you want to connect to (local development should be "development") |

# Development

`yarn start` to run the frontend
`yarn build` to build the app for production

## Code Style

Code style is enforced by eslint, prettier, and stylelint via config.
