#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-1313}
SOURCE="$(dirname "$0")/.."

if [ -n "${CODESPACES:-}" ]; then
    BASEURL="https://${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/"
    exec hugo server --source "$SOURCE" --port "$PORT" --baseURL "$BASEURL" --appendPort=false "$@"
else
    exec hugo server --source "$SOURCE" --port "$PORT" "$@"
fi
