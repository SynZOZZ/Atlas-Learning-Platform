# 4Z Academy 1.4.0 — Clean Catalog and Content Studio

## What changes automatically

- The retired placeholder courses `course-1` through `course-9` are removed once.
- Their lessons, enrollments, payments, notifications, messages, upload records, and uploaded folders are removed with them.
- The old demo instructor accounts and the exact `student@example.com` / `Demo Student` account are removed.
- The administrator account and every non-demo user remain unchanged.

This migration runs when `start-windows.bat` rebuilds and starts the updated Docker services. Do not delete the PostgreSQL volume.

## New workflow

1. Create a course under **Courses**. It is saved as a hidden draft.
2. Open **Video & live**.
3. Select **Recorded video**, **Live session**, or **Protected file**.
4. Upload or add a secure HTTPS link, preview it, and add it to the course.
5. Return to **Courses** and publish only when the page and material are ready.

## Safer launch defaults

- Instant test-card approval is off by default.
- Manual payment requests require a reference and administrator approval.
- Live lessons require an HTTPS meeting link and schedule.
- Course messages are limited to active paid enrollments.
- Internal database errors are logged without being shown to users.
