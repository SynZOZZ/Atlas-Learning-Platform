# 4Z Academy 1.2.0 — Frontend Brand Update

This update applies the official 4Z Academy logo and palette throughout the public website, authentication screens, course pages, dashboards, and protected lesson viewer.

Official colors:

- Navy: `#243565`
- Turquoise: `#67C1B9`

## Update an existing Windows installation

1. Extract the ZIP into the same parent folder as the existing project.
2. Choose **Replace the files in the destination**.
3. Double-click `start-windows.bat`, or run `docker compose up -d --build` in PowerShell.
4. Open `http://localhost:3000` and press `Ctrl+F5` once to refresh cached styles.

Do not run `docker compose down -v`. The update does not require emptying PostgreSQL or upload volumes, so existing accounts, courses, messages, and uploaded files remain available.

Existing `.env` files that still contain the old Atlas display-name defaults are handled automatically. You may still update those two lines manually to keep the configuration tidy:

```env
NEXT_PUBLIC_SITE_NAME="4Z Academy"
NEXT_PUBLIC_SITE_SHORT_NAME="4Z"
```
