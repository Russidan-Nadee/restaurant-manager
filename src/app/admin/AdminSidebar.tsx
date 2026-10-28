"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import RestaurantBrand from "@/components/RestaurantBrand";
import AdminNavigation from "./AdminNavigation";
import styles from "./page.module.css";

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  function closeSidebar() {
    if (open && sidebarRef.current?.contains(document.activeElement)) {
      toggleRef.current?.focus();
    }
    setOpen(false);
  }

  return (
    <>
      <div className={styles.mobileHeader}>
        <button ref={toggleRef} type="button" className={styles.sidebarToggle}
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={open} aria-controls="admin-sidebar"
          onClick={() => setOpen(!open)}>
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>
      {open && <button className={styles.backdrop} type="button" aria-label="ปิดเมนู" onClick={closeSidebar} />}
      <aside ref={sidebarRef} id="admin-sidebar" className={styles.sidebar} data-open={open} data-collapsed={collapsed}
        onKeyDown={(event) => { if (event.key === "Escape") closeSidebar(); }}>
        <div className={styles.sidebarHeader}>
          <div className={styles.identity}><RestaurantBrand showIcon={false} /></div>
          <button type="button" className={styles.collapseToggle}
            aria-label={collapsed ? "ขยายเมนูด้านข้าง" : "ยุบเมนูด้านข้าง"}
            title={collapsed ? "ขยายเมนูด้านข้าง" : "ยุบเมนูด้านข้าง"}
            aria-expanded={!collapsed} aria-controls="admin-sidebar-links"
            onClick={() => setCollapsed((value) => !value)}>
            {collapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
          </button>
        </div>
        <div id="admin-sidebar-links" className={styles.sidebarLinks}>
        <AdminNavigation onNavigate={closeSidebar} />
        <nav className={styles.viewLinks} aria-label="เปิดหน้าร้าน">
          <Link href="/order" title="หน้าลูกค้า" onClick={closeSidebar}><span className={styles.navLabel}>หน้าลูกค้า</span></Link>
          <Link href="/kitchen" title="หน้าครัว" onClick={closeSidebar}><span className={styles.navLabel}>หน้าครัว</span></Link>
          <Link href="/cashier" title="แคชเชียร์" onClick={closeSidebar}><span className={styles.navLabel}>แคชเชียร์</span></Link>
        </nav>
        </div>
      </aside>
    </>
  );
}
