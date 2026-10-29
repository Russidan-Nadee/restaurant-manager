"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import EmployeeEditor from "./EmployeeEditor";
import { DEMO_EMPLOYEES } from "./demo";
import type { Employee, EmployeeDraft } from "./types";
import admin from "../page.module.css";
import styles from "./employees.module.css";

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>(() => DEMO_EMPLOYEES.map(employee => ({ ...employee })));
  const [editor, setEditor] = useState<Employee | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const nextId = useRef(1);
  const editing = editor !== undefined;
  const ordered = [...employees].sort((left, right) => Number(right.is_active) - Number(left.is_active));

  function saveEmployee(draft: EmployeeDraft) {
    const id = editor?.id;
    const addedId = id ?? "demo-added-" + nextId.current++;
    setEmployees(current => id
      ? current.map(employee => employee.id === id ? { ...employee, ...draft } : employee)
      : [...current, { ...draft, id: addedId }]);
    setMessage(id ? "แก้ไขข้อมูลตัวอย่างแล้ว" : "เพิ่มข้อมูลตัวอย่างแล้ว");
    setEditor(undefined);
  }
  function changeStatus(id: string, active: boolean) {
    setEmployees(current => current.map(employee => employee.id === id ? { ...employee, is_active: active } : employee));
    setMessage("เปลี่ยนสถานะตัวอย่างแล้ว");
  }

  return <section>
    <div className={admin.sectionHeading}>
      <div className={styles.heading}><h1>พนักงาน</h1><p>{employees.length} คน</p><span className={styles.demoBadge}>ข้อมูลตัวอย่าง</span></div>
      <button type="button" className={styles.primary} disabled={editing} onClick={() => setEditor(null)}><Plus size={18} strokeWidth={1.75} aria-hidden="true" />เพิ่มพนักงาน</button>
    </div>
    <p className={styles.demoNote}>ทดลองเพิ่มและแก้ไขได้ ข้อมูลจะกลับเป็นค่าเริ่มต้นเมื่อรีเฟรชหน้า</p>
    <p className={styles.demoMessage} role="status">{message}</p>
    {editing && <EmployeeEditor key={editor?.id ?? "new"} employee={editor ?? null} onSave={saveEmployee} onClose={() => setEditor(undefined)} />}
    <div className={admin.tableScroll}>
      <table className={[admin.table, admin.responsiveTable].join(" ")}>
        <thead><tr><th scope="col">ชื่อพนักงาน</th><th scope="col">เบอร์โทร</th><th scope="col">ตำแหน่ง</th><th scope="col">สถานะทำงาน</th><th scope="col">จัดการ</th></tr></thead>
        <tbody>{ordered.map(employee => <tr key={employee.id}>
          <th scope="row" className={styles.employeeName}>{employee.name}</th>
          <td data-label="เบอร์โทร">{employee.phone ?? <span className={styles.muted}>—</span>}</td>
          <td data-label="ตำแหน่ง">{employee.job_title ?? <span className={styles.muted}>—</span>}</td>
          <td data-label="สถานะทำงาน"><label className={styles.availability}>
            <input type="checkbox" checked={employee.is_active} disabled={editing} onChange={event => changeStatus(employee.id, event.target.checked)} aria-label={"สถานะทำงานของ " + employee.name} />
            <span>{employee.is_active ? "ทำงานอยู่" : "หยุดทำงาน"}</span>
          </label></td>
          <td className={admin.mobileActions}><button type="button" className={styles.secondary} disabled={editing} onClick={() => setEditor(employee)} aria-label={"แก้ไขพนักงาน " + employee.name}>แก้ไข</button></td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
