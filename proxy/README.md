# LetsPeppol Proxy
This is what runs on api.letspeppol.org.

## Development
Make sure you have a postgres database somewhere and that you have the [`json` CLI tool](https://github.com/trentm/json?tab=readme-ov-file#installation) installed.
Create a `proxy/.env` file that looks like this:
```
ACUBE_USR="your-acube-username"
ACUBE_PWD="your-acube-passwords"
PASS_HASH_SALT=some-secret-string
POSTGRES_APP_USER=letspeppol
POSTGRES_APP_PASSWORD=something-secret
POSTGRES_APP_DB=letspeppol
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
```sh
curl -X POST --data-binary "@./docs/example.xml" -H "Authorization: Bearer $LETSPEPPOL_TOKEN" https://api.letspeppol.org/send
```