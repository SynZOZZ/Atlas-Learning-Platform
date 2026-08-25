"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlatformUser } from "../../lib/types";

type AnyRow = Record<string, string | number | boolean | null>;
type WorkspaceData = {
  user: PlatformUser;
  courses: AnyRow[];
  lessons: AnyRow[];
  enrollments: AnyRow[];
  notifications: AnyRow[];
  messages: AnyRow[];
  mediaAssets: AnyRow[];
  users: AnyRow[];
  payments: AnyRow[];
  deviceRequests: AnyRow[];
};

const emptyData: WorkspaceData = { user: {} as PlatformUser, courses: [], lessons: [], enrollments: [], notifications: [], messages: [], mediaAssets: [], users: [], payments: [], deviceRequests: [] };

const labels = {
  en: { overview: "Overview", courses: "Courses", students: "Students", payments: "Payments", devices: "Devices", messages: "Messages", learning: "My learning", discover: "Discover", notifications: "Notifications", profile: "Profile", protection: "Player demo" },
  ar: { overview: "نظرة عامة", courses: "الكورسات", students: "الطلاب", payments: "المدفوعات", devices: "الأجهزة", messages: "الرسائل", learning: "تعليمي", discover: "استكشف", notifications: "الإشعارات", profile: "البيانات", protection: "مشغل الحماية" },
};

function value(row: AnyRow, camel: string, snake?: string) {
  return row[camel] ?? (snake ? row[snake] : undefined) ?? "";
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text) as Record<string, unknown>; }
  catch { throw new Error(`The server returned an unreadable response (${response.status}).`); }
}

function uploadProtectedFile(file: File, courseId: number, onProgress: (percent: number) => void) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("courseId", String(courseId));
    form.append("kind", "lesson");
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    request.onerror = () => reject(new Error("The upload was interrupted. Choose the file and try again."));
    request.onload = () => {
      let payload: Record<string, unknown> = {};
      try { payload = request.responseText ? JSON.parse(request.responseText) as Record<string, unknown> : {}; }
      catch { reject(new Error("The server returned an unreadable upload response.")); return; }
      if (request.status >= 200 && request.status < 300) resolve(payload);
      else reject(new Error(String(payload.error || "Upload failed")));
    };
    request.send(form);
  });
}

