import { NextResponse } from "next/server";
import { getCountrySalaryStats } from "@/modules/employee/employeeAnalytics.service";

const CACHE_CONTROL = "private, no-store";

export async function GET() {
  try {
    const data = await getCountrySalaryStats();
    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch country salary stats" },
      { status: 500 }
    );
  }
}
