import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { validateEmployeeInput } from "@/modules/employee/domain/validateEmployeeInput";
import {
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from "@/modules/employee/employee.service";

type RouteContext = { params: Promise<{ id: string }> };

function notFound() {
  return NextResponse.json({ error: "Employee not found" }, { status: 404 });
}

function isNotFoundError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const employee = await getEmployeeById(id);

    if (!employee) return notFound();

    return NextResponse.json({ data: employee });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();

    const input = {
      fullName: String(body.fullName ?? ""),
      jobTitle: String(body.jobTitle ?? ""),
      country: String(body.country ?? ""),
      department: String(body.department ?? "Engineering"),
      salary: Number(body.salary)
    };

    const validation = validateEmployeeInput(input);
    if (!validation.ok) {
      return NextResponse.json(
        { error: "Validation failed", fields: validation.errors },
        { status: 422 }
      );
    }

    const employee = await updateEmployee(id, input);

    return NextResponse.json({ data: employee });
  } catch (error) {
    if (isNotFoundError(error)) return notFound();
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await deleteEmployee(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (isNotFoundError(error)) return notFound();
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
