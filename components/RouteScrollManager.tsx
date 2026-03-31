"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Keep page transitions predictable by always starting at the top.
 * This also disables browser back/forward scroll restoration.
 */
export function RouteScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { history } = window;
    if (!history || !("scrollRestoration" in history)) return;
    history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
