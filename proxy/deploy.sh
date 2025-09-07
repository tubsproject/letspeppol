#!/bin/bash
cp package.json ../letspeppol/
cp tsconfig.json ../letspeppol/
cp -r src ../letspeppol/
cd ../letspeppol
git add .
git commit -am"Build `date`"
git push
cd ../proxy
