/** @jest-environment node */

import { POST } from "@/app/api/admin/seed/route";
import { seedEmployees } from "@/modules/employee/seedEmployees";

jest.mock("@/modules/employee/seedEmployees", () => ({
  seedEmployees: jest.fn()
}));

const mockedSeedEmployees = jest.mocked(seedEmployees);
const ORIGINAL_ENV = process.env;

function seedRequest(body: unknown, token = "secret") {
  return {
    headers: new Headers({ authorization: `Bearer ${token}` }),
    json: async () => body
  } as never;
}

describe("/api/admin/seed route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, SEED_API_TOKEN: "secret" };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("rejects string clean values before running seed", async () => {
    const response = await POST(seedRequest({ count: 50, clean: "false" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "clean must be a boolean" });
    expect(mockedSeedEmployees).not.toHaveBeenCalled();
  });

  it("rejects invalid count values before a clean seed can delete data", async () => {
    const response = await POST(seedRequest({ count: "many", clean: true }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      error: "count must be an integer between 1 and 10000"
    });
    expect(mockedSeedEmployees).not.toHaveBeenCalled();
  });

  it("runs seed with validated options", async () => {
    mockedSeedEmployees.mockResolvedValue({ inserted: 25, cleaned: true });

    const response = await POST(seedRequest({ count: 25, clean: true }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockedSeedEmployees).toHaveBeenCalledWith({ count: 25, clean: true });
    expect(json).toEqual({
      message: "Seed completed",
      data: { inserted: 25, cleaned: true }
    });
  });
});
