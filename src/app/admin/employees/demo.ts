import type { Employee } from "./types";

export const DEMO_EMPLOYEES: Employee[] = [
  { id: "demo-employee-001", name: "พนักงานตัวอย่าง 01", phone: "08X-XXX-0001", job_title: "ผู้จัดการร้าน", is_active: true },
  { id: "demo-employee-002", name: "พนักงานตัวอย่าง 02", phone: "08X-XXX-0002", job_title: "แคชเชียร์", is_active: true },
  { id: "demo-employee-003", name: "พนักงานตัวอย่าง 03", phone: "08X-XXX-0003", job_title: "พนักงานครัว", is_active: true },
  { id: "demo-employee-004", name: "พนักงานตัวอย่าง 04", phone: null, job_title: "พนักงานเสิร์ฟ", is_active: true },
  { id: "demo-employee-005", name: "พนักงานตัวอย่าง 05", phone: null, job_title: "พนักงานเสิร์ฟ", is_active: false },
];