function deviceId() {
  const key = "atlas_trusted_device";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `atlas-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    window.localStorage.setItem(key, id);
  }
  return id;
}

function Stat({ label, number, note }: { label: string; number: string | number; note: string }) {
  return <article className="workspace-stat"><p>{label}</p><strong>{number}</strong><span>{note}</span></article>;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty-state"><b>✦</b><p>{children}</p></div>;
}

export default function WorkspaceClient({ initialUser, signOutHref }: { initialUser: PlatformUser; signOutHref: string }) {
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [active, setActive] = useState("overview");
  const [data, setData] = useState<WorkspaceData>({ ...emptyData, user: initialUser });
  const [device] = useState(() => typeof window === "undefined" ? "" : deviceId());
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const role = data.user?.role || initialUser.role;
  const t = labels[locale];

  const load = useCallback(async (knownDevice?: string) => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/workspace", { cache: "no-store", headers: { "x-atlas-device": knownDevice || device } });
      const payload = await readJson(response);
      if (!response.ok) throw new Error(String(payload.error || "Could not load the workspace"));
      setData(payload as unknown as WorkspaceData);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load the workspace"); }
    finally { setBusy(false); }
  }, [device]);

  useEffect(() => {
    if (!device) return;
    const start = window.setTimeout(() => void load(device), 0);
    return () => window.clearTimeout(start);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const act = async (action: string, actionData: Record<string, unknown>) => {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/workspace", { method: "POST", headers: { "content-type": "application/json", "x-atlas-device": device }, body: JSON.stringify({ action, data: actionData }) });
      const payload = await readJson(response);
      if (!response.ok) throw new Error(String(payload.error || "Action failed"));
      setNotice("Saved successfully.");
      await load();
      return true;
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Action failed"); setBusy(false); return false; }
  };

  const saveCourse = async (course: Record<string, unknown>) => {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/courses", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "save", data: course }) });
      const payload = await readJson(response);
      if (!response.ok) throw new Error(String(payload.error || "Course could not be saved"));
      setNotice("Course published and saved.");
      await load();
      return true;
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Course could not be saved"); setBusy(false); return false; }
  };

  const manageCourse = async (action: "publish" | "delete", course: Record<string, unknown>) => {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/courses", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, data: course }) });
      const payload = await readJson(response);
      if (!response.ok) throw new Error(String(payload.error || "Course action failed"));
      setNotice(action === "delete" ? "Course deleted." : "Course visibility updated.");
      await load();
      return true;
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Course action failed"); setBusy(false); return false; }
  };

  const managerNav = role === "admin"
    ? [["overview", t.overview], ["courses", t.courses], ["students", t.students], ["payments", t.payments], ["devices", t.devices], ["notifications", t.notifications], ["messages", t.messages], ["protection", t.protection]]
    : [["overview", t.overview], ["courses", t.courses], ["students", t.students], ["notifications", t.notifications], ["messages", t.messages], ["protection", t.protection]];
  const studentNav = [["learning", t.learning], ["discover", t.discover], ["notifications", t.notifications], ["messages", t.messages], ["profile", t.profile]];
  const nav = role === "student" ? studentNav : managerNav;

  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link className="workspace-brand" href="/"><span>A</span><b>ATLAS</b><small>LEARNING</small></Link>
        <nav>{nav.map(([id, label], index) => <button key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}><i>{String(index + 1).padStart(2, "0")}</i>{label}{id === "notifications" && data.notifications.some((row) => !row.read) ? <em>{data.notifications.filter((row) => !row.read).length}</em> : null}</button>)}</nav>
        <div className="workspace-profile"><span>{data.user?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("") || "A"}</span><div><b>{data.user?.name}</b><small>{role} · {data.user?.status}</small></div></div>
      </aside>

      <section className="workspace-main">
        <header className="workspace-topbar">
          <div><p>{role === "student" ? "LEARNING SPACE" : "CONTROL ROOM"}</p><h1>{nav.find(([id]) => id === active)?.[1] || t.overview}</h1></div>
          <div className="workspace-top-actions"><button onClick={() => setLocale(locale === "en" ? "ar" : "en")}>{locale === "en" ? "العربية" : "English"}</button><Link href="/">Live site ↗</Link><a href={signOutHref}>Sign out</a></div>
        </header>

        {error && <div className="workspace-alert error"><span>{error}</span><button onClick={() => void load()}>Retry</button></div>}
        {notice && <div className="workspace-alert success"><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}
        {busy && <div className="workspace-loader"><i /><span>Syncing your learning space…</span></div>}

        {!busy && role === "student" && data.user.status !== "approved" ? <PendingProfile user={data.user} act={act} /> : null}
        {!busy && (role !== "student" || data.user.status === "approved") && active === "overview" && <ManagerOverview data={data} role={role} />}
        {!busy && active === "courses" && role !== "student" && <CourseManager courses={data.courses} lessons={data.lessons} saveCourse={saveCourse} manageCourse={manageCourse} act={act} role={role} />}
        {!busy && active === "students" && role !== "student" && <StudentManager users={data.users} enrollments={data.enrollments} role={role} act={act} />}
        {!busy && active === "payments" && role === "admin" && <PaymentManager payments={data.payments} act={act} />}
        {!busy && active === "devices" && role === "admin" && <DeviceManager rows={data.deviceRequests} act={act} />}
        {!busy && active === "protection" && role !== "student" && <ProtectedPlayer name={data.user.name} email={data.user.email} />}
        {!busy && active === "learning" && role === "student" && data.user.status === "approved" && <MyLearning data={data} />}
        {!busy && active === "discover" && role === "student" && data.user.status === "approved" && <Discover courses={data.courses} act={act} />}
        {!busy && active === "notifications" && (role !== "student" || data.user.status === "approved") && <Notifications rows={data.notifications} act={act} />}
        {!busy && active === "messages" && (role !== "student" || data.user.status === "approved") && <Messages data={data} act={act} />}
        {!busy && active === "profile" && role === "student" && data.user.status === "approved" && <ProfileForm user={data.user} act={act} />}
      </section>
    </main>
  );
}

function ManagerOverview({ data, role }: { data: WorkspaceData; role: string }) {
  const students = data.users.filter((user) => user.role === "student");
  const pending = students.filter((user) => user.status === "pending").length;
  const revenue = data.payments.filter((row) => row.status === "paid").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  return <div className="workspace-stack"><section className="workspace-stats"><Stat label="Active courses" number={data.courses.filter((course) => Boolean(course.published)).length} note="Publicly visible" /><Stat label="Student profiles" number={students.length} note={`${pending} waiting for review`} /><Stat label="Paid enrollments" number={data.enrollments.filter((row) => row.payment_status === "paid").length} note="Access is active" /><Stat label="Verified revenue" number={`${revenue.toLocaleString()} EGP`} note={role === "admin" ? "Approved payments" : "Platform total"} /></section><section className="workspace-panel"><div className="panel-heading"><div><p>OPERATIONS</p><h2>Today at a glance</h2></div><span className="status-chip">Live data</span></div><div className="activity-grid"><article><b>{pending}</b><span>profiles need a decision</span></article><article><b>{data.payments.filter((row) => row.status === "pending").length}</b><span>payments need review</span></article><article><b>{data.deviceRequests.length}</b><span>device change requests</span></article><article><b>{data.messages.length}</b><span>recent conversations</span></article></div></section></div>;
}

const blankCourse = { titleEn: "", titleAr: "", categoryEn: "", categoryAr: "", summaryEn: "", summaryAr: "", instructorName: "", instructorEmail: "", whatsapp: "", price: 0, mode: "Recorded", imageUrl: "/assets/course-tech.png", level: "All levels", duration: "" };

function CourseManager({ courses, lessons, saveCourse, manageCourse, act, role }: { courses: AnyRow[]; lessons: AnyRow[]; saveCourse: (course: Record<string, unknown>) => Promise<boolean>; manageCourse: (action: "publish" | "delete", course: Record<string, unknown>) => Promise<boolean>; act: (action: string, data: Record<string, unknown>) => Promise<boolean>; role: string }) {
  const [editing, setEditing] = useState<Record<string, unknown>>(blankCourse);
  const [lessonCourse, setLessonCourse] = useState(Number(courses[0]?.id || 0));
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonKind, setLessonKind] = useState("video");
  const [lessonAsset, setLessonAsset] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadInfo, setUploadInfo] = useState("");

  const upload = async (file: File) => {
    if (!lessonCourse) return;
    setUploading(true); setUploadProgress(0); setUploadInfo("");
    try {
      const payload = await uploadProtectedFile(file, lessonCourse, setUploadProgress);
      setLessonAsset(String(payload.url || ""));
      setLessonKind(file.type.startsWith("video/") ? "video" : "file");
      if (!lessonTitle) setLessonTitle(file.name.replace(/\.[^.]+$/, "").replaceAll("-", " "));
      setUploadInfo(`${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB · ready to publish`);
    } catch (caught) { window.alert(caught instanceof Error ? caught.message : "Upload failed"); }
    finally { setUploading(false); }
  };

  return <div className="manager-grid">
    <section className="workspace-panel course-list-panel">
      <div className="panel-heading"><div><p>COURSE CATALOG</p><h2>{courses.length} editable spaces</h2></div><button className="outline-button" onClick={() => setEditing(blankCourse)}>+ New course</button></div>
      <div className="dashboard-course-list">{courses.map((course) => <article key={String(course.id)}>
        <img src={String(value(course, "imageUrl", "image_url"))} alt="" />
        <div><small>{String(value(course, "categoryEn", "category_en"))} · {String(course.mode)}</small><h3>{String(value(course, "titleEn", "title_en"))}</h3><p>{String(value(course, "instructorName", "instructor_name"))}</p></div>
        <div className="row-actions">
          <button onClick={() => setEditing({ ...course, titleEn: value(course, "titleEn", "title_en"), titleAr: value(course, "titleAr", "title_ar"), categoryEn: value(course, "categoryEn", "category_en"), categoryAr: value(course, "categoryAr", "category_ar"), summaryEn: value(course, "summaryEn", "summary_en"), summaryAr: value(course, "summaryAr", "summary_ar"), instructorName: value(course, "instructorName", "instructor_name"), instructorEmail: value(course, "instructorEmail", "instructor_email"), imageUrl: value(course, "imageUrl", "image_url") })}>Edit</button>
          <button onClick={() => void manageCourse("publish", { id: course.id, published: !course.published })}>{course.published ? "Hide" : "Publish"}</button>
          <button className="danger-action" onClick={() => window.confirm("Delete this course and all of its lessons?") && void manageCourse("delete", { id: course.id })}>Delete</button>
          <span className={course.published ? "published" : "draft"}>{course.published ? "Published" : "Hidden"}</span>
        </div>
      </article>)}</div>
    </section>
    <section className="workspace-panel form-panel"><div className="panel-heading"><div><p>EDITOR</p><h2>{editing.id ? "Update course" : "Create course"}</h2></div></div><CourseForm data={editing} setData={setEditing} onSave={saveCourse} role={role} /></section>
    <section className="workspace-panel lesson-panel">
      <div className="panel-heading"><div><p>COURSE MATERIAL</p><h2>Add and arrange lessons</h2></div></div>
      <div className="control-form"><label>Course<select value={lessonCourse} onChange={(event) => { setLessonCourse(Number(event.target.value)); setLessonAsset(""); setUploadInfo(""); }}>{courses.map((course) => <option key={String(course.id)} value={String(course.id)}>{String(value(course, "titleEn", "title_en"))}</option>)}</select></label><label>Title<input value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} placeholder="Lesson title" /></label><label>Type<select value={lessonKind} onChange={(event) => setLessonKind(event.target.value)}><option value="video">Recorded video</option><option value="live">Live session</option><option value="file">View-only file</option></select></label><label>Duration / schedule<input value={lessonDuration} onChange={(event) => setLessonDuration(event.target.value)} placeholder="08:24 or Thursday 19:30" /></label><label>Private asset / meeting URL<input value={lessonAsset} onChange={(event) => setLessonAsset(event.target.value)} placeholder="Upload a file or add a private URL" /></label><label className={`file-input ${uploading ? "uploading" : ""}`}>{uploading ? `Uploading ${uploadProgress}%` : "Choose video, PDF, or image"}<input disabled={uploading} type="file" accept="video/*,.pdf,image/*" onChange={(event) => event.target.files?.[0] && void upload(event.target.files[0])} />{uploading ? <span style={{ width: `${uploadProgress}%` }} /> : null}</label>{uploadInfo ? <p className="upload-info">✓ {uploadInfo}</p> : <p className="upload-help">The upload is private. Publish it below to add it to the course room.</p>}<button disabled={uploading || !lessonTitle || (lessonKind !== "live" && !lessonAsset)} className="workspace-primary" onClick={() => void act("addLesson", { courseId: lessonCourse, title: lessonTitle, kind: lessonKind, assetUrl: lessonAsset, duration: lessonDuration }).then((ok) => { if (ok) { setLessonTitle(""); setLessonAsset(""); setLessonDuration(""); setUploadInfo(""); setUploadProgress(0); } })}>Publish material <span>↗</span></button></div>
      <div className="mini-list">{lessons.filter((lesson) => Number(lesson.course_id) === lessonCourse).map((lesson) => <div key={String(lesson.id)}><span>{lesson.kind === "video" ? "▶" : lesson.kind === "live" ? "●" : "□"}</span><p><b>{String(lesson.title)}</b><small>{String(lesson.duration || lesson.kind)}</small></p><div className="row-actions"><button onClick={() => void act("moveLesson", { id: lesson.id, direction: "up" })}>↑</button><button onClick={() => void act("moveLesson", { id: lesson.id, direction: "down" })}>↓</button><button className="danger-action" onClick={() => window.confirm("Delete this lesson?") && void act("deleteLesson", { id: lesson.id })}>Delete</button></div></div>)}</div>
    </section>
  </div>;
}

function CourseForm({ data, setData, onSave, role }: { data: Record<string, unknown>; setData: (data: Record<string, unknown>) => void; onSave: (data: Record<string, unknown>) => Promise<boolean>; role: string }) {
  const field = (name: string, label: string, type = "text") => <label>{label}<input type={type} value={String(data[name] ?? "")} onChange={(event) => setData({ ...data, [name]: type === "number" ? Number(event.target.value) : event.target.value })} /></label>;
  return <form className="control-form two-column" onSubmit={(event) => { event.preventDefault(); void onSave(data); }}>
    {field("titleEn", "English title")}{field("titleAr", "Arabic title")}{field("categoryEn", "English category")}{field("categoryAr", "Arabic category")}<label className="wide">English description<textarea value={String(data.summaryEn ?? "")} onChange={(event) => setData({ ...data, summaryEn: event.target.value })} /></label><label className="wide">Arabic description<textarea dir="rtl" value={String(data.summaryAr ?? "")} onChange={(event) => setData({ ...data, summaryAr: event.target.value })} /></label>{field("instructorName", "Instructor name")}{role === "admin" && field("instructorEmail", "Instructor email", "email")}{field("whatsapp", "Course WhatsApp")}{field("price", "Price (EGP)", "number")}<label>Delivery<select value={String(data.mode ?? "Recorded")} onChange={(event) => setData({ ...data, mode: event.target.value })}><option>Recorded</option><option>Live</option><option>Recorded + Live</option></select></label>{field("duration", "Duration")}{field("level", "Level")} {field("imageUrl", "Cover URL")}
    <button className="workspace-primary wide" type="submit">Save course <span>↗</span></button>
  </form>;
}

function StudentManager({ users, enrollments, role, act }: { users: AnyRow[]; enrollments: AnyRow[]; role: string; act: (action: string, data: Record<string, unknown>) => Promise<boolean> }) {
  const students = users.filter((user) => user.role === "student");
  return <section className="workspace-panel"><div className="panel-heading"><div><p>APPLICATION REVIEW</p><h2>Student profiles</h2></div><span className="status-chip">{students.filter((user) => user.status === "pending").length} pending</span></div>{students.length ? <div className="data-table student-table">{students.map((student) => <article key={String(student.email)}><div className="student-avatar">{String(student.name || student.email).slice(0, 2).toUpperCase()}</div><div><b>{String(student.name)}</b><small>{String(student.email)}</small></div><div><b>{String(student.phone || "No phone")}</b><small>{String(student.city || "City not added")} · {String(student.country || "Country not added")}</small></div><div><b>{String(student.specialty || "No specialty")}</b><small>{enrollments.filter((row) => row.user_email === student.email).length} enrollments</small></div><span className={`review-status ${String(student.status)}`}>{String(student.status)}</span><div className="row-actions"><button onClick={() => void act("reviewUser", { email: student.email, status: "approved" })}>Approve</button><button onClick={() => void act("reviewUser", { email: student.email, status: "needs_changes" })}>Changes</button>{role === "admin" && <button onClick={() => void act("setRole", { email: student.email, role: "instructor" })}>Make instructor</button>}</div></article>)}</div> : <EmptyState>New student applications will appear here.</EmptyState>}</section>;
}

function PaymentManager({ payments, act }: { payments: AnyRow[]; act: (action: string, data: Record<string, unknown>) => Promise<boolean> }) {
  return <section className="workspace-panel"><div className="panel-heading"><div><p>PAYMENT CONTROL</p><h2>Enrollment transactions</h2></div><span className="status-chip">Test + manual review</span></div>{payments.length ? <div className="data-table payment-table">{payments.map((payment) => <article key={String(payment.id)}><div><b>{String(payment.studentName || payment.user_email)}</b><small>{String(payment.user_email)}</small></div><div><b>{String(payment.courseTitle)}</b><small>{String(payment.method).replaceAll("_", " ")}</small></div><div><b>{Number(payment.amount).toLocaleString()} EGP</b><small>Ref: {String(payment.reference || "—")}</small></div><span className={`review-status ${String(payment.status)}`}>{String(payment.status)}</span><div className="row-actions">{payment.status === "pending" && <><button onClick={() => void act("reviewPayment", { id: payment.id, status: "paid" })}>Confirm</button><button onClick={() => void act("reviewPayment", { id: payment.id, status: "rejected" })}>Reject</button></>}</div></article>)}</div> : <EmptyState>Payment requests will appear here after enrollment.</EmptyState>}</section>;
}

function DeviceManager({ rows, act }: { rows: AnyRow[]; act: (action: string, data: Record<string, unknown>) => Promise<boolean> }) {
  return <section className="workspace-panel"><div className="panel-heading"><div><p>TRUSTED DEVICE</p><h2>Device change requests</h2></div><span className="status-chip">One device per student</span></div>{rows.length ? <div className="data-table device-table">{rows.map((row) => <article key={String(row.id)}><div><b>{String(row.user_email)}</b><small>Requested {String(row.created_at)}</small></div><code>{String(row.requested_device_id).slice(0, 18)}…</code><button className="outline-button" onClick={() => void act("approveDevice", { id: row.id })}>Trust this device</button></article>)}</div> : <EmptyState>No device change requests are waiting.</EmptyState>}</section>;
}

function PendingProfile({ user, act }: { user: PlatformUser; act: (action: string, data: Record<string, unknown>) => Promise<boolean> }) {
  return <div className="pending-layout"><section><p className="micro-label">APPLICATION STATUS</p><h2>{user.status === "needs_changes" ? "Your profile needs an update." : "Complete your student profile."}</h2><p>Course payment and enrollment become available after an administrator or instructor reviews your information.</p><ol><li className="done">Account created</li><li className={user.phone ? "done" : ""}>Full profile submitted</li><li>Academic review</li><li>Course enrollment</li></ol></section><ProfileForm user={user} act={act} /></div>;
}

function ProfileForm({ user, act }: { user: PlatformUser; act: (action: string, data: Record<string, unknown>) => Promise<boolean> }) {
  const [form, setForm] = useState({ name: user.name || "", phone: user.phone || "", whatsapp: user.whatsapp || "", country: user.country || "", city: user.city || "", specialty: user.specialty || "" });
  return <section className="workspace-panel profile-form"><div className="panel-heading"><div><p>STUDENT DETAILS</p><h2>Clear, reviewable information</h2></div></div><form className="control-form two-column" onSubmit={(event) => { event.preventDefault(); void act("profile", form); }}>{Object.entries({ name: "Full legal name", phone: "Phone number", whatsapp: "WhatsApp number", country: "Country", city: "City", specialty: "Field of study / work" }).map(([name, label]) => <label key={name}>{label}<input required={["name", "phone"].includes(name)} value={form[name as keyof typeof form]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} /></label>)}<button className="workspace-primary wide" type="submit">Submit for review <span>↗</span></button></form></section>;
}

function Discover({ courses, act }: { courses: AnyRow[]; act: (action: string, data: Record<string, unknown>) => Promise<boolean> }) {
  const [paying, setPaying] = useState<number | null>(null);
  const [method, setMethod] = useState("test_card");
  const [reference, setReference] = useState("");
  return <div><div className="workspace-section-heading"><p>Choose a course and its instructor. Access opens only after payment is confirmed.</p></div><div className="workspace-course-grid">{courses.map((course) => <article key={String(course.id)}><img src={String(value(course, "imageUrl", "image_url"))} alt="" /><div><small>{String(value(course, "categoryEn", "category_en"))} · {String(course.mode)}</small><h2>{String(value(course, "titleEn", "title_en"))}</h2><p>with <b>{String(value(course, "instructorName", "instructor_name"))}</b></p><div className="course-price"><strong>{Number(course.price).toLocaleString()} EGP</strong><a href={`https://wa.me/${String(course.whatsapp)}`} target="_blank">WhatsApp ↗</a></div>{course.paymentStatus === "paid" ? <span className="enrolled-chip">Enrolled</span> : paying === Number(course.id) ? <div className="payment-box"><select value={method} onChange={(event) => setMethod(event.target.value)}><option value="test_card">Test card — instant approval</option><option value="visa">Visa / card — gateway review</option><option value="wallet">Orange Cash / wallet</option><option value="cash_transfer">Cash transfer</option></select>{method !== "test_card" && <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Payment reference" />}<button onClick={() => void act("enroll", { courseId: course.id, method, reference }).then((ok) => ok && setPaying(null))}>Confirm enrollment</button></div> : <button className="workspace-primary" onClick={() => setPaying(Number(course.id))}>Enroll & pay <span>↗</span></button>}</div></article>)}</div></div>;
}

function MyLearning({ data }: { data: WorkspaceData }) {
  const active = data.courses.filter((course) => course.paymentStatus === "paid" && course.enrollmentStatus === "active");
  const [selected, setSelected] = useState<number | null>(active[0] ? Number(active[0].id) : null);
  const chosen = active.find((course) => Number(course.id) === selected);
  const lessons = data.lessons.filter((lesson) => Number(lesson.course_id) === selected);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const opened = lessons.find((lesson) => Number(lesson.id) === lessonId) || lessons[0];
  const source = String(opened?.asset_url || "");
  const asset = data.mediaAssets.find((row) => String(row.url) === source);
  const inferredMime = String(asset?.mimeType || (source.match(/\.pdf(?:$|\?)/i) ? "application/pdf" : source.match(/\.(png|jpe?g|gif|webp)(?:$|\?)/i) ? "image/*" : opened?.kind === "video" ? "video/*" : ""));
  return active.length ? <div className="learning-layout"><aside>{active.map((course) => <button key={String(course.id)} className={selected === Number(course.id) ? "active" : ""} onClick={() => { setSelected(Number(course.id)); setLessonId(null); }}><img src={String(value(course, "imageUrl", "image_url"))} alt="" /><span><b>{String(value(course, "titleEn", "title_en"))}</b><small>{Number(course.progress || 0)}% complete</small></span></button>)}</aside><section>{chosen && <><p className="micro-label">PROTECTED COURSE ROOM</p><h2>{String(value(chosen, "titleEn", "title_en"))}</h2><LearningViewer lesson={opened} source={source} mimeType={inferredMime} name={data.user.name} email={data.user.email} /><div className="lesson-list">{lessons.map((lesson, index) => <article className={Number(opened?.id) === Number(lesson.id) ? "active" : ""} key={String(lesson.id)}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{String(lesson.title)}</b><small>{String(lesson.kind)} · {String(lesson.duration || "View in platform")}</small></div>{lesson.asset_url ? <button onClick={() => setLessonId(Number(lesson.id))}>{lesson.kind === "file" ? "Open" : lesson.kind === "live" ? "Details" : "Play"}</button> : <button disabled>Coming soon</button>}</article>)}</div></>}</section></div> : <EmptyState>Your paid courses will appear here. Open Discover to choose your first course.</EmptyState>;
}

function LearningViewer({ lesson, source, mimeType, name, email }: { lesson?: AnyRow; source: string; mimeType: string; name: string; email: string }) {
  if (!lesson) return <ProtectedPlayer name={name} email={email} compact />;
  if (lesson.kind === "live") return <section className="live-room-card"><span>● LIVE SESSION</span><h3>{String(lesson.title)}</h3><p>{String(lesson.duration || "The instructor will share the schedule here.")}</p>{source ? <a href={source} target="_blank" rel="noreferrer">Join live room ↗</a> : <button disabled>Meeting link coming soon</button>}</section>;
  if (lesson.kind === "file") return <ProtectedDocument source={source} mimeType={mimeType} title={String(lesson.title)} name={name} email={email} />;
  return <ProtectedPlayer name={name} email={email} compact source={source} title={String(lesson.title)} />;
}

function ProtectedDocument({ source, mimeType, title, name, email }: { source: string; mimeType: string; title: string; name: string; email: string }) {
  const stamp = useMemo(() => `${name} · ${email.replace(/(.{2}).+(@.+)/, "$1***$2")}`, [name, email]);
  if (!source) return <div className="document-empty">This file will be available soon.</div>;
  return <section className="document-viewer" onContextMenu={(event) => event.preventDefault()}><header><b>{title}</b><span>VIEW ONLY</span></header><div>{mimeType.startsWith("image/") ? <img src={source} alt={title} draggable={false} /> : <iframe src={`${source}#toolbar=0&navpanes=0`} title={title} />}<span className="moving-watermark">{stamp}</span></div></section>;
}

function ProtectedPlayer({ name, email, compact = false, source = "", title = "Protected course preview" }: { name: string; email: string; compact?: boolean; source?: string; title?: string }) {
  const stamp = useMemo(() => `${name} · ${email.replace(/(.{2}).+(@.+)/, "$1***$2")}`, [name, email]);
  return <section className={`player-demo ${compact ? "compact" : ""}`} onContextMenu={(event) => event.preventDefault()}><div className="player-screen">{source ? <video src={source} title={title} controls controlsList="nodownload noremoteplayback" disablePictureInPicture playsInline preload="metadata" /> : <><img src="/assets/course-tech.png" alt={title} draggable={false} /><button className="play-button" aria-label="Preview only">▶</button><div className="player-controls"><span>PREVIEW</span><i><b /></i><span>Original</span></div></>}<div className="player-shade" /><span className="brand-watermark">ATLAS LEARNING · VIEW ONLY</span><span className="moving-watermark">{stamp}</span></div>{!compact && <div className="player-notes"><article><b>Dynamic identity</b><p>The signed-in student’s masked identity moves across each recorded lesson.</p></article><article><b>Private original file</b><p>Direct uploads play at their original quality. Adaptive 360p–1080p needs a streaming provider later.</p></article><article><b>Practical deterrence</b><p>Authorized playback, no download control, and a visible identity watermark reduce misuse.</p></article></div>}</section>;
}

function Notifications({ rows, act }: { rows: AnyRow[]; act: (action: string, data: Record<string, unknown>) => Promise<boolean> }) {
  const unread = rows.filter((row) => !row.read).length;
  return <section className="workspace-panel"><div className="panel-heading"><div><p>COURSE-SCOPED UPDATES</p><h2>Your notifications</h2></div>{unread ? <button className="outline-button" onClick={() => void act("markNotificationsRead", {})}>Mark all read ({unread})</button> : <span className="status-chip">All read</span>}</div>{rows.length ? <div className="notification-list">{rows.map((row) => <article className={row.read ? "" : "unread"} key={String(row.id)}><i /><div><small>{String(row.courseTitle || "Platform")}</small><b>{String(row.title)}</b><p>{String(row.message)}</p><time>{String(row.created_at)}</time></div>{!row.read ? <button onClick={() => void act("markNotificationRead", { id: row.id })}>Mark read</button> : null}</article>)}</div> : <EmptyState>New material, replies, and course updates will appear here.</EmptyState>}</section>;
}

function Messages({ data, act }: { data: WorkspaceData; act: (action: string, data: Record<string, unknown>) => Promise<boolean> }) {
  const student = data.user.role === "student";
  const eligible = student ? data.courses.filter((course) => course.paymentStatus === "paid") : data.courses;
  const [courseId, setCourseId] = useState(Number(eligible[0]?.id || 0));
  const selected = eligible.find((course) => Number(course.id) === courseId);
  const recipients = student ? [] : data.enrollments.filter((row) => Number(row.course_id) === courseId);
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");
  const effectiveRecipient = student ? String(value(selected || {}, "instructorEmail", "instructor_email")) : recipient;
  const thread = data.messages.filter((message) => Number(message.course_id) === courseId);
  return <div className="message-layout"><section className="workspace-panel"><div className="panel-heading"><div><p>COURSE CONVERSATIONS</p><h2>{String(value(selected || {}, "titleEn", "title_en") || "Direct messages")}</h2></div><span className="status-chip">{thread.length} messages</span></div>{thread.length ? <div className="message-list">{thread.map((message) => <article key={String(message.id)} className={message.sender_email === data.user.email ? "mine" : ""}><small>{String(message.senderName || message.sender_email)} → {String(message.receiverName || message.receiver_email)}</small><p>{String(message.body)}</p><time>{String(message.created_at)}</time></article>)}</div> : <EmptyState>No messages in this course yet. Start the conversation from the form.</EmptyState>}</section><section className="workspace-panel compose-panel"><div className="panel-heading"><div><p>NEW MESSAGE</p><h2>Ask in context</h2></div></div><div className="control-form"><label>Course<select value={courseId} onChange={(event) => { setCourseId(Number(event.target.value)); setRecipient(""); }}>{eligible.map((course) => <option key={String(course.id)} value={String(course.id)}>{String(value(course, "titleEn", "title_en"))}</option>)}</select></label>{!student && <label>Enrolled student<select value={recipient} onChange={(event) => setRecipient(event.target.value)}><option value="">Choose a student</option>{recipients.map((row) => <option key={String(row.user_email)} value={String(row.user_email)}>{String(row.studentName || row.user_email)}</option>)}</select></label>} {student ? <p className="message-recipient">To: {String(value(selected || {}, "instructorName", "instructor_name"))}</p> : null}<label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write your course-specific message…" /></label><button disabled={!courseId || !effectiveRecipient || !body.trim()} className="workspace-primary" onClick={() => void act("sendMessage", { courseId, receiverEmail: effectiveRecipient, body }).then((ok) => ok && setBody(""))}>Send message <span>↗</span></button></div></section></div>;
}
