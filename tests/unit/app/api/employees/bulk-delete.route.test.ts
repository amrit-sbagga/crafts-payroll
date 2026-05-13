/** @jest-environment node */

import { POST } from "@/app/api/employees/bulk-delete/route";
import { deleteEmployeesByIds } from "@/modules/employee/employee.service";

jest.mock("@/modules/employee/employee.service", () => ({
  deleteEmployeesByIds: jest.fn()
}));

const mockedDeleteEmployeesByIds = jest.mocked(deleteEmployeesByIds);

describe("/api/employees/bulk-delete route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when ids is not an array", async () => {
    const request = { json: async () => ({ ids: "nope" }) } as never;
    const response = await POST(request);
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "Expected ids array" });
    expect(mockedDeleteEmployeesByIds).not.toHaveBeenCalled();
  });

  it("returns 400 when ids array is empty after normalisation", async () => {
    const request = { json: async () => ({ ids: ["", "  "] }) } as never;
    const response = await POST(request);
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "No ids provided" });
    expect(mockedDeleteEmployeesByIds).not.toHaveBeenCalled();
  });

  it("returns deleted count on success", async () => {
    mockedDeleteEmployeesByIds.mockResolvedValue({ deleted: 2 });
    const request = { json: async () => ({ ids: ["a", "b"] }) } as never;
    const response = await POST(request);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json).toEqual({ data: { deleted: 2 } });
    expect(mockedDeleteEmployeesByIds).toHaveBeenCalledWith(["a", "b"]);
  });

  it("returns 400 when service rejects batch size", async () => {
    mockedDeleteEmployeesByIds.mockRejectedValue(new Error("Cannot delete more than 100 employees at once"));
    const request = { json: async () => ({ ids: ["x"] }) } as never;
    const response = await POST(request);
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error).toContain("Cannot delete more than");
  });
});
