#!/usr/bin/env bash
if [ $# -eq 0 ]; then
    echo "Please provide a bucket name like so:"
    echo "'npm run deploy-to-gcloud -- BUCKET_NAME'"
    echo ""
    exit 1
fi

npx lerna run build
vite build --base=/$1
cd build
gsutil -m -h "Cache-Control:public, max-age=0, no-store, no-cache" cp -r . gs://$1
