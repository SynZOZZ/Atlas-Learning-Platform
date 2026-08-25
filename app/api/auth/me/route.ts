import { currentUser } from "../../../../lib/auth";

export async function GET() {
  const user = await currentUser();
  return user ? Response.json({ user }) : Response.json({ error: "Sign in required" }, { status: 401 });
}
