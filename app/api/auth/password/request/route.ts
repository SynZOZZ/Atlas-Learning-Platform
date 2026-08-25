import { createHash, randomBytes } from "node:crypto";
import { one, pool } from "../../../../../lib/db";
import { sendPasswordResetEmail } from "../../../../../lib/email";
import { apiError, clean } from "../../../../../lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = clean(body.email, 160).toLowerCase();
    const user = await one("SELECT id FROM users WHERE email=$1", [email]);
    let developmentResetUrl: string | undefined;
    if (user) {
      const token = randomBytes(32).toString("hex");
      const hash = createHash("sha256").update(token).digest("hex");
      await pool.query("DELETE FROM password_reset_tokens WHERE user_email=$1 OR expires_at<NOW()", [email]);
      await pool.query("INSERT INTO password_reset_tokens (user_email,token_hash,expires_at) VALUES ($1,$2,NOW()+INTERVAL '30 minutes')", [email, hash]);
      const base = process.env.APP_URL || "http://localhost:3000";
      const resetUrl = `${base}/reset-password?token=${token}`;
      if (process.env.NODE_ENV !== "production") developmentResetUrl = resetUrl;
      await sendPasswordResetEmail(email, resetUrl);
    }
    return Response.json({ ok: true, message: "If the account exists, reset instructions are ready.", developmentResetUrl });
  } catch (error) { return apiError(error, "Password reset request error"); }
}
