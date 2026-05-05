import { NextRequest, NextResponse } from "next/server";
import { validateEmployeeInput } from "@/modules/employee/domain/validateEmployeeInput";
import {
  createEmployee,
  listEmployees
} from "@/modules/employee/employee.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.max(1, Number(searchParams.get("limit") ?? 20));
    const search = searchParams.get("search") ?? undefined;
    const country = searchParams.get("country") ?? undefined;
    const jobTitle = searchParams.get("jobTitle") ?? undefined;

    const result = await listEmployees({ page, limit, search, country, jobTitle });

    return NextResponse.json(result);
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
