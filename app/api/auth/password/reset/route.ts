import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { one, withTransaction } from "../../../../../lib/db";
import { apiError, clean } from "../../../../../lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const token = clean(body.token, 100);
    const password = clean(body.password, 200);
    if (!token || password.length < 8) return Response.json({ error: "A valid token and 8-character password are required" }, { status: 400 });
    const hash = createHash("sha256").update(token).digest("hex");
    const row = await one<{ id: number; user_email: string }>("SELECT id,user_email FROM password_reset_tokens WHERE token_hash=$1 AND used_at IS NULL AND expires_at>NOW()", [hash]);
    if (!row) return Response.json({ error: "This reset link is invalid or expired" }, { status: 400 });
    const passwordHash = await bcrypt.hash(password, 12);
    await withTransaction(async (client) => {
      await client.query("UPDATE users SET password_hash=$1,updated_at=NOW() WHERE email=$2", [passwordHash, row.user_email]);
      await client.query("UPDATE password_reset_tokens SET used_at=NOW() WHERE id=$1", [row.id]);
    });
    return Response.json({ ok: true });
  } catch (error) { return apiError(error, "Password reset error"); }
}
