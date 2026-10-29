"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./page.module.css";

const sections = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/tables", label: "Table" },
  { href: "/admin/statuses", label: "Status" },
  { href: "/admin/employees", label: "Employee" },
];

export default function AdminNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className={styles.navigation} aria-label="ส่วนจัดการร้าน">
      {sections.map(({ href, label }) => (
        <Link key={href} href={href} title={label} onClick={onNavigate} className={styles.navLink} aria-current={pathname === href ? "page" : undefined}>
          <span className={styles.navLabel}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
