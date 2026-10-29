"use client";

import { placeOrder } from "@/lib/orders";
import MenuOrderView from "./MenuOrderView";
import type { CustomerMenuItem, DiningTable } from "./types";

export default function MenuOrder({ table, menu }: { table: DiningTable; menu: CustomerMenuItem[] }) {
  return <MenuOrderView table={table} menu={menu} onPlaceOrder={placeOrder} />;
}
