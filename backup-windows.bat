@echo off
setlocal
if not exist backups mkdir backups
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "stamp=%%I"
docker compose exec -T db sh -c "pg_dump -U $POSTGRES_USER -d $POSTGRES_DB" > "backups\atlas-db-%stamp%.sql"
if errorlevel 1 exit /b 1
docker compose exec -T app tar -czf - -C /app/data uploads > "backups\atlas-uploads-%stamp%.tar.gz"
if errorlevel 1 exit /b 1
echo Database and protected uploads backup created in backups.
