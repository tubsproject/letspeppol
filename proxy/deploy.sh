#!/bin/bash
pnpm build
cp -r build ../letspeppol/
cd ../letspeppol
git add build
git commit -am"Build `date`"
git push
cd ../proxy
