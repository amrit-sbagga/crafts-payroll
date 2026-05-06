import {
  getCountrySalaryStats,
  getJobTitleSalaryStats,
  getGlobalSalarySummary,
  getDepartmentSalaryStats
} from "@/modules/employee/employeeAnalytics.service";

// Replace the real Prisma client with a mock so tests need no database.
jest.mock("@/lib/prisma", () => ({
  prisma: {
    employee: {
      groupBy: jest.fn(),
      aggregate: jest.fn()
    }
  }
}));

// Typed references to the mock functions for convenient setup in each test.
import { prisma } from "@/lib/prisma";
const mockGroupBy = jest.mocked(prisma.employee.groupBy);
const mockAggregate = jest.mocked(prisma.employee.aggregate);

// ---------------------------------------------------------------------------
// getCountrySalaryStats
// ---------------------------------------------------------------------------

describe("getCountrySalaryStats", () => {
  it("returns min, max and avg salary correctly grouped by country", async () => {
    mockGroupBy.mockResolvedValue([
      {
        country: "Germany",
        _min: { salary: 50000 },
        _max: { salary: 120000 },
        _avg: { salary: 85000 }
      },
      {
        country: "India",
        _min: { salary: 500000 },
        _max: { salary: 2500000 },
        _avg: { salary: 1200000 }
      }
    ] as never);

    const result = await getCountrySalaryStats();

    expect(result).toEqual([
      { country: "Germany", minSalary: 50000, maxSalary: 120000, avgSalary: 85000 },
      { country: "India", minSalary: 500000, maxSalary: 2500000, avgSalary: 1200000 }
    ]);
  });

  it("returns an empty array when there are no employees", async () => {
    mockGroupBy.mockResolvedValue([] as never);

    const result = await getCountrySalaryStats();

    expect(result).toEqual([]);
  });

  it("defaults null aggregate values to 0", async () => {
    mockGroupBy.mockResolvedValue([
      {
        country: "USA",
        _min: { salary: null },
        _max: { salary: null },
        _avg: { salary: null }
      }
    ] as never);

    const result = await getCountrySalaryStats();

    expect(result).toEqual([
      { country: "USA", minSalary: 0, maxSalary: 0, avgSalary: 0 }
    ]);
  });
});

// ---------------------------------------------------------------------------
// getJobTitleSalaryStats
// ---------------------------------------------------------------------------

describe("getJobTitleSalaryStats", () => {
  it("returns avg salary per job title when no country filter is given", async () => {
    mockGroupBy.mockResolvedValue([
      { jobTitle: "Designer", _avg: { salary: 70000 } },
      { jobTitle: "Software Engineer", _avg: { salary: 95000 } }
    ] as never);

    const result = await getJobTitleSalaryStats();

    expect(result).toEqual([
      { jobTitle: "Designer", avgSalary: 70000 },
      { jobTitle: "Software Engineer", avgSalary: 95000 }
    ]);
  });

  it("passes the country filter through to Prisma when provided", async () => {
    mockGroupBy.mockResolvedValue([
      { jobTitle: "Manager", _avg: { salary: 1800000 } }
    ] as never);

    const result = await getJobTitleSalaryStats("India");

    expect(result).toEqual([{ jobTitle: "Manager", avgSalary: 1800000 }]);

    // Confirm Prisma received the where clause
    expect(mockGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { country: "India" } })
    );
  });

  it("passes no where clause when country is undefined", async () => {
    mockGroupBy.mockResolvedValue([] as never);

    await getJobTitleSalaryStats();

    expect(mockGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    );
  });

  it("defaults null avg to 0", async () => {
    mockGroupBy.mockResolvedValue([
      { jobTitle: "HR", _avg: { salary: null } }
    ] as never);

    const result = await getJobTitleSalaryStats("Germany");

    expect(result).toEqual([{ jobTitle: "HR", avgSalary: 0 }]);
  });
});

// ---------------------------------------------------------------------------
// getGlobalSalarySummary
// ---------------------------------------------------------------------------

describe("getGlobalSalarySummary", () => {
  it("returns correct overall min, max and avg salary", async () => {
    mockAggregate.mockResolvedValue({
      _min: { salary: 40000 },
      _max: { salary: 2500000 },
      _avg: { salary: 820000 },
      _count: { salary: 10000 },
      _sum: { salary: 8200000000 }
    } as never);

    const result = await getGlobalSalarySummary();

    expect(result).toEqual({
      minSalary: 40000,
      maxSalary: 2500000,
      avgSalary: 820000
    });
  });

  it("defaults null aggregate values to 0 when table is empty", async () => {
    mockAggregate.mockResolvedValue({
      _min: { salary: null },
      _max: { salary: null },
      _avg: { salary: null },
      _count: { salary: 0 },
      _sum: { salary: null }
    } as never);

    const result = await getGlobalSalarySummary();

    expect(result).toEqual({
      minSalary: 0,
      maxSalary: 0,
      avgSalary: 0
    });
  });
});

// ---------------------------------------------------------------------------
// getDepartmentSalaryStats
// ---------------------------------------------------------------------------

describe("getDepartmentSalaryStats", () => {
  it("returns headcount and avg salary grouped by department", async () => {
    mockGroupBy.mockResolvedValue([
      {
        department: "Engineering",
        _count: { _all: 12 },
        _avg: { salary: 120000 }
      },
      {
        department: "HR",
        _count: { _all: 4 },
        _avg: { salary: 70000 }
      }
    ] as never);

    const result = await getDepartmentSalaryStats();

    expect(result).toEqual([
      { department: "Engineering", headcount: 12, avgSalary: 120000 },
      { department: "HR", headcount: 4, avgSalary: 70000 }
    ]);
  });

  it("defaults null average to 0", async () => {
    mockGroupBy.mockResolvedValue([
      {
        department: "Marketing",
        _count: { _all: 2 },
        _avg: { salary: null }
      }
    ] as never);

    const result = await getDepartmentSalaryStats();

    expect(result).toEqual([
      { department: "Marketing", headcount: 2, avgSalary: 0 }
    ]);
  });
});
