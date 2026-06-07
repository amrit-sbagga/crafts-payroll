import { NextRequest, NextResponse } from "next/server";
import { seedEmployees } from "@/modules/employee/seedEmployees";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const body = await request.json().catch(() => ({}));
    const count = Number(body.count ?? 1000);
    if (body.clean !== undefined && typeof body.clean !== "boolean") {
      return NextResponse.json(
        { error: "clean must be a boolean" },
        { status: 400 }
      );
    }
    const clean = body.clean === true;
    const result = await seedEmployees({ count, clean });

    return NextResponse.json({
      message: "Seed completed",
      data: result
    });
  } catch {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
