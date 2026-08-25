import { NextResponse } from "next/server";
import { clearSession } from "../../../../lib/auth";

export async function POST() {
  await clearSession();
  return Response.json({ ok: true });
}

export async function GET(request: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/", request.url));
}
