// ========================================
// API ENDPOINTS
// ========================================

export const ENDPOINTS = {
  USER: {
    DATA: "/api/user",
  },
  ACCOUNTS: {
    GET: "/api/accounts",
    CREATE: "/api/accounts",
    UPDATE: "/api/accounts",
    DELETE: "/api/accounts",
  },
  NET_WORTH: {
    GRAPH: "/api/networth/graph-data",
  },
  AUTH: {
    IS_AUTHENTICATED: "/api/auth/is-authenticated",
    STATE: "/api/auth/state",
    LOGOUT: "/logout",
  },
  PLAID: {
    REFRESH_ACCOUNTS: "/api/plaid/refresh-accounts",
    CHECK_FORCE_REFRESH: "/api/plaid/check-force-refresh",
    CHECK_REFRESH_ACCOUNT: "/api/plaid/check-refresh-account",
    CREATE_LINK_TOKEN: "/api/plaid/create-link-token",
    EXCHANGE_PUBLIC_TOKEN: "/api/plaid/exchange-public-token",
    ITEMS: "/api/plaid/items",
  },
  MFA: {
    VERIFY: "/mfa/verify",
    RESEND: "/mfa/resend",
    CSRF: "/mfa/csrf-token",
  },
} as const;


// ========================================
// TIME PERIODS
// ========================================

export const TIME_PERIODS = {
  "5D": 5,
  "7D": 7,
  "30D": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "5Y": 1825,
  "ALL": 2000,
} as const;


// ========================================
// ENVIRONMENT VARIABLES
// ========================================

export const ENV = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || "https://localhost:8443",
  AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID,
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || "https://localhost:5173",
  ENABLE_FORCE_REFRESH: import.meta.env.VITE_ENABLE_FORCE_REFRESH !== "false",
} as const;
