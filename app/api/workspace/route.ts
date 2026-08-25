import { requireUser } from "../../../lib/auth";
import { one, pool, rows, withTransaction } from "../../../lib/db";
import { paymentDecision, type PaymentMethod } from "../../../lib/payments";
import { apiError, clean } from "../../../lib/validation";

export const dynamic = "force-dynamic";

const courseFields = `SELECT c.id,c.slug,c.title_en AS "titleEn",c.title_ar AS "titleAr",c.category_en AS "categoryEn",c.category_ar AS "categoryAr",
c.summary_en AS "summaryEn",c.summary_ar AS "summaryAr",c.instructor_name AS "instructorName",c.instructor_email AS "instructorEmail",
c.whatsapp,c.price::float8 AS price,c.mode,c.image_url AS "imageUrl",c.level,c.duration,c.published`;

export async function GET() {
  try {
    const access = await requireUser();
    if ("error" in access) return Response.json({ error: access.error }, { status: access.status });
    const user = access.user;
    const courses = user.role === "admin"
      ? await rows(`${courseFields} FROM courses c ORDER BY c.id`)
      : user.role === "instructor"
        ? await rows(`${courseFields} FROM courses c WHERE c.instructor_email=$1 ORDER BY c.id`, [user.email])
        : await rows(`${courseFields},e.payment_status AS "paymentStatus",e.status AS "enrollmentStatus",e.progress FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id AND e.user_email=$1 WHERE c.published=TRUE ORDER BY c.id`, [user.email]);
    const lessons = user.role === "student"
      ? await rows("SELECT l.id,l.course_id,l.title,l.kind,l.asset_url,l.duration,l.sort_order,l.published,l.created_at FROM lessons l JOIN enrollments e ON e.course_id=l.course_id WHERE e.user_email=$1 AND e.payment_status='paid' AND e.status='active' AND l.published=TRUE ORDER BY l.course_id,l.sort_order,l.id", [user.email])
      : await rows("SELECT l.* FROM lessons l JOIN courses c ON c.id=l.course_id WHERE $1='admin' OR c.instructor_email=$2 ORDER BY l.course_id,l.sort_order,l.id", [user.role, user.email]);
    const enrollments = await rows(`SELECT e.*,c.title_en AS "courseTitle",u.name AS "studentName" FROM enrollments e JOIN courses c ON c.id=e.course_id LEFT JOIN users u ON u.email=e.user_email WHERE $1='admin' OR e.user_email=$2 OR c.instructor_email=$3 ORDER BY e.id DESC`, [user.role, user.email, user.email]);
    const notifications = await rows(`SELECT n.*,c.title_en AS "courseTitle" FROM notifications n LEFT JOIN courses c ON c.id=n.course_id WHERE n.user_email=$1 ORDER BY n.id DESC LIMIT 50`, [user.email]);
    const messages = await rows(`SELECT m.*,c.title_en AS "courseTitle",s.name AS "senderName",r.name AS "receiverName" FROM messages m JOIN courses c ON c.id=m.course_id LEFT JOIN users s ON s.email=m.sender_email LEFT JOIN users r ON r.email=m.receiver_email WHERE m.sender_email=$1 OR m.receiver_email=$1 ORDER BY m.id ASC LIMIT 100`, [user.email]);
    const mediaAssets = user.role === "student"
      ? await rows(`SELECT a.id,a.course_id,'/api/files/' || a.id AS url,a.original_name AS "originalName",a.mime_type AS "mimeType",a.size_bytes::float8 AS "sizeBytes" FROM file_assets a JOIN enrollments e ON e.course_id=a.course_id WHERE e.user_email=$1 AND e.payment_status='paid' AND e.status='active' ORDER BY a.id DESC`, [user.email])
      : await rows(`SELECT a.id,a.course_id,'/api/files/' || a.id AS url,a.original_name AS "originalName",a.mime_type AS "mimeType",a.size_bytes::float8 AS "sizeBytes" FROM file_assets a JOIN courses c ON c.id=a.course_id WHERE $1='admin' OR c.instructor_email=$2 ORDER BY a.id DESC`, [user.role, user.email]);
    let users: unknown[] = [], payments: unknown[] = [], deviceRequests: unknown[] = [];
    if (["admin", "instructor"].includes(user.role)) {
      users = await rows(`SELECT id,email,name,role,status,phone,whatsapp,country,city,specialty,trusted_device_id AS "trustedDeviceId",created_at AS "createdAt" FROM users ORDER BY id DESC`);
      payments = user.role === "admin"
        ? await rows(`SELECT p.*,p.amount::float8 AS amount,c.title_en AS "courseTitle",u.name AS "studentName" FROM payments p JOIN courses c ON c.id=p.course_id LEFT JOIN users u ON u.email=p.user_email ORDER BY p.id DESC`)
        : await rows(`SELECT p.*,p.amount::float8 AS amount,c.title_en AS "courseTitle",u.name AS "studentName" FROM payments p JOIN courses c ON c.id=p.course_id LEFT JOIN users u ON u.email=p.user_email WHERE c.instructor_email=$1 ORDER BY p.id DESC`, [user.email]);
      if (user.role === "admin") deviceRequests = await rows("SELECT * FROM device_requests WHERE status='pending' ORDER BY id DESC");
    }
    return Response.json({ user, courses, lessons, enrollments, notifications, messages, mediaAssets, users, payments, deviceRequests });
  } catch (error) { return apiError(error, "Workspace GET error"); }
}

