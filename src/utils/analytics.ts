/**
 * Google Analytics Utility
 * Handles GA4 initialization and event tracking
 */

declare global {
  interface Window {
    GA_MEASUREMENT_ID?: string;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Initialize Google Analytics
 * Loads GA script and initializes tracking
 */
export const initGA = (): void => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // Skip if no measurement ID or in development without explicit ID
  if (!measurementId || measurementId === "") {
    return;
  }

  // Skip if already initialized
  if (window.gtag) {
    return;
  }

  // Create script tag
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };

  // Configure GA
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false, // We'll manually track page views
  });
};

/**
 * Track page view
 * @param path - Page path to track
 */
export const trackPageView = (path: string): void => {
  if (!window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
};

/**
 * Track custom event
 * @param eventName - Name of the event
 * @param eventParams - Event parameters
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
): void => {
  if (!window.gtag) return;

  window.gtag("event", eventName, eventParams);
};

/**
 * Track user login
 * @param method - Login method (e.g., 'auth_gate', 'local')
 */
export const trackLogin = (method: string): void => {
  trackEvent("login", { method });
};

/**
 * Track user logout
 */
export const trackLogout = (): void => {
  trackEvent("logout");
};

/**
 * Track table view
 * @param tableId - Table ID
 * @param tableName - Table name
 */
export const trackTableView = (tableId: string, tableName?: string): void => {
  trackEvent("view_table", {
    table_id: tableId,
    table_name: tableName,
  });
};

/**
 * Track data export
 * @param exportType - Type of export (e.g., 'excel', 'csv', 'pdf')
 * @param tableId - Table ID being exported
 */
export const trackExport = (exportType: string, tableId?: string): void => {
  trackEvent("export_data", {
    export_type: exportType,
    table_id: tableId,
  });
};

/**
 * Track table submission
 * @param tableId - Table ID
 * @param errorMessage - Table name
 */
export const trackTableSubmit = (tableId: string, tableName?: string): void => {
  trackEvent("table_submit", {
    table_id: tableId,
    table_name: tableName,
  });
};

/**
 * Track table revert
 * @param tableId - Table ID
 * @param tableName - Table name
 */
export const trackTableRevert = (tableId: string, tableName?: string): void => {
  trackEvent("table_revert", {
    table_id: tableId,
    table_name: tableName,
  });
};

/**
 * Track table finalize
 * @param tableId - Table ID
 * @param tableName - Table name
 */
export const trackTableFinalize = (
  tableId: string,
  tableName?: string
): void => {
  trackEvent("table_finalize", {
    table_id: tableId,
    table_name: tableName,
  });
};

/**
 * Track error
 * @param errorMessage - Error message
 * @param errorContext - Context where error occurred
 */
export const trackError = (
  errorMessage: string,
  errorContext?: string
): void => {
  trackEvent("error", {
    error_message: errorMessage,
    error_context: errorContext,
  });
};

/**
 * Set user ID for tracking
 * @param userId - User ID
 */
export const setUserId = (userId: string): void => {
  if (!window.gtag) return;

  try {
    window.gtag("config", import.meta.env.VITE_GA_MEASUREMENT_ID, {
      user_id: userId,
    });
  } catch (error) {
    console.error("GA: Set user ID failed", error);
  }
};

/**
 * Set user properties
 * @param properties - User properties
 */
export const setUserProperties = (
  properties: Record<string, unknown>
): void => {
  if (!window.gtag) return;

  try {
    window.gtag("set", "user_properties", properties);
  } catch (error) {
    console.error("GA: Set user properties failed", error);
  }
};
