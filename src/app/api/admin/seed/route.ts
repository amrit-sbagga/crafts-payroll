import { NextRequest, NextResponse } from "next/server";
import { seedEmployees } from "@/modules/employee/seedEmployees";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function parseSeedOptions(body: Record<string, unknown>) {
  let count = 1000;
  if (body.count !== undefined) {
    if (
      typeof body.count !== "number" ||
      !Number.isInteger(body.count) ||
      body.count < 1 ||
      body.count > 10_000
    ) {
      return { error: "count must be an integer between 1 and 10000" };
    }
    count = body.count;
  }

  let clean = false;
  if (body.clean !== undefined) {
    if (typeof body.clean !== "boolean") {
      return { error: "clean must be a boolean" };
    }
    clean = body.clean;
  }

  return { options: { count, clean } };
}

export async function POST(request: NextRequest) {
  const token = process.env.SEED_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "SEED_API_TOKEN is not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const provided = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : request.headers.get("x-seed-token");

  if (provided !== token) return unauthorized();

  try {
    const rawBody = await request.json().catch(() => ({}));
    const body =
      rawBody && typeof rawBody === "object" && !Array.isArray(rawBody)
        ? (rawBody as Record<string, unknown>)
        : {};
    const parsed = parseSeedOptions(body);
    if ("error" in parsed) return badRequest(parsed.error);
    const { count, clean } = parsed.options;
    const result = await seedEmployees({ count, clean });

    return NextResponse.json({
      message: "Seed completed",
      data: result
    });
  } catch {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
