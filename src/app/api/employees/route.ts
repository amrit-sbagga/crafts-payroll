import { NextRequest, NextResponse } from "next/server";
import { validateEmployeeInput } from "@/modules/employee/domain/validateEmployeeInput";
import {
  createEmployee,
  listEmployees
} from "@/modules/employee/employee.service";

const CACHE_CONTROL = "private, no-store, max-age=0";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.max(1, Number(searchParams.get("limit") ?? 20));
    const search = searchParams.get("search") ?? undefined;
    const country = searchParams.get("country") ?? undefined;
    const jobTitle = searchParams.get("jobTitle") ?? undefined;
    const rawSortBy = searchParams.get("sortBy");
    const rawSortOrder = searchParams.get("sortOrder");

    const allowedSortBy = new Set([
      "fullName",
      "jobTitle",
      "country",
      "department",
      "salary",
      "createdAt"
    ]);
    const sortBy = allowedSortBy.has(rawSortBy ?? "") ? (rawSortBy as "fullName" | "jobTitle" | "country" | "department" | "salary" | "createdAt") : "createdAt";
    const sortOrder = rawSortOrder === "asc" ? "asc" : "desc";

    const result = await listEmployees({
      page,
      limit,
      search,
      country,
      jobTitle,
      sortBy,
      sortOrder
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": CACHE_CONTROL }
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const input = {
      fullName: String(body.fullName ?? ""),
      jobTitle: String(body.jobTitle ?? ""),
      country: String(body.country ?? ""),
      department: String(body.department ?? "Engineering"),
      gender: String(body.gender ?? "Male"),
      joiningDate: String(body.joiningDate ?? ""),
      avatarUrl: body.avatarUrl ? String(body.avatarUrl) : undefined,
      salary: Number(body.salary)
    };

    const validation = validateEmployeeInput(input);
    if (!validation.ok) {
      return NextResponse.json(
        { error: "Validation failed", fields: validation.errors },
        { status: 422 }
      );
    }

    const employee = await createEmployee(input);

    return NextResponse.json({ data: employee }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
