import { NextRequest, NextResponse } from "next/server";
import { deleteEmployeesByIds } from "@/modules/employee/employee.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const raw = body.ids;
    if (!Array.isArray(raw)) {
      return NextResponse.json({ error: "Expected ids array" }, { status: 400 });
    }
    const ids = raw.map((id: unknown) => String(id ?? "").trim()).filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }

    const { deleted } = await deleteEmployeesByIds(ids);
    return NextResponse.json({ data: { deleted } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bulk delete failed";
    if (message.includes("Cannot delete more than")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete employees" }, { status: 500 });
  }
}
