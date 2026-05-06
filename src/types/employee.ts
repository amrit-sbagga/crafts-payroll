export type Department =
  | "Engineering"
  | "HR"
  | "Finance"
  | "Sales"
  | "Operations"
  | "Marketing";

export type Employee = {
  id: string;
  fullName: string;
  jobTitle: string;
  country: string;
  department: Department;
  salary: number;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
