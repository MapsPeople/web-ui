#!/usr/bin/env bash
set -e

if [ $# -eq 0 ]; then
    echo "Please provide a bucket name like so:"
    echo "'npm run deploy-dev-shell -- BUCKET_NAME [COMMIT_SHA]'"
    echo ""
    exit 1
fi

bucket=$1
commit_sha=${2:-HEAD}
version=$(node -p "require('./package.json').version")

attempt=0
until npm view "@mapsindoors/map-template@${version}" version > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 30 ]; then
        echo "@mapsindoors/map-template@${version} is still not on npm after 5 minutes"
        exit 1
    fi
    sleep 10
done

shell_file=$(mktemp)
trap 'rm -f "$shell_file"' EXIT

git show "${commit_sha}:./dev-shell/index.html" \
    | sed "s#@mapsindoors/map-template@stable/#@mapsindoors/map-template@${version}/#" > "$shell_file"
grep -q "@mapsindoors/map-template@${version}/" "$shell_file"

gsutil -h "Cache-Control:public, max-age=0, no-store, no-cache" -h "Content-Type:text/html" cp "$shell_file" "gs://${bucket}/index.html"
