"use client";

import MenuOrderView from "@/app/order/MenuOrderView";
import type { CustomerMenuItem, DiningTable } from "@/app/order/types";

const confirmPreview = () => Promise.resolve("preview-order");

export default function MenuOrderPreview({ table, menu }: { table: DiningTable; menu: CustomerMenuItem[] }) {
  return <MenuOrderView table={table} menu={menu} onPlaceOrder={confirmPreview} preview />;
}
