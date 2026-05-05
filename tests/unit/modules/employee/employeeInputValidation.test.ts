import { validateEmployeeInput } from "@/modules/employee/domain/validateEmployeeInput";

describe("Employee input validation", () => {
  it("fails when fullName is missing", () => {
    expect(
      validateEmployeeInput({
        fullName: "",
        jobTitle: "Engineer",
        country: "IN",
        salary: 100
      })
    ).toEqual({
      ok: false,
      errors: { fullName: "required" }
    });
  });

  it("fails when jobTitle is missing", () => {
    expect(
      validateEmployeeInput({
        fullName: "Ada Lovelace",
        jobTitle: "",
        country: "IN",
        salary: 100
      })
    ).toEqual({
      ok: false,
      errors: { jobTitle: "required" }
    });
  });

  it("fails when country is missing", () => {
    expect(
      validateEmployeeInput({
        fullName: "Ada Lovelace",
        jobTitle: "Engineer",
        country: "",
        salary: 100
      })
    ).toEqual({
      ok: false,
      errors: { country: "required" }
    });
  });

  it("fails when salary is not a positive number", () => {
    expect(
      validateEmployeeInput({
        fullName: "Ada Lovelace",
        jobTitle: "Engineer",
        country: "IN",
        salary: 0
      })
    ).toEqual({
      ok: false,
      errors: { salary: "must_be_positive_number" }
    });
  });
});

