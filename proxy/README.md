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
psql -h localhost -U michiel tubs -c "create table passwords (peppolId varchar, passHash varchar)"
psql -h localhost -U michiel tubs -c "create table sessions (peppolId varchar, token varchar, expires timestamp)"
psql -h localhost -U michiel tubs -c "insert into passwords (peppolId, passHash) values ('9915:1234', sha256('waggiboo$PASS_HASH_SALT'))"
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

## Staging
There is a Heroku instance deployed from the `express-based-typescript-proxy-with-tests` branch running at api.letspeppol.org.
You can also deploy staging instances elsewhere.
It doesn't have `ACUBE_USR` or `ACUBE_PWD` in its env vars, but it has `ACUBE_TOKEN`. When this expires, you should run `auth.sh` in development to regenerate it (or for the Ponder Source sponsored instance, ask @michielbdejong to do this).

It also has the `DATABASE_URL` env var inserted because of the postgres db that is linked to it. Copy it from Heroku -> Settings -> 'Reveal Config Vars' and set it as an env var locally.

```sh
curl -X POST --data-binary "@./docs/example.xml" -H "Authorization: Bearer $LETSPEPPOL_TOKEN" https://api.letspeppol.org/send
```