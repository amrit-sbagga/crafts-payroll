/** @jest-environment node */

import {
  buildEmployeeRecord,
  COUNTRIES,
  DEPARTMENTS,
  JOB_TITLES,
  SALARY_RANGES,
  pick,
  randInt
} from "../../../prisma/seed";

describe("seed helpers", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("pick returns first item for random=0 deterministically", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    expect(pick(["a", "b", "c"] as const)).toBe("a");
  });

  it("randInt includes bounds deterministically", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    expect(randInt(5, 10)).toBe(5);

    jest.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(randInt(5, 10)).toBe(10);
  });

  it("buildEmployeeRecord produces valid schema-compatible fields", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);

    const employee = buildEmployeeRecord(["Ada"], ["Lovelace"]);

    expect(employee.fullName).toBe("Ada Lovelace");
    expect(JOB_TITLES).toContain(employee.jobTitle);
    expect(COUNTRIES).toContain(employee.country);
    expect(DEPARTMENTS).toContain(employee.department);

    const [minSalary, maxSalary] = SALARY_RANGES[employee.country];
    expect(employee.salary).toBeGreaterThanOrEqual(minSalary);
    expect(employee.salary).toBeLessThanOrEqual(maxSalary);
  });
});
