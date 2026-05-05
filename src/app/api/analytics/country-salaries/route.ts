import { NextResponse } from "next/server";
import { getCountrySalaryStats } from "@/modules/employee/employeeAnalytics.service";

export async function GET() {
  try {
    const data = await getCountrySalaryStats();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch country salary stats" },
      { status: 500 }
    );
  }
}
