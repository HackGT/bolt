# bolt
Simple and efficient hardware checkout system

# Server setup
Required items:

 - A postrgesql server and database
 - Install dependencies: `npm install`
 - Setup the sessions database by running: `psql mydatabase < node_modules/connect-pg-simple/table.sql`
 - Configure the required environment variables in `configs/config.json`.  You can copy and rename `configs/configs.json.example`.
 
Required environment variables
-----

| Variable | Description |
|----|----|
| secrets.adminKey | Random string of letters and numbers
| secrets.session | Random string of letters and numbers used to secure sessions
| secrets.groundTruth.url | URL to [Ground Truth](https://github.com/hackgt/ground-truth) authentication service
| secrets.groundTruth.id | Client ID provided by Ground Truth
| secrets.groundTruth.secret | Client secret provided by Ground Truth
| secrets.admins.domains | Email domains that will result in a user being automatically made an admin
| secrets.admins.emails | Email address that will result in a user being automatically made an admin