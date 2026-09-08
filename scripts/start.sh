#!/usr/bin/env sh
set -eu
[ -f .env ] || cp .env.example .env
docker compose up -d --build
echo "4Z Academy is starting at http://localhost:3000"
