import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { requireUser } from "../../../../lib/auth";
import { one } from "../../../../lib/db";
import { apiError } from "../../../../lib/validation";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireUser();
    if ("error" in access) return Response.json({ error: access.error }, { status: access.status });
    const { id } = await params;
    const asset = await one<{ course_id: number; storage_path: string; original_name: string; mime_type: string }>("SELECT course_id,storage_path,original_name,mime_type FROM file_assets WHERE id=$1", [Number(id)]);
    if (!asset) return Response.json({ error: "File not found" }, { status: 404 });
    if (access.user.role === "student") {
      const enrollment = await one("SELECT id FROM enrollments WHERE user_email=$1 AND course_id=$2 AND payment_status='paid' AND status='active'", [access.user.email, asset.course_id]);
      if (!enrollment) return Response.json({ error: "Paid enrollment required" }, { status: 403 });
    } else if (access.user.role === "instructor") {
      const course = await one("SELECT id FROM courses WHERE id=$1 AND instructor_email=$2", [asset.course_id, access.user.email]);
      if (!course) return Response.json({ error: "Course access denied" }, { status: 403 });
    }
    const defaultRoot = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "uploads");
    const root = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : defaultRoot;
    const fullPath = path.resolve(root, asset.storage_path);
    if (!fullPath.startsWith(`${root}${path.sep}`)) return Response.json({ error: "Invalid asset path" }, { status: 400 });
    const info = await stat(fullPath);
    const headers = new Headers({ "content-type": asset.mime_type, "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(asset.original_name)}`, "cache-control": "private, no-store", "x-content-type-options": "nosniff", "accept-ranges": "bytes" });
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) return new Response(null, { status: 416, headers: { "content-range": `bytes */${info.size}` } });
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (!Number.isInteger(start) || !Number.isInteger(end) || start > end || start >= info.size) return new Response(null, { status: 416, headers: { "content-range": `bytes */${info.size}` } });
      headers.set("content-range", `bytes ${start}-${end}/${info.size}`);
      headers.set("content-length", String(end - start + 1));
      const stream = createReadStream(fullPath, { start, end });
      return new Response(Readable.toWeb(stream) as ReadableStream, { status: 206, headers });
    }
    headers.set("content-length", String(info.size));
    return new Response(Readable.toWeb(createReadStream(fullPath)) as ReadableStream, { headers });
  } catch (error) { return apiError(error, "File access error"); }
}
