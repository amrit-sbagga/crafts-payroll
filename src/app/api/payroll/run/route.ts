import { NextRequest, NextResponse } from "next/server";
import { runMonthlyPayroll } from "@/modules/employee/payroll.service";

function isValidMonth(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 12;
}

function isValidYear(value: number) {
  return Number.isInteger(value) && value >= 2000 && value <= 2100;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const month = Number(body.month);
    const year = Number(body.year);

    if (!isValidMonth(month) || !isValidYear(year)) {
      return NextResponse.json(
        { error: "Invalid month/year. Please provide a valid payroll period." },
        { status: 422 }
      );
    }

    const data = await runMonthlyPayroll(month, year);
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to run monthly payroll." },
      { status: 500 }
    );
  }
}

