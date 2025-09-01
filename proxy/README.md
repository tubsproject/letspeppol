# LetsPeppol Proxy
This is what runs on api.letspeppol.org.

## Development
Create a `proxy/.env` file that looks like this:
```
ACUBE_USR="your-acube-username"
ACUBE_PWD="your-acube-passwords"
```

Then run:
```sh
cd proxy
export ACUBE_TOKEN=`./auth.sh`
export USERS="{\"glamicks\":\"9915:123456\"}"
pnpm install
pnpm build
pnpm start
curl -X POST -H 'Authorization: Bearer glamicks' -H 'Content-Type: application/json' http://localhost:3000/reg
curl -X POST --data-binary "@../docs/example.xml" -H 'Authorization: Bearer glamicks' http://localhost:3000/send
```

## Staging
```sh
curl -X POST --data-binary "@./docs/example.xml" -H 'Authorization: Bearer glamicks' https://api.letspeppol.org/send
```