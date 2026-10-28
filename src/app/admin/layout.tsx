import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import styles from "./page.module.css";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page} lang="th">
      <AdminSidebar />
      <main className={styles.content}>
        <div className={styles.panel}>{children}</div>
      </main>
    </div>
  );
}
