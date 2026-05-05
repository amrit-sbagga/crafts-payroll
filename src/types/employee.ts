export type Employee = {
  id: string;
  fullName: string;
  jobTitle: string;
  country: string;
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
