#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

template_version=$(grep -oE 'mapsindoors/js/sdk/[0-9]+\.[0-9]+\.[0-9]+/mapsindoors-' src/components/MapTemplate/MapTemplate.jsx | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)
root_version=$(grep -oE 'mapsindoors/js/sdk/[0-9]+\.[0-9]+\.[0-9]+/mapsindoors-' index.html | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)
dev_shell_version=$(grep -oE 'mapsindoors/js/sdk/dev/[0-9]+\.[0-9]+\.[0-9]+/mapsindoors-' dev-shell/index.html | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)

if [ -z "$template_version" ] || [ -z "$root_version" ] || [ -z "$dev_shell_version" ]; then
    echo "Could not extract SDK version (MapTemplate.jsx: '$template_version', index.html: '$root_version', dev-shell/index.html: '$dev_shell_version')"
    exit 1
fi

if [ "$template_version" != "$root_version" ]; then
    echo "SDK version mismatch: MapTemplate.jsx pins $template_version, index.html pins $root_version"
    exit 1
fi

if [ "$template_version" != "$dev_shell_version" ]; then
    echo "SDK version mismatch: MapTemplate.jsx pins $template_version, dev-shell/index.html pins $dev_shell_version"
    exit 1
fi

dev_sdk_url="https://app.mapsindoors.com/mapsindoors/js/sdk/dev/$dev_shell_version"
dev_shell_integrity=$(grep -oE 'integrity="sha384-[A-Za-z0-9+/=]+"' dev-shell/index.html | grep -oE 'sha384-[A-Za-z0-9+/=]+' | head -n 1)
if ! published_sri_file=$(curl -fsS --retry 3 --retry-all-errors "$dev_sdk_url/sri-hash.txt"); then
    echo "No dev SDK published for $dev_shell_version at $dev_sdk_url"
    exit 1
fi
published_integrity=$(echo "$published_sri_file" | tr -d '[:space:]')

if [ "$dev_shell_integrity" != "$published_integrity" ]; then
    echo "Dev SDK integrity mismatch: dev-shell/index.html has '$dev_shell_integrity', $dev_sdk_url/sri-hash.txt has '$published_integrity'"
    exit 1
fi

if ! curl -fsSI --retry 3 --retry-all-errors -o /dev/null "$dev_sdk_url/mapsindoors-$dev_shell_version.js.gz"; then
    echo "Dev SDK bundle missing at $dev_sdk_url/mapsindoors-$dev_shell_version.js.gz"
    exit 1
fi

prod_sdk_url="https://app.mapsindoors.com/mapsindoors/js/sdk/$template_version"
template_integrity=$(grep -oE "'integrity', 'sha384-[A-Za-z0-9+/=]+'" src/components/MapTemplate/MapTemplate.jsx | grep -oE 'sha384-[A-Za-z0-9+/=]+' | head -n 1)
root_integrity=$(grep -oE 'integrity="sha384-[A-Za-z0-9+/=]+"' index.html | grep -oE 'sha384-[A-Za-z0-9+/=]+' | head -n 1)
if ! published_prod_sri_file=$(curl -fsS --retry 3 --retry-all-errors "$prod_sdk_url/sri-hash.txt"); then
    echo "No SDK published for $template_version at $prod_sdk_url"
    exit 1
fi
published_prod_integrity=$(echo "$published_prod_sri_file" | tr -d '[:space:]')

if [ "$template_integrity" != "$published_prod_integrity" ] || [ "$root_integrity" != "$published_prod_integrity" ]; then
    echo "SDK integrity mismatch: MapTemplate.jsx has '$template_integrity', index.html has '$root_integrity', $prod_sdk_url/sri-hash.txt has '$published_prod_integrity'"
    exit 1
fi

echo "SDK version match: $template_version"
echo "SDK integrity match: $published_prod_integrity"
echo "Dev SDK integrity match: $dev_shell_integrity"
