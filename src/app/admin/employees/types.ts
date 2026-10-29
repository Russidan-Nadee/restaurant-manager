export type Employee = {
  id: string;
  name: string;
  phone: string | null;
  job_title: string | null;
  is_active: boolean;
};

export type EmployeeDraft = Omit<Employee, "id">;
