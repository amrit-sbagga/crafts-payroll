import { NextResponse } from "next/server";
import { getGlobalSalarySummary } from "@/modules/employee/employeeAnalytics.service";

export async function GET() {
  try {
    const data = await getGlobalSalarySummary();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch global salary summary" },
      { status: 500 }
    );
  }
}
