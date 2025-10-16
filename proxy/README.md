# LetsPeppol Proxy
This is what runs on api.letspeppol.org.

## Usage (V1)
First, set which proxy host you want to use. By default, use:
```sh
export PROXY_HOST=https://api.letspeppol.org FIXME: this is not yet running v1, but will as soon as we merge and deploy this branch
```

### Get an access token
Next, get an access token (this requires the local `ACCESS_TOKEN_KEY` env var to be the same as the proxy instance you will be talking to):
```sh
export ACCESS_TOKEN_KEY=...
export ONE=`node token.js 0208:0798640887`
export TWO=`node token.js 0208:0734825676`
export THREE=`node token.js 0208:0636984350`

echo $ACCESS_TOKEN_KEY
echo $ONE
echo $TWO
echo $THREE
```

Users `PEPPYRUS` and `ACUBE` will be handled by the Peppyrus and A-Cube backends respectively, the others by the Scrada backend.

### Check connectivity
```sh
curl $PROXY_HOST/v1
```

### Send a UBL document
Not all sender/receiver combinations work yet, but the following ones do.
Run this command from the proxy folder (note the relative file path pointing to [../docs/](../docs/)):
```sh
curl -X POST --data-binary "@../docs/v1/invoice-scrada-to-scrada.xml" -H "Authorization: Bearer $TWO" $PROXY_HOST/v1/send
curl -X POST --data-binary "@../docs/v1/invoice-peppyrus-to-scrada.xml" -H "Authorization: Bearer $ONE" $PROXY_HOST/v1/send
curl -X POST --data-binary "@../docs/v1/invoice-acube-to-peppyrus.xml" -H "Authorization: Bearer $THREE" $PROXY_HOST/v1/send
curl -X POST --data-binary "@../docs/v1/invoice-peppyrus-to-acube.xml" -H "Authorization: Bearer $ONE" $PROXY_HOST/v1/send
```

### Activate and de-activate SMP records
FIXME: currently only implemented for A-Cube backend
FIXME: currently exposes the 409 saying legal entity already created
```sh
curl -X POST -H "Authorization: Bearer $ONE" -H 'Content-Type: application/json' $PROXY_HOST/v1/reg
curl -X POST -H "Authorization: Bearer $ONE" -H 'Content-Type: application/json' $PROXY_HOST/v1/unreg
```

### Read invoices
To list invoices and credit notes you have sent and received. There are 4 collections, each filtered for the authenticated legal entity:
* /v1/invoices/outgoing
* /v1/invoices/incoming
* /v1/credit-notes/outgoing
* /v1/credit-notes/incoming

Default page size is 20.
```sh
curl -H "Authorization: Bearer $TWO" "$PROXY_HOST/v1/invoices/outgoing" | json
curl -H "Authorization: Bearer $THREE" "$PROXY_HOST/v1/credit-notes/incoming?page=2&pageSize=2" | json
curl -H "Authorization: Bearer $ONE" "$PROXY_HOST/v1/invoices/incoming?page=1" | json
```

This will give an array of uuid string. To fetch the XML of a specific one:
```sh
curl -H "Authorization: Bearer $ONE" $PROXY_HOST/v1/invoices/incoming/c40e41fc-c040-4ddc-b35b-4f2a23542e7a
curl -H "Authorization: Bearer $THREE" $PROXY_HOST/v1/credit-notes/outgoing/2980217c-a95c-49b9-a5d5-d3b176fd9f67
```
FIXME: invoices from Peppyrus are indented but ones from A-Cube are without linebreaks

## Usage (legacy)
First, set which proxy host you want to use. By default, use:
```sh
export PROXY_HOST=https://api.letspeppol.org
```

### Get an access token
For now you can use for instance `0208:1023290711` or `0208:0705969661` as your peppol ID 

First, get an access token (this requires the local `ACCESS_TOKEN_KEY` env var to be the same as the proxy instance you will be talking to):
```sh
export ACCESS_TOKEN_KEY=...
export SENDER=`node token.js 0208:1023290711`
export RECIPIENT=`node token.js 0208:0705969661`
echo $SENDER
echo $RECIPIENT
```

### Check connectivity
```sh
curl $PROXY_HOST
```

### Send a UBL document
Run this command from the proxy folder (note the relative file path pointing to [../docs/](../docs/)):
```sh
curl -X POST --data-binary "@../docs/invoice.xml" -H "Authorization: Bearer $SENDER" $PROXY_HOST/send
curl -X POST --data-binary "@../docs/credit-note.xml" -H "Authorization: Bearer $SENDER" $PROXY_HOST/send
```

