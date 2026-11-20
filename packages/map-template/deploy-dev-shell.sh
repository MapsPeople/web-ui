#!/usr/bin/env bash
set -e

if [ $# -eq 0 ]; then
    echo "Please provide a bucket name like so:"
    echo "'npm run deploy-dev-shell -- BUCKET_NAME'"
    echo ""
    exit 1
fi

gsutil -h "Cache-Control:public, max-age=0, no-store, no-cache" cp dev-shell/index.html gs://$1/index.html
