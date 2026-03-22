"use client";

import { useEffect, useState } from "react";

/**
 * Utility to check if we are in a mobile/small screen view.
 * Useful for conditional rendering of complex UI parts.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}
