# 4Z Academy — Commercial Standalone Package

A bilingual English/Arabic learning platform for recorded and live courses. This package is independent of ChatGPT and can be owned and deployed by the client on a Windows computer for testing or on a Linux VPS for public production use.

## Included

- Public bilingual course catalog managed entirely from the administrator workspace.
- Student, instructor, and administrator accounts.
- Student profile review before enrollment.
- Recorded, live, and view-only file lessons.
- Manual Visa, wallet, and cash-transfer review, with an optional local-only test-payment mode.
- Admin payment confirmation and access activation.
- Course-scoped notifications with unread counts and individual read controls.
- Student/instructor message threads with enrolled-student recipient selection.
- One trusted device per student with administrator approval for device changes.
- Protected video, PDF, and image uploads served inline only after authorization.
- In-platform media/document viewing, video seeking, and moving student identity watermarks.
- PWA manifest for install-like browser use.
- PostgreSQL, Docker, automatic schema setup, administrator bootstrap, health endpoint, and backup scripts.

## Quick start on Windows

1. Install Docker Desktop.
2. Extract this folder.
3. Double-click `start-windows.bat`.
4. Open `http://localhost:3000`.

The first start creates the database and administrator account automatically. The course catalog starts empty.

For an update, extract the new ZIP over the existing project, choose **Replace the files in the destination**, then run `start-windows.bat` again. Existing PostgreSQL data and uploaded files stay in Docker volumes.

## Uploading course material

1. Sign in as an administrator or instructor and create a course under **Courses**. New courses stay hidden as drafts.
2. Open **Video & live**, choose the course and select recorded video, live session, or protected file.
3. Upload a video/PDF/image, or add a secure HTTPS meeting link and schedule for a live session.
4. Preview the material, add it to the course, then publish the course when it is ready. Active paid students receive a notification.

The default upload limit is 50 MB and can be changed with `MAX_UPLOAD_MB` in `.env`. Direct uploads play at their original quality. Adaptive 360p–1080p streaming requires a configured video provider for a later production phase.

## Administrator account

Values come from `.env`; defaults in `.env.example` are:

- Admin: `admin@example.com` / `ChangeMe123!`

Student accounts are created through registration. The administrator can promote an approved student to instructor when needed. The retired nine-course demo catalog and its demo accounts are removed automatically once when this version starts; real accounts and administrator data are preserved.

Change every password, `AUTH_SECRET`, `POSTGRES_PASSWORD`, and the matching
password inside `DATABASE_URL_DOCKER` before a real launch.

## Developer start without Docker

Requirements: Node.js 22+, npm, and PostgreSQL.

```bash
cp .env.example .env
npm ci
npm run db:setup
npm run dev
```

## Production

Use a Linux VPS with Docker. Point the domain DNS to the VPS, set `DOMAIN` and all real values in `.env`, then run:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Caddy obtains and renews HTTPS automatically after DNS points to the server and ports 80/443 are open.

## Real integrations left as configuration

The product runs in manual-review mode without third-party credentials. Set `PAYMENT_PROVIDER=demo` only for local testing if the instant test-card option is needed. Before commercial use, configure:

- WhatsApp, domain, and real course information.
- A payment gateway and webhook contract selected for the client's country.
- A streaming provider for adaptive video and expiring playback URLs.
- SMTP account values for the included password-reset email integration.
- Final privacy, terms, and refund wording reviewed for the client's jurisdiction.

See `DEPLOYMENT_AR.md`, `CUSTOMIZATION_AR.md`, and `CLIENT_HANDOVER_AR.md`.