export async function POST(request: Request) {
  try {
    const access = await requireUser();
    if ("error" in access) return Response.json({ error: access.error }, { status: access.status });
    const body = await request.json() as Record<string, unknown>;
    const action = clean(body.action, 40);
    const data = body.data && typeof body.data === "object" ? body.data as Record<string, unknown> : {};
    const user = access.user;

    if (action === "profile") {
      const name = clean(data.name, 120), phone = clean(data.phone, 30);
      if (!name || !phone) return Response.json({ error: "Name and phone are required" }, { status: 400 });
      await pool.query(`UPDATE users SET name=$1,phone=$2,whatsapp=$3,country=$4,city=$5,specialty=$6,status=CASE WHEN status IN ('rejected','needs_changes') THEN 'pending' ELSE status END,updated_at=NOW() WHERE email=$7`, [name, phone, clean(data.whatsapp, 30), clean(data.country, 80), clean(data.city, 80), clean(data.specialty, 160), user.email]);
      return Response.json({ ok: true });
    }

    if (action === "reviewUser") {
      if (!["admin", "instructor"].includes(user.role)) return Response.json({ error: "Reviewer access required" }, { status: 403 });
      const email = clean(data.email, 160).toLowerCase(), status = clean(data.status, 30);
      if (!email || !["approved", "rejected", "needs_changes"].includes(status)) return Response.json({ error: "Invalid review" }, { status: 400 });
      await pool.query("UPDATE users SET status=$1,updated_at=NOW() WHERE email=$2 AND role='student'", [status, email]);
      await pool.query("INSERT INTO notifications (user_email,title,message) VALUES ($1,$2,$3)", [email, "Profile review updated", `Your student profile is now ${status.replace("_", " ")}.`]);
      return Response.json({ ok: true });
    }

    if (action === "setRole") {
      if (user.role !== "admin") return Response.json({ error: "Administrator access required" }, { status: 403 });
      const email = clean(data.email, 160).toLowerCase(), role = clean(data.role, 30);
      if (!email || !["student", "instructor"].includes(role)) return Response.json({ error: "Invalid role" }, { status: 400 });
      await pool.query("UPDATE users SET role=$1,status='approved',updated_at=NOW() WHERE email=$2", [role, email]);
      return Response.json({ ok: true });
    }

    if (action === "enroll") {
      if (user.role !== "student" || user.status !== "approved") return Response.json({ error: "Approved student profile required" }, { status: 403 });
      const courseId = Number(data.courseId), method = clean(data.method, 40) as PaymentMethod;
      if (!(["test_card", "visa", "wallet", "cash_transfer"] as string[]).includes(method)) return Response.json({ error: "Invalid payment method" }, { status: 400 });
      const course = await one<{ price: number }>("SELECT price::float8 AS price FROM courses WHERE id=$1 AND published=TRUE", [courseId]);
      if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
      const decision = paymentDecision(method);
      const payment = await one<{ id: number }>(`INSERT INTO payments (user_email,course_id,amount,method,reference,status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [user.email, courseId, course.price, method, clean(data.reference, 120), decision.status]);
      await pool.query(`INSERT INTO enrollments (user_email,course_id,payment_status,status) VALUES ($1,$2,$3,$4) ON CONFLICT (user_email,course_id) DO UPDATE SET payment_status=EXCLUDED.payment_status,status=EXCLUDED.status`, [user.email, courseId, decision.paid ? "paid" : "pending", decision.paid ? "active" : "pending"]);
      await pool.query("INSERT INTO notifications (user_email,course_id,title,message) VALUES ($1,$2,$3,$4)", [user.email, courseId, decision.paid ? "Enrollment confirmed" : "Payment under review", decision.paid ? "Your course is now available in My learning." : "An administrator will review the payment details."]);
      return Response.json({ ok: true, paid: decision.paid, paymentId: payment?.id, checkoutUrl: decision.checkoutUrl });
    }

    if (action === "reviewPayment") {
      if (user.role !== "admin") return Response.json({ error: "Administrator access required" }, { status: 403 });
      const id = Number(data.id), status = clean(data.status, 30);
      if (!Number.isInteger(id) || !["paid", "rejected", "refunded"].includes(status)) return Response.json({ error: "Invalid payment review" }, { status: 400 });
      const payment = await one<{ user_email: string; course_id: number }>("SELECT user_email,course_id FROM payments WHERE id=$1", [id]);
      if (!payment) return Response.json({ error: "Payment not found" }, { status: 404 });
      await withTransaction(async (client) => {
        await client.query("UPDATE payments SET status=$1,updated_at=NOW() WHERE id=$2", [status, id]);
        await client.query("UPDATE enrollments SET payment_status=$1,status=$2 WHERE user_email=$3 AND course_id=$4", [status, status === "paid" ? "active" : "blocked", payment.user_email, payment.course_id]);
        await client.query("INSERT INTO notifications (user_email,course_id,title,message) VALUES ($1,$2,$3,$4)", [payment.user_email, payment.course_id, "Payment status updated", `Your payment is now ${status}.`]);
      });
      return Response.json({ ok: true });
    }

    if (action === "addLesson") {
      if (!["admin", "instructor"].includes(user.role)) return Response.json({ error: "Instructor access required" }, { status: 403 });
      const courseId = Number(data.courseId);
      const course = await one<{ instructor_email: string }>("SELECT instructor_email FROM courses WHERE id=$1", [courseId]);
      if (!course || (user.role === "instructor" && course.instructor_email !== user.email)) return Response.json({ error: "You cannot edit this course" }, { status: 403 });
      const title = clean(data.title, 160), kind = clean(data.kind, 30) || "video";
      if (!title || !["video", "live", "file"].includes(kind)) return Response.json({ error: "Valid lesson title and type are required" }, { status: 400 });
      const order = await one<{ total: number }>("SELECT COUNT(*)::int AS total FROM lessons WHERE course_id=$1", [courseId]);
      await pool.query("INSERT INTO lessons (course_id,title,kind,asset_url,duration,sort_order) VALUES ($1,$2,$3,$4,$5,$6)", [courseId, title, kind, clean(data.assetUrl, 500), clean(data.duration, 80), Number(order?.total || 0) + 1]);
      await pool.query(`INSERT INTO notifications (user_email,course_id,title,message) SELECT user_email,$1,$2,$3 FROM enrollments WHERE course_id=$1 AND payment_status='paid' AND status='active'`, [courseId, "New course material", `${title} is now available.`]);
      return Response.json({ ok: true }, { status: 201 });
    }

    if (action === "deleteLesson" || action === "moveLesson") {
      if (!["admin", "instructor"].includes(user.role)) return Response.json({ error: "Instructor access required" }, { status: 403 });
      const id = Number(data.id);
      const lesson = await one<{ id: number; course_id: number; sort_order: number; instructor_email: string }>(`SELECT l.id,l.course_id,l.sort_order,c.instructor_email FROM lessons l JOIN courses c ON c.id=l.course_id WHERE l.id=$1`, [id]);
      if (!lesson || (user.role === "instructor" && lesson.instructor_email !== user.email)) return Response.json({ error: "Lesson access denied" }, { status: 403 });
      if (action === "deleteLesson") {
        await pool.query("DELETE FROM lessons WHERE id=$1", [id]);
        return Response.json({ ok: true });
      }
      const direction = clean(data.direction, 10);
      const neighbor = direction === "up"
        ? await one<{ id: number; sort_order: number }>("SELECT id,sort_order FROM lessons WHERE course_id=$1 AND sort_order<$2 ORDER BY sort_order DESC,id DESC LIMIT 1", [lesson.course_id, lesson.sort_order])
        : await one<{ id: number; sort_order: number }>("SELECT id,sort_order FROM lessons WHERE course_id=$1 AND sort_order>$2 ORDER BY sort_order ASC,id ASC LIMIT 1", [lesson.course_id, lesson.sort_order]);
      if (neighbor) {
        await withTransaction(async (client) => {
          await client.query("UPDATE lessons SET sort_order=$1 WHERE id=$2", [neighbor.sort_order, lesson.id]);
          await client.query("UPDATE lessons SET sort_order=$1 WHERE id=$2", [lesson.sort_order, neighbor.id]);
        });
      }
      return Response.json({ ok: true });
    }

    if (action === "sendMessage") {
      const courseId = Number(data.courseId), receiverEmail = clean(data.receiverEmail, 160).toLowerCase(), bodyText = clean(data.body, 1500);
      if (!Number.isInteger(courseId) || !receiverEmail || !bodyText) return Response.json({ error: "Course, recipient, and message are required" }, { status: 400 });
      const course = await one<{ instructor_email: string }>("SELECT instructor_email FROM courses WHERE id=$1", [courseId]);
      if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
      if (user.role === "student") {
        const enrollment = await one("SELECT id FROM enrollments WHERE user_email=$1 AND course_id=$2 AND payment_status='paid' AND status='active'", [user.email, courseId]);
        if (!enrollment) return Response.json({ error: "Paid enrollment is required" }, { status: 403 });
        if (receiverEmail !== course.instructor_email) return Response.json({ error: "Students can only message this course's instructor" }, { status: 403 });
      } else {
        if (user.role === "instructor" && course.instructor_email !== user.email) return Response.json({ error: "Course access denied" }, { status: 403 });
        const enrollment = await one("SELECT id FROM enrollments WHERE user_email=$1 AND course_id=$2", [receiverEmail, courseId]);
        if (!enrollment) return Response.json({ error: "Choose a student enrolled in this course" }, { status: 400 });
      }
      const receiver = await one("SELECT id FROM users WHERE email=$1", [receiverEmail]);
      if (!receiver) return Response.json({ error: "Recipient account not found" }, { status: 404 });
      await pool.query("INSERT INTO messages (course_id,lesson_id,sender_email,receiver_email,body) VALUES ($1,$2,$3,$4,$5)", [courseId, Number(data.lessonId) || null, user.email, receiverEmail, bodyText]);
      await pool.query("INSERT INTO notifications (user_email,course_id,title,message) VALUES ($1,$2,$3,$4)", [receiverEmail, courseId, "New course message", `New message from ${user.name}.`]);
      return Response.json({ ok: true }, { status: 201 });
    }

    if (action === "markNotificationsRead") {
      await pool.query("UPDATE notifications SET read=TRUE WHERE user_email=$1", [user.email]);
      return Response.json({ ok: true });
    }

    if (action === "markNotificationRead") {
      await pool.query("UPDATE notifications SET read=TRUE WHERE id=$1 AND user_email=$2", [Number(data.id), user.email]);
      return Response.json({ ok: true });
    }

    if (action === "approveDevice") {
      if (user.role !== "admin") return Response.json({ error: "Administrator access required" }, { status: 403 });
      const id = Number(data.id);
      const row = await one<{ user_email: string; requested_device_id: string }>("SELECT user_email,requested_device_id FROM device_requests WHERE id=$1 AND status='pending'", [id]);
      if (!row) return Response.json({ error: "Device request not found" }, { status: 404 });
      await withTransaction(async (client) => {
        await client.query("UPDATE users SET trusted_device_id=$1,updated_at=NOW() WHERE email=$2", [row.requested_device_id, row.user_email]);
        await client.query("UPDATE device_requests SET status='approved',reviewed_at=NOW() WHERE id=$1", [id]);
      });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) { return apiError(error, "Workspace POST error"); }
}
