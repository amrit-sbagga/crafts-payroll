import { validateEmployeeInput } from "@/modules/employee/domain/validateEmployeeInput";

describe("Employee input validation", () => {
  it("fails when fullName is missing", () => {
    expect(
      validateEmployeeInput({
        fullName: "",
        jobTitle: "Engineer",
        country: "IN",
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
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
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
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
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
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
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
        salary: 0
      })
    ).toEqual({
      ok: false,
      errors: { salary: "must_be_positive_number" }
    });
  });

  it("returns ok: true when all fields are valid", () => {
    expect(
      validateEmployeeInput({
        fullName: "Ada Lovelace",
        jobTitle: "Engineer",
        country: "IN",
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
        salary: 100
      })
    ).toEqual({ ok: true, errors: {} });
  });

  it("treats whitespace-only string fields as missing", () => {
    expect(
      validateEmployeeInput({
        fullName: "   ",
        jobTitle: "   ",
        country: "   ",
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
        salary: 100
      })
    ).toEqual({
      ok: false,
      errors: {
        fullName: "required",
        jobTitle: "required",
        country: "required"
      }
    });
  });

  it("accepts a decimal salary greater than zero", () => {
    expect(
      validateEmployeeInput({
        fullName: "Ada Lovelace",
        jobTitle: "Engineer",
        country: "IN",
        department: "Engineering",
        gender: "Female",
        joiningDate: "2024-01-01",
        salary: 49.99
      })
    ).toEqual({ ok: true, errors: {} });
  });

  it("fails when joiningDate is missing", () => {
    expect(
      validateEmployeeInput({
        fullName: "Ada Lovelace",
        jobTitle: "Engineer",
        country: "IN",
        department: "Engineering",
        gender: "Female",
        joiningDate: "",
        salary: 100
      })
    ).toEqual({
      ok: false,
      errors: { joiningDate: "required" }
    });
  });

  it("fails when joiningDate is invalid", () => {
    expect(
      validateEmployeeInput({
        fullName: "Ada Lovelace",
        jobTitle: "Engineer",
        country: "IN",
        department: "Engineering",
        gender: "Female",
        joiningDate: "not-a-date",
        salary: 100
      })
    ).toEqual({
      ok: false,
      errors: { joiningDate: "invalid_date" }
    });
  });
});

