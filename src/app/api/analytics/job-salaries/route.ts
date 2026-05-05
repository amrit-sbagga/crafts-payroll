import { NextRequest, NextResponse } from "next/server";
import { getJobTitleSalaryStats } from "@/modules/employee/employeeAnalytics.service";

export async function GET(request: NextRequest) {
  try {
    const country = request.nextUrl.searchParams.get("country") ?? undefined;
    const data = await getJobTitleSalaryStats(country);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch job title salary stats" },
      { status: 500 }
    );
  }
}
