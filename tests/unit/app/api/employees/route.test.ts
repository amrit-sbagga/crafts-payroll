/** @jest-environment node */

import { GET, POST } from "@/app/api/employees/route";
import { createEmployee, listEmployees } from "@/modules/employee/employee.service";
import { validateEmployeeInput } from "@/modules/employee/domain/validateEmployeeInput";

jest.mock("@/modules/employee/employee.service", () => ({
  createEmployee: jest.fn(),
  listEmployees: jest.fn()
}));

jest.mock("@/modules/employee/domain/validateEmployeeInput", () => ({
  validateEmployeeInput: jest.fn()
}));

const mockedListEmployees = jest.mocked(listEmployees);
const mockedCreateEmployee = jest.mocked(createEmployee);
const mockedValidateEmployeeInput = jest.mocked(validateEmployeeInput);

describe("/api/employees route handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns employee list with parsed query params", async () => {
    mockedListEmployees.mockResolvedValue({
      data: [{ id: "1", fullName: "Ada", salary: 1000 }],
      meta: { total: 1, page: 2, limit: 5, totalPages: 1 }
    } as never);

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams({
          page: "2",
          limit: "5",
          search: "Ada",
          country: "India",
          jobTitle: "Engineer"
        })
      }
    } as never;

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "private, no-store, max-age=0"
    );
    expect(mockedListEmployees).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      search: "Ada",
      country: "India",
      jobTitle: "Engineer",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
    expect(json).toEqual({
      data: [{ id: "1", fullName: "Ada", salary: 1000 }],
      meta: { total: 1, page: 2, limit: 5, totalPages: 1 }
    });
  });

  it("POST returns 422 when validation fails", async () => {
    mockedValidateEmployeeInput.mockReturnValue({
      ok: false,
      errors: { fullName: "required" }
    });

    const request = {
      json: async () => ({
        fullName: "",
        jobTitle: "Engineer",
        country: "India",
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
        salary: 1000
      })
    } as never;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(mockedCreateEmployee).not.toHaveBeenCalled();
    expect(json).toEqual({
      error: "Validation failed",
      fields: { fullName: "required" }
    });
  });

  it("POST creates employee when validation succeeds", async () => {
    mockedValidateEmployeeInput.mockReturnValue({ ok: true, errors: {} });
    mockedCreateEmployee.mockResolvedValue({
      id: "emp-1",
      fullName: "Ada Lovelace",
      jobTitle: "Engineer",
      country: "India",
      department: "Engineering",
      gender: "Female",
      joiningDate: "2024-01-01",
      avatarUrl: "https://example.com/avatar.png",
      salary: 1000
    } as never);

    const request = {
      json: async () => ({
        fullName: "Ada Lovelace",
        jobTitle: "Engineer",
        country: "India",
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
        avatarUrl: "https://example.com/avatar.png",
        salary: 1000
      })
    } as never;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(mockedCreateEmployee).toHaveBeenCalledWith({
      fullName: "Ada Lovelace",
      jobTitle: "Engineer",
      country: "India",
      department: "Engineering",
      gender: "Female",
      joiningDate: "2024-01-01",
      avatarUrl: "https://example.com/avatar.png",
      salary: 1000
    });
    expect(json).toEqual({
      data: {
        id: "emp-1",
        fullName: "Ada Lovelace",
        jobTitle: "Engineer",
        country: "India",
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
        avatarUrl: "https://example.com/avatar.png",
        salary: 1000
      }
    });
  });
});
