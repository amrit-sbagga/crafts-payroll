import { NextResponse } from "next/server";
import { getDepartmentSalaryStats } from "@/modules/employee/employeeAnalytics.service";

const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

export async function GET() {
  try {
    const data = await getDepartmentSalaryStats();
    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch department salary stats" },
      { status: 500 }
    );
  }
}
