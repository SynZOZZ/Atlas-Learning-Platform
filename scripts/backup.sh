#!/usr/bin/env sh
set -eu
mkdir -p backups
stamp="$(date +%Y%m%d-%H%M%S)"
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "backups/atlas-db-${stamp}.sql"
docker compose exec -T app tar -czf - -C /app/data uploads > "backups/atlas-uploads-${stamp}.tar.gz"
echo "Backup complete: ${stamp}"
