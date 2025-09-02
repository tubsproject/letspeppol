#!/bin/bash
. .env

curl -X POST \
  https://common-sandbox.api.acubeapi.com/login \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"email": "'"${ACUBE_USR}"'", "password": "'"${ACUBE_PWD}"'"}'