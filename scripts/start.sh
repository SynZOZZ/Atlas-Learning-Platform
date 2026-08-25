#!/usr/bin/env sh
set -eu
[ -f .env ] || cp .env.example .env
docker compose up -d --build
echo "Atlas Learning is starting at http://localhost:3000"