### Activate and de-activate SMP records
FIXME: this currently errors for A-Cube.
```sh
curl -X POST -H "Authorization: Bearer $SENDER" -H 'Content-Type: application/json' $PROXY_HOST/reg
curl -X POST -H "Authorization: Bearer $SENDER" -H 'Content-Type: application/json' $PROXY_HOST/unreg
```

### Read invoices
To list invoices and credit notes you have sent and received. This currently proxies [A-Cube invoices list]() and [A-Cube credit notes list](https://docs.acubeapi.com/documentation/peppol/peppol/tag/CreditNote/#tag/CreditNote/operation/api_credit-notes_get_collection) and filters it to documents where the currently authenticated entity is either the sender (for outgoing) or the recipient (for incoming). Other than this filtering, all query parameters from A-Cube are exposed.

```sh
curl -H "Authorization: Bearer $RECIPIENT" "$PROXY_HOST/invoices/outgoing?page=1" | json
curl -H "Authorization: Bearer $RECIPIENT" "$PROXY_HOST/credit-notes/incoming" | json
```
This will give an array of uuid string. To fetch the XML of a specific one:
```sh
curl -H "Authorization: Bearer $RECIPIENT" $PROXY_HOST/invoices/incoming/9ad589b3-e533-4767-b62a-ea33219d3a57
curl -H "Authorization: Bearer $SENDER" $PROXY_HOST/credit-notes/outgoing/2980217c-a95c-49b9-a5d5-d3b176fd9f67
```

FIXME: you would probably want to retrieve metadata about the sending/receiving status as well as (especially in the incoming case)
the actual XML doc contents. So far the list just gives UUIDs and the individual fetch calls only give the XML, so there's now way
to check the delivery status of a document. Also, a client might want to store some custom data such as "downloaded" or "paid" per
invoice, not sure whether we should offer storing that for them.

## On the host system of your laptop
Ask @michielbdejong if you need to run this code in development, because the current instructions require A-Cube API credentials.
You could also contact A-Cube directly if you want to use this code in an instance independent from the one sponsored by Ponder Source.

Apart from an A-Cube account you will need a postgres database somewhere and that you have the [`json` CLI tool](https://github.com/trentm/json?tab=readme-ov-file#installation) installed.
Create a `proxy/.env` file that looks like this:
```sh
PORT=3000
ACUBE_USR="your-acube-username"
ACUBE_PWD="your-acube-passwords"
ACCESS_TOKEN_KEY="some-other-secret"
PEPPYRUS_TOKEN_TEST="see https://customer.test.peppyrus.be/customer/organization/api to create"
```

Then run:
```sh
cd proxy
# load the variables from your .env file:
export $(xargs < .env)
# get a fresh token for the A-Cube API, needed by the proxy server process:
export ACUBE_TOKEN=`./auth.sh | json token`
# run the proxy:
pnpm install

./node_modules/.bin/overlayjs --openapi ./openapi/oad/acube-peppol.yaml --overlay ./openapi/overlay/acube-peppol-overlay.yaml > ./openapi/generated/acube.yaml
./node_modules/.bin/overlayjs --openapi ./openapi/oad/peppyrus-peppol.yaml --overlay ./openapi/overlay/peppyrus-peppol-overlay.yaml > ./openapi/generated/peppyrus.yaml
./node_modules/.bin/overlayjs --openapi ./openapi/oad/ion-peppol.yaml --overlay ./openapi/overlay/ion-peppol-overlay.yaml > ./openapi/generated/ion.yaml
./node_modules/.bin/overlayjs --openapi ./openapi/oad/arratech-peppol.json --overlay ./openapi/overlay/arratech-peppol-overlay.yaml > ./openapi/generated/arratech.yaml
./node_modules/.bin/overlayjs --openapi ./openapi/oad/maventa-peppol.yaml --overlay ./openapi/overlay/maventa-peppol-overlay.yaml > ./openapi/generated/maventa.yaml
./node_modules/.bin/overlayjs --openapi ./openapi/oad/recommand-peppol.yaml --overlay ./openapi/overlay/recommand-peppol-overlay.yaml > ./openapi/generated/recommand.yaml
./node_modules/.bin/overlayjs --openapi ./openapi/oad/scrada-peppol.json --overlay ./openapi/overlay/scrada-peppol-overlay.yaml > ./openapi/generated/scrada.yaml
npx openapi-typescript ./openapi/oad/front.yaml -o ./src/front.d.ts
npx openapi-typescript ./openapi/generated/acube.yaml -o ./src/acube.d.ts
npx openapi-typescript ./openapi/generated/peppyrus.yaml -o ./src/peppyrus.d.ts
npx openapi-typescript ./openapi/generated/ion.yaml -o ./src/ion.d.ts
# FIXME  npx openapi-typescript ./openapi/generated/arratech.yaml -o ./src/arratech.d.ts
npx openapi-typescript ./openapi/generated/maventa.yaml -o ./src/maventa.d.ts
npx openapi-typescript ./openapi/generated/recommand.yaml -o ./src/recommand.d.ts
npx openapi-typescript ./openapi/generated/scrada.yaml -o ./src/scrada.d.ts

pnpm build
docker compose up -d
export ACUBE_PEPPOL_AUTH_HEADERS="{\"Authorization\":\"Bearer ${ACUBE_TOKEN}\"}"
export PEPPYRUS_PEPPOL_AUTH_HEADERS="{\"X-Api-Key\":\"$PEPPYRUS_TOKEN_TEST\"}"
export ION_PEPPOL_AUTH_HEADERS="{\"Authorization\":\"Token $ION_API_KEY\"}"
export ARRATECH_PEPPOL_AUTH_HEADERS="{\"Authorization\":\"Bearer $_BEARER_TOKEN\"}"
export MAVENTA_PEPPOL_AUTH_HEADERS="{\"Authorization\":\"Basic `echo $RECOMMAND_API_KEY:$RECOMMAND_API_SECRET | base64`\"}"
export RECOMMAND_PEPPOL_AUTH_HEADERS="{\"Authorization\":\"Bearer $RECOMMAND_API_KEY\"}"
pnpm build
pnpm start
export PROXY_HOST=http://localhost:3000
```

## With Docker
The Docker image takes two environment variables, `ACUBE_TOKEN` and `PORT`.
```sh
docker build -t proxy .
export ACUBE_TOKEN=`./auth.sh | json token`
docker run -d -e ACUBE_TOKEN=$ACUBE_TOKEN -e BACKEND=acube -e PORT=3000 -p 3000:3000 proxy
export PROXY_HOST=http://localhost:3000
```

## With Nix
A `devenv` environment is available in the `dev/proxy` directory to host the proxy locally and run a small test. Make sure you have [`devenv`](https://devenv.sh/getting-started/) installed, and optionally install [`direnv`](https://devenv.sh/automatic-shell-activation/) for automatic shell activation. If you don’t use `direnv`, you’ll need to run `devenv shell` manually in the `dev/proxy` directory. Next, create a `dev/.env` file with the following contents (without quotes):
```sh
PORT=3000
ACUBE_USR=your-acube-username
ACUBE_PWD=your-acube-passwords
ACCESS_TOKEN_KEY=some-other-secret
PEPPYRUS_TOKEN_TEST=see https://customer.test.peppyrus.be/customer/organization/api to create
BACKEND=acube-or-peppyrus
```
Then run:
```sh
cd dev
# if the environment is blocked then run `direnv allow` to approve its content
# if you don't use direnv then run `devenv shell`
start-proxy
```

Open a new shell to test the proxy and run:
```sh
cd dev
test-proxy
```

## At a Platform-as-a-Service provider like Heroku
There is a Heroku instance running at api.letspeppol.org.
You can also deploy staging instances elsewhere.
It doesn't have `ACUBE_USR` or `ACUBE_PWD` in its env vars, but it has `ACUBE_TOKEN`. When this expires, you should run `auth.sh` in development to regenerate it (or for the Ponder Source sponsored instance, ask @michielbdejong to do this) and then edit the `ACUBE_TOKEN` env var in staging.

So the essential environment variables on Heroku or any other hosting environment will be (same as for the Docker image):
* `PORT`
* `ACUBE_TOKEN`

If you host it on a platform other than Heroku you might need to add your own TLS-offloading proxy, and then the `pnpm install; pnpm build; pnpm start` commands will be similar to how it works in development.

### Pushing changes to Heroku
* Select 'deploy using Heroku git' in the Heroku setting.
* Do the Heroku git checkout so that a 'letspeppol' folder is added next to the proxy folder in your checkout of this repo.
* In the `proxy` folder run `./deploy.sh` to push changes to Heroku
