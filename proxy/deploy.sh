#!/bin/bash
pnpm build
cp package.json ../letspeppol/
cp tsconfig.json ../letspeppol/
cp -r src ../letspeppol/
cp -r build ../letspeppol/
cd ../letspeppol
git add .
git commit -am"Build `date`"
git push
cd ../proxy
