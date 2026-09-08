# Changelog

## 1.4.0

- Retired the nine placeholder courses and removed their lessons, enrollments, payments, messages, notifications, uploads, and demo accounts with a one-time safe migration.
- Kept the administrator and all non-demo user data intact.
- Added a dedicated **Video & live** studio with upload progress, format guidance, previews, secure meeting-link validation, and course-outline controls.
- New courses now start as hidden drafts and must be published deliberately.
- Added useful empty states for the public catalog, student discovery, messages, and course management.
- Disabled instant test-card access by default and tightened course-message permissions and server error privacy.

## 1.1.0

- Added visible upload progress and protected video, PDF, and image metadata.
- Added in-platform lesson selection and protected media/document viewing.
- Added HTTP byte-range video delivery for smoother seeking in uploaded videos.
- Added lesson duration, reordering, and deletion controls.
- Added unread notification counts, course labels, and individual read actions.
- Rebuilt messages around course threads and enrolled-student recipient selection.
- Added demo student/instructor messages, reply notifications, and a sample visual lesson.
- Preserved the v1.0.1 Docker `bcryptjs` migration fix and v1.0.2 course query fix.

## 1.0.0

- Independent Next.js and PostgreSQL package.
- Role-based accounts and student approval.
- Course, lesson, payment, notification, message, device, and protected-file workflows.
- Docker development and production deployment.
- Bilingual responsive interface, PWA manifest, legal placeholders, and handover documentation.
