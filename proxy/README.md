# LetsPeppol Proxy
This is what runs on api.letspeppol.org.

## Development
Ask @michielbdejong if you need to run this code in development, because the current instructions require A-Cube API credentials.
You could also contact A-Cube directly if you want to use this code in an instance independent from the one sponsored by Ponder Source.

Apart from an A-Cube account you will need a postgres database somewhere and that you have the [`json` CLI tool](https://github.com/trentm/json?tab=readme-ov-file#installation) installed.
Create a `proxy/.env` file that looks like this:
```
ACUBE_USR="your-acube-username"
ACUBE_PWD="your-acube-passwords"
PASS_HASH_SALT=some-secret-string
DATABASE_URL=postgres://letspeppol:something-secret@localhost:5432/letspeppol
```

Then run:
```sh
cd proxy
# load the variables from your .env file:
. ./.env
# get a fresh token for the A-Cube API:
export ACUBE_TOKEN=`./auth.sh | json token`
# create and populate the users database:
psql $DATABASE_URL -c "create table passwords (peppolId varchar, passHash varchar)"
psql $DATABASE_URL -c "create table sessions (peppolId varchar, token varchar, expires timestamp)"
psql $DATABASE_URL -c "insert into passwords (peppolId, passHash) values ('9915:1234', sha256('waggiboo$PASS_HASH_SALT'))"
# run the proxy:
pnpm install
pnpm build
pnpm start
# get a session token:
export LETSPEPPOL_TOKEN=`curl -X POST -H 'Content-Type: application/json' -d'{"peppolId":"9915:1234","password":"waggiboo"}' http://localhost:3000/token | json token`
# register your peppolId on the real Peppol test infrastructure:
curl -X POST -H "Authorization: Bearer $LETSPEPPOL_TOKEN" -H 'Content-Type: application/json' http://localhost:3000/reg
# send an invoice on the real Peppol test infrastructure:
curl -X POST --data-binary "@../docs/example.xml" -H "Authorization: Bearer $LETSPEPPOL_TOKEN" http://localhost:3000/send
```

## Deployment
There is a Heroku instance running at api.letspeppol.org.
You can also deploy staging instances elsewhere.
It doesn't have `ACUBE_USR` or `ACUBE_PWD` in its env vars, but it has `ACUBE_TOKEN`. When this expires, you should run `auth.sh` in development to regenerate it (or for the Ponder Source sponsored instance, ask @michielbdejong to do this) and then edit the `ACUBE_TOKEN` env var in staging.

It also has the `DATABASE_URL` env var inserted because of the postgres db that is linked to it. Copy it from Heroku -> Settings -> 'Reveal Config Vars' and set it as an env var locally. And you need to set `PASS_HASH_SALT` for the AS part. So the essential environment variables on Heroku or any other hosting environment will be:
* `PORT`
* `ACUBE_TOKEN`
* `DATABASE_URL`
* `PASS_HASH_SALT`

If you host it on a platform other than Heroku you might need to add your own TLS-offloading proxy, and then the `pnpm install; pnpm build; pnpm start` commands will be similar to how it works in development.

If you have the `DATABASE_URL` env var for the staging instance, you can run the `create table` commands from the development instructions and create and populate the necessary the database tables.

### Pushing changes
* Select 'deploy using Heroku git' in the Heroku setting.
* Do the Heroku git checkout so that a 'letspeppol' folder is added next to the proxy folder in your checkout of this repo.
* In the `proxy` folder run `./deploy.sh` to push changes to Heroku

## Usage in Staging
For now you can use '9915:1234' as your peppol ID (registration will fail because it's already registered) and 'waggiboo' as the password.
Contact @michielbdejong or use the `DATABASE_URL` from Heroku to add other Peppol ID's to the staging instance.

First, get an access token. This will be valid for 24 hours:
```sh
export LP_STAGING=`curl -X POST -H 'Content-Type: application/json' -d'{"peppolId":"9915:1234","password":"waggiboo"}' https://api.letspeppol.org/token | json token`
```

Then run this command from the proxy folder (note the relative file path pointing to [../docs/example.xml](../docs/example.xml)):
```sh
curl -X POST --data-binary "@../docs/example.xml" -H "Authorization: Bearer $LP_STAGING" https://api.letspeppol.org/send
```

Coming soon: additional API endpoints to publish/unpublish the Peppol ID on the testnet, and to list received invoices.
