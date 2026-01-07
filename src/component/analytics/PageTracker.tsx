import { useEffect } from "react";
import { useLocation } from "react-router";
import { trackPageView } from "@/utils/analytics";

/**
 * PageTracker Component
 * Automatically tracks page views on route changes
 */
export function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}
