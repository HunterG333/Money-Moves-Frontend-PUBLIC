import { ENDPOINTS, ENV } from "../constants/index.ts";
import { getCookie } from "../utils/index.ts";

export const backendUrl = ENV.BACKEND_URL;

// ========================================
// TYPES
// ========================================
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";


// ========================================
// GENERIC REQUEST HELPERS
// ========================================


/**
 * Makes a fetch request and returns JSON data.
 * Throws if response is not JSON.
 */
export async function requestJson<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: any
): Promise<T> {
  const res = await makeAuthenticatedRequest(endpoint, method, body);
  const contentType = res.headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) {
    const text = await safeReadText(res);
    throw new Error(`Expected JSON, got: ${contentType}. Response: ${text}`);
  }
  // Handle 204 No Content (return empty object cast)
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

/**
 * Makes a fetch request and returns raw text.
 */
export async function requestText(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: any
): Promise<string> {
  const res = await makeAuthenticatedRequest(endpoint, method, body);
  return res.text();
}

/**
 * Makes an authenticated fetch request with CSRF retry.
 * Returns the raw Response.
 */
export async function makeAuthenticatedRequest(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: any
): Promise<Response> {
  return coreRequest(endpoint, method, body);
}


// ========================================
// INTERNAL CORE REQUEST LOGIC
// ========================================

async function coreRequest(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: any,
  didRetry = false
): Promise<Response> {
  const url = `${backendUrl}${endpoint}`;
  const res = await fetch(url, {
    ...buildConfig(method, body, true),
    redirect: "manual",
  });

  // Detect expired session redirect
  if (res.type === "opaqueredirect" || res.status === 302) {
    window.dispatchEvent(new Event("sessionExpired"));
    throw new Error("Session expired");
  }

  if (!res.ok) {
    // Retry once on CSRF failure
    if (!didRetry && (res.status === 401 || res.status === 403)) {
      try {
        await fetchCsrfToken();
      } catch {
        // ignore
      }
      const retryRes = await fetch(url, {
        ...buildConfig(method, body, true),
        redirect: "manual",
      });
      if (retryRes.ok) return retryRes;

      if (retryRes.type === "opaqueredirect" || retryRes.status === 302) {
        console.warn("🔔 Dispatching sessionExpired event");
        window.dispatchEvent(new Event("sessionExpired"));
        throw new Error("Session expired");
      }
    }

    const msg = await safeReadText(res);
    const detail = msg ? ` - ${msg}` : "";
    throw new Error(`Request failed: ${res.status}${detail}`);
  }

  return res;
}

// ========================================
// CONFIG BUILDERS
// ========================================

function buildConfig(
  method: HttpMethod,
  body?: any,
  includeXsrfHeader = true
): RequestInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (includeXsrfHeader) {
    const csrfToken = getCookie("XSRF-TOKEN");
    if (csrfToken) headers["X-XSRF-TOKEN"] = csrfToken;
  }

  const config: RequestInit = {
    method,
    credentials: "include",
    headers,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }
  return config;
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

// ========================================
// CSRF / SESSION HELPERS
// ========================================

/**
 * Fetches/refreshes the CSRF token cookie without requiring an existing token.
 * Avoids using makeAuthenticatedRequest to prevent recursive retry loops.
 */
export async function fetchCsrfToken(): Promise<void> {
  try {
    await fetch(`${backendUrl}${ENDPOINTS.MFA.CSRF}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching CSRF token", err);
  }
}
