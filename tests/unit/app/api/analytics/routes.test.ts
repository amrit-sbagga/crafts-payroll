/** @jest-environment node */

import { GET as getSummary } from "@/app/api/analytics/summary/route";
import { GET as getCountrySalaries } from "@/app/api/analytics/country-salaries/route";
import { GET as getDepartmentSalaries } from "@/app/api/analytics/department-salaries/route";
import { GET as getJobSalaries } from "@/app/api/analytics/job-salaries/route";
import {
  getCountrySalaryStats,
  getDepartmentSalaryStats,
  getGlobalSalarySummary,
  getJobTitleSalaryStats
} from "@/modules/employee/employeeAnalytics.service";

jest.mock("@/modules/employee/employeeAnalytics.service", () => ({
  getCountrySalaryStats: jest.fn(),
  getDepartmentSalaryStats: jest.fn(),
  getGlobalSalarySummary: jest.fn(),
  getJobTitleSalaryStats: jest.fn()
}));

const mockedGetCountrySalaryStats = jest.mocked(getCountrySalaryStats);
const mockedGetDepartmentSalaryStats = jest.mocked(getDepartmentSalaryStats);
const mockedGetGlobalSalarySummary = jest.mocked(getGlobalSalarySummary);
const mockedGetJobTitleSalaryStats = jest.mocked(getJobTitleSalaryStats);

describe("analytics api routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns global summary payload", async () => {
    mockedGetGlobalSalarySummary.mockResolvedValue({
      minSalary: 100,
      maxSalary: 1000,
      avgSalary: 500,
      totalEmployees: 10
    });

    const response = await getSummary();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(json).toEqual({
      success: true,
      data: { minSalary: 100, maxSalary: 1000, avgSalary: 500, totalEmployees: 10 }
    });
  });

  it("returns 500 for summary failure", async () => {
    mockedGetGlobalSalarySummary.mockRejectedValue(new Error("boom"));

    const response = await getSummary();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: "Failed to fetch global salary summary"
    });
  });

  it("returns country salary stats payload", async () => {
    mockedGetCountrySalaryStats.mockResolvedValue([
      { country: "India", minSalary: 100, maxSalary: 1000, avgSalary: 500 }
    ]);

    const response = await getCountrySalaries();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(json).toEqual({
      success: true,
      data: [{ country: "India", minSalary: 100, maxSalary: 1000, avgSalary: 500 }]
    });
  });

  it("returns department salary stats payload", async () => {
    mockedGetDepartmentSalaryStats.mockResolvedValue([
      { department: "Engineering", headcount: 4, avgSalary: 600 }
    ]);

    const response = await getDepartmentSalaries();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(json).toEqual({
      success: true,
      data: [{ department: "Engineering", headcount: 4, avgSalary: 600 }]
    });
  });

  it("passes country filter to job title salary stats route", async () => {
    mockedGetJobTitleSalaryStats.mockResolvedValue([
      { jobTitle: "Engineer", avgSalary: 900 }
    ]);

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams({ country: "India" })
      }
    } as never;

    const response = await getJobSalaries(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(mockedGetJobTitleSalaryStats).toHaveBeenCalledWith("India");
    expect(json).toEqual({
      success: true,
      data: [{ jobTitle: "Engineer", avgSalary: 900 }]
    });
  });
});
