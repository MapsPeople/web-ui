#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

template_version=$(grep -oE 'mapsindoors/js/sdk/[0-9]+\.[0-9]+\.[0-9]+/mapsindoors-' src/components/MapTemplate/MapTemplate.jsx | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)
dev_shell_version=$(grep -oE 'mapsindoors/js/sdk/dev/[0-9]+\.[0-9]+\.[0-9]+/mapsindoors-' dev-shell/index.html | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)

if [ -z "$template_version" ] || [ -z "$dev_shell_version" ]; then
    echo "Could not extract SDK version (MapTemplate.jsx: '$template_version', dev-shell/index.html: '$dev_shell_version')"
    exit 1
fi

if [ "$template_version" != "$dev_shell_version" ]; then
    echo "SDK version mismatch: MapTemplate.jsx pins $template_version, dev-shell/index.html pins $dev_shell_version"
    exit 1
fi

echo "SDK version match: $template_version"
