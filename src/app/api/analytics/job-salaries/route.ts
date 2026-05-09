import { NextRequest, NextResponse } from "next/server";
import { getJobTitleSalaryStats } from "@/modules/employee/employeeAnalytics.service";

const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

export async function GET(request: NextRequest) {
  try {
    const country = request.nextUrl.searchParams.get("country") ?? undefined;
    const data = await getJobTitleSalaryStats(country);
    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch job title salary stats" },
      { status: 500 }
    );
  }
}
