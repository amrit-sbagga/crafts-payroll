/** @jest-environment node */

import { POST } from "@/app/api/admin/seed/route";
import { seedEmployees } from "@/modules/employee/seedEmployees";

jest.mock("@/modules/employee/seedEmployees", () => ({
  seedEmployees: jest.fn()
}));

const mockedSeedEmployees = jest.mocked(seedEmployees);

function request(body: unknown, token = "secret") {
  return {
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === "authorization") return `Bearer ${token}`;
        return null;
      }
    },
    json: async () => body
  } as never;
}

describe("/api/admin/seed route", () => {
  const originalSeedToken = process.env.SEED_API_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SEED_API_TOKEN = "secret";
    mockedSeedEmployees.mockResolvedValue({ inserted: 50, cleaned: false });
  });

  afterAll(() => {
    process.env.SEED_API_TOKEN = originalSeedToken;
  });

  it("passes documented boolean clean values through", async () => {
    mockedSeedEmployees.mockResolvedValue({ inserted: 50, cleaned: true });

    const response = await POST(request({ count: 50, clean: true }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockedSeedEmployees).toHaveBeenCalledWith({ count: 50, clean: true });
    expect(json).toEqual({
      message: "Seed completed",
      data: { inserted: 50, cleaned: true }
    });
  });

  it("rejects string clean flags instead of treating \"false\" as destructive cleanup", async () => {
    const response = await POST(request({ count: 50, clean: "false" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "clean must be a boolean" });
    expect(mockedSeedEmployees).not.toHaveBeenCalled();
  });

  it("defaults omitted clean to false", async () => {
    const response = await POST(request({ count: 50 }));

    expect(response.status).toBe(200);
    expect(mockedSeedEmployees).toHaveBeenCalledWith({ count: 50, clean: false });
  });

  it("rejects invalid seed tokens", async () => {
    const response = await POST(request({ count: 50 }, "wrong"));

    expect(response.status).toBe(401);
    expect(mockedSeedEmployees).not.toHaveBeenCalled();
  });
});
