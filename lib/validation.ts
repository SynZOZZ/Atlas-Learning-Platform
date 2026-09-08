export function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

export function apiError(error: unknown, context: string) {
  console.error(context, error);
  return Response.json({ error: "The request could not be completed. Please try again." }, { status: 500 });
}
