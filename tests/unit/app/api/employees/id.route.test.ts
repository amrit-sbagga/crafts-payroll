/** @jest-environment node */

import { Prisma } from "@prisma/client";
import { DELETE, GET, PUT } from "@/app/api/employees/[id]/route";
import {
  deleteEmployee,
  getEmployeeById,
  updateEmployee
} from "@/modules/employee/employee.service";
import { validateEmployeeInput } from "@/modules/employee/domain/validateEmployeeInput";

jest.mock("@/modules/employee/employee.service", () => ({
  getEmployeeById: jest.fn(),
  updateEmployee: jest.fn(),
  deleteEmployee: jest.fn()
}));

jest.mock("@/modules/employee/domain/validateEmployeeInput", () => ({
  validateEmployeeInput: jest.fn()
}));

const mockedGetEmployeeById = jest.mocked(getEmployeeById);
const mockedUpdateEmployee = jest.mocked(updateEmployee);
const mockedDeleteEmployee = jest.mocked(deleteEmployee);
const mockedValidateEmployeeInput = jest.mocked(validateEmployeeInput);

describe("/api/employees/[id] route handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns 404 when employee does not exist", async () => {
    mockedGetEmployeeById.mockResolvedValue(null);

    const response = await GET({} as never, {
      params: Promise.resolve({ id: "missing" })
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Employee not found" });
  });

  it("PUT returns updated employee when validation succeeds", async () => {
    mockedValidateEmployeeInput.mockReturnValue({ ok: true, errors: {} });
    mockedUpdateEmployee.mockResolvedValue({
      id: "emp-1",
      fullName: "Ada",
      jobTitle: "Engineer",
      country: "India",
      department: "Engineering",
      salary: 1200
    } as never);

    const request = {
      json: async () => ({
        fullName: "Ada",
        jobTitle: "Engineer",
        country: "India",
        department: "Engineering",
        salary: 1200
      })
    } as never;

    const response = await PUT(request, {
      params: Promise.resolve({ id: "emp-1" })
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockedUpdateEmployee).toHaveBeenCalledWith("emp-1", {
      fullName: "Ada",
      jobTitle: "Engineer",
      country: "India",
      department: "Engineering",
      salary: 1200
    });
    expect(json).toEqual({
      data: {
        id: "emp-1",
        fullName: "Ada",
        jobTitle: "Engineer",
        country: "India",
        department: "Engineering",
        salary: 1200
      }
    });
  });

  it("DELETE returns 404 when service raises P2025", async () => {
    mockedDeleteEmployee.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("not found", {
        code: "P2025",
        clientVersion: "test"
      })
    );

    const response = await DELETE({} as never, {
      params: Promise.resolve({ id: "missing" })
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Employee not found" });
  });
});
