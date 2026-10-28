"use client";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function LiveRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible" && !isPending) startTransition(() => router.refresh());
    };
    const interval = window.setInterval(refresh, 5000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, isPending]);
  return null;
}
