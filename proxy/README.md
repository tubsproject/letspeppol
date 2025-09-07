# LetsPeppol Proxy
This is what runs on api.letspeppol.org.

## Usage
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
Run this command from the proxy folder (note the relative file path pointing to [../docs/invoice.xml](../docs/invoice.xml)):
```sh
curl -X POST --data-binary "@../docs/invoice.xml" -H "Authorization: Bearer $SENDER" $PROXY_HOST/send
curl -X POST --data-binary "@../docs/credit-note.xml" -H "Authorization: Bearer $SENDER" $PROXY_HOST/send
```

### Activate and de-activate SMP records
```sh
curl -X POST -H "Authorization: Bearer $SENDER" -H 'Content-Type: application/json' $PROXY_HOST/reg
curl -X POST -H "Authorization: Bearer $SENDER" -H 'Content-Type: application/json' $PROXY_HOST/unreg
```

### Read invoices
To list invoices you have received (coming soon: paging, filtering and sorting):
```sh
curl -H "Authorization: Bearer $RECIPIENT" $PROXY_HOST/incoming | json
```
This will give an array of uuid string. To fetch the XML of a specific one:
```sh
curl -H "Authorization: Bearer $RECIPIENT" $PROXY_HOST/incoming/9ad589b3-e533-4767-b62a-ea33219d3a57
```

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
pnpm build
pnpm start
export PROXY_HOST=http://localhost:3000
```

## With Docker
The Docker image takes two environment variables, `ACUBE_TOKEN` and `PORT`.
```sh
docker build -t proxy .
export ACUBE_TOKEN=`./auth.sh | json token`
docker run -d -e ACUBE_TOKEN=$ACUBE_TOKEN -e PORT=3000 -p 3000:3000 proxy
export PROXY_HOST=http://localhost:3000
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
