import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireManager } from "../../../lib/auth";
import { one } from "../../../lib/db";
import { apiError } from "../../../lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const access = await requireManager();
    if ("error" in access) return Response.json({ error: access.error }, { status: access.status });
    const form = await request.formData();
    const file = form.get("file"), courseId = Number(form.get("courseId"));
    if (!(file instanceof File) || !Number.isInteger(courseId)) return Response.json({ error: "Course and file are required" }, { status: 400 });
    const max = Math.max(1, Number(process.env.MAX_UPLOAD_MB || 50)) * 1024 * 1024;
    if (file.size > max) return Response.json({ error: `File exceeds the ${process.env.MAX_UPLOAD_MB || 50} MB limit` }, { status: 413 });
    const allowed = file.type.startsWith("image/") || file.type === "application/pdf" || file.type.startsWith("video/");
    if (!allowed) return Response.json({ error: "Only PDF, image, and video files are supported" }, { status: 415 });
    const course = await one<{ instructor_email: string }>("SELECT instructor_email FROM courses WHERE id=$1", [courseId]);
    if (!course || (access.user.role === "instructor" && course.instructor_email !== access.user.email)) return Response.json({ error: "Course access denied" }, { status: 403 });
    const defaultRoot = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "uploads");
    const root = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : defaultRoot;
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-120) || "asset";
    const stored = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const courseDir = path.join(root, String(courseId));
    await mkdir(courseDir, { recursive: true });
    await writeFile(path.join(courseDir, stored), Buffer.from(await file.arrayBuffer()));
    const asset = await one<{ id: number }>(`INSERT INTO file_assets (course_id,storage_path,original_name,mime_type,size_bytes,uploaded_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [courseId, path.join(String(courseId), stored), file.name, file.type, file.size, access.user.email]);
    return Response.json({ ok: true, url: `/api/files/${asset?.id}`, id: asset?.id, originalName: file.name, mimeType: file.type, sizeBytes: file.size }, { status: 201 });
  } catch (error) { return apiError(error, "Upload error"); }
}
