import { one } from "../../../lib/db";

export async function GET() {
  try {
    await one("SELECT 1 AS ok");
    return Response.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch { return Response.json({ status: "unhealthy" }, { status: 503 }); }
}
