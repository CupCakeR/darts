#!/bin/sh
set -e

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$(dirname "$DATABASE_PATH")"
  chown -R "$PUID:$PGID" "$(dirname "$DATABASE_PATH")"
  exec setpriv --reuid="$PUID" --regid="$PGID" --clear-groups "$@"
fi

exec "$@"
