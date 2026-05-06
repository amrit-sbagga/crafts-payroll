export type EmployeeInput = {
  fullName: string;
  jobTitle: string;
  country: string;
  department: string;
  gender: string;
  joiningDate: string;
  avatarUrl?: string;
  salary: number;
};

type EmployeeInputErrors = Partial<
  Record<keyof EmployeeInput, "required" | "must_be_positive_number" | "invalid_date">
>;

export function validateEmployeeInput(
  input: EmployeeInput
): { ok: true; errors: {} } | { ok: false; errors: EmployeeInputErrors } {
  const errors: EmployeeInputErrors = {};

  if (input.fullName.trim().length === 0) errors.fullName = "required";
  if (input.jobTitle.trim().length === 0) errors.jobTitle = "required";
  if (input.country.trim().length === 0) errors.country = "required";
  if (input.department.trim().length === 0) errors.department = "required";
  if (input.gender.trim().length === 0) errors.gender = "required";
  if (input.joiningDate.trim().length === 0) {
    errors.joiningDate = "required";
  } else if (Number.isNaN(new Date(input.joiningDate).getTime())) {
    errors.joiningDate = "invalid_date";
  }

  const salaryOk = Number.isFinite(input.salary) && input.salary > 0;
  if (!salaryOk) errors.salary = "must_be_positive_number";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, errors: {} };
}

