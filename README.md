# LetsPeppol

This repo contains:
* a `docs` folder with the website that runs on GitHub Pages at https://letspeppol.org
* a `proxy` folder with the API proxy that runs on Heroku at https://api.letspeppol.org
* a `kyc` folder that will contain the Know-Your-Customer component (initially only for Belgian VAT numbers)
* an `app` folder that will contain our web interface

## Development
Create a `proxy/.env` file that looks like this:
```
ACUBE_USR="your-acube-username"
ACUBE_PWD="your-acube-passwords"
USERS="{\"glamicks\":\"john\"}"
```

Then run:
```sh
cd proxy
export ACUBE_TOKEN=`./auth.sh`
npm start
curl -X POST -H 'Authorization: Bearer glamicks' -d "9915:12345" http://localhost:3000/reg
curl -X POST --data-binary "@./docs/example.xml" -H 'Authorization: Bearer glamicks' http://localhost:3000/send
```

## Staging
```sh
curl -X POST --data-binary "@./docs/example.xml" -H 'Authorization: Bearer glamicks' https://api.letspeppol.org/send
```