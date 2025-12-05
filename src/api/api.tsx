import { AccountDataDTO, AccountType, AuthState, AuthStateDTO, NetWorthDTO, PlaidItem, UserDataDTO } from "../types/index.ts";
import { ENDPOINTS, ENV } from "../constants/index.ts";
import { makeAuthenticatedRequest, requestJson, requestText } from "./client.ts";

const backendUrl = ENV.BACKEND_URL;

// ========================================
// ACCOUNT MANAGEMENT FUNCTIONS
// ========================================

/**
 * Fetches all account data from the backend
 * @returns Promise<AccountDataDTO> - Object containing investment, asset, and debt accounts
 */
export async function getAccountData(getHidden = false) {
  try {
    const url = `${ENDPOINTS.ACCOUNTS.GET}?getHidden=${getHidden}`;
    return await requestJson<AccountDataDTO>(url);
  } catch (error) {
    console.error("Error fetching account data:", error);
    throw error;
  }
}

/**
 * Creates a new account in the system
 * @param account - The account data
 * @returns Promise<Response> - The raw fetch Response
 */
export async function createAccount(account: {
  name: string;
  value: number;
  accountType: AccountType;
  userGivenName?: string;
}): Promise<Response> {
  return makeAuthenticatedRequest(ENDPOINTS.ACCOUNTS.CREATE, "POST", account);
}



export async function updateAccount(
  id: number,
  data: {
    accountName: string;
    userGivenDisplayName?: string;
    value: number;
    accountType?: AccountType;
    hidden: boolean
  }
): Promise<{ success: boolean; message?: string }> {
  try {
    const message = await requestText(ENDPOINTS.ACCOUNTS.UPDATE, "PUT", {
      id,
      ...data,
    });
    return { success: true, message };
  } catch (error: any) {
    console.error("Error updating account:", error);

    if (
      typeof error?.message === "string" &&
      error.message.includes(
        "Cannot update the value of a Plaid-linked account"
      )
    ) {
      return {
        success: false,
        message:
          "Cannot update the value of a Plaid-linked account. Values are managed automatically by Plaid.",
      };
    }

    return {
      success: false,
      message: error?.message || "Failed to update account. Please try again.",
    };
  }
}

export async function deleteAccount(id: number) {
  try {
    return await requestText(ENDPOINTS.ACCOUNTS.DELETE, "DELETE", { id });
  } catch (error) {
    console.error("Error deleting account:", error);
    return null;
  }
}

// =======================================
// USER DATA FUNCTIONS
// =======================================

export async function getUserData(): Promise<UserDataDTO>{
  try {
    const data = await requestJson<UserDataDTO>(ENDPOINTS.USER.DATA);
    return(data);
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function updateUserData(data: UserDataDTO): Promise<void> {
  try {
    await requestText(ENDPOINTS.USER.DATA, "PUT", data);
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}


// ========================================
// NET WORTH & ANALYTICS FUNCTIONS
// ========================================

export async function getNetWorthData(
  itemsToRetrieve: number = 31
): Promise<{
  labels: string[];
  dataset: number[];
}> {
  try {
    const data = await requestJson<NetWorthDTO[]>(
      `${ENDPOINTS.NET_WORTH.GRAPH}?itemsToRetrieve=${itemsToRetrieve}`
    );
    const labels = data.map((item) => item.date);
    const dataset = data.map((item) => item.netWorth);
    return { labels, dataset };
  } catch (error) {
    console.error("Error fetching net worth data:", error);
    throw error;
  }
}

// ========================================
// AUTHENTICATION & SESSION FUNCTIONS
// ========================================


/**
 * Gets the current authentication state from the backend
 * This is the preferred method to check authentication status
 */
export async function getAuthState(): Promise<AuthStateDTO> {
  try {
    return await requestJson<AuthStateDTO>(ENDPOINTS.AUTH.STATE);
  } catch (error) {
    console.error("Error getting auth state:", error);
    return { state: AuthState.LOGGED_OUT };
  }
}

export async function handleLogin() {
  const loginUrl = `${backendUrl}/oauth2/authorization/auth0`;
  window.location.href = loginUrl;
}

export async function handleLogout(onLogoutComplete?: () => void) {
  try {
    // Backend logout first
    await logoutFromBackend();

    // Then redirect to Auth0
    redirectToAuth0Logout();

    // Callback
    if (onLogoutComplete) {
      onLogoutComplete();
    }
  } catch (error) {
    console.error("Logout failed:", error);
    // Still redirect to Auth0 even if backend fails
    redirectToAuth0Logout();
  }
}

async function logoutFromBackend() {
  try {
    await requestText("/logout", "POST");
  } catch (err) {
    console.warn("Backend logout failed, continuing anyway", err);
  }
}

function redirectToAuth0Logout() {
  const auth0Domain = ENV.AUTH0_DOMAIN;
  const clientId = ENV.AUTH0_CLIENT_ID;
  const returnTo = encodeURIComponent(
    import.meta.env.VITE_FRONTEND_URL || "https://localhost:5173"
  );

  window.location.href = `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`;
}

// ========================================
// PLAID INTEGRATION FUNCTIONS
// ========================================

export async function createLinkToken() {
  try {
    const data = await requestJson<{ link_token: string }>(
      ENDPOINTS.PLAID.CREATE_LINK_TOKEN,
      "POST"
    );
    return data.link_token;
  } catch (error) {
    console.error("Error creating link token:", error);
    return null;
  }
}

export async function exchangePublicToken(
  publicToken: string,
  institutionName?: string,
): Promise<boolean> {
  try {
    await requestText(ENDPOINTS.PLAID.EXCHANGE_PUBLIC_TOKEN, "POST", {
      public_token: publicToken,
      institution_name: institutionName,
    });
    return true;
  } catch (error) {
    console.error("Error exchanging token:", error);
    return false;
  }
}

/**
 * Fetch all Plaid-linked institutions and their accounts
 * @returns Promise<PlaidItem[]>
 */
export async function getPlaidItems() {
  try {
    return await requestJson<PlaidItem[]>(ENDPOINTS.PLAID.ITEMS);
  } catch (error) {
    console.error("Error fetching Plaid items:", error);
    throw error;
  }
}

/**
 * Unlink a specific Plaid item
 * @param itemId - Plaid item ID to unlink
 */
export async function unlinkPlaidItem(itemId: string) {
  try {
    const url = `${ENDPOINTS.PLAID.ITEMS}/${itemId}`;
    await requestJson<void>(url, "DELETE");
  } catch (error) {
    console.error("Error unlinking Plaid item:", error);
    throw error;
  }
}

// ========================================
// MFA (Multi-Factor Authentication) FUNCTIONS
// ========================================

export const verifyMfaCode = async (code: string) => {
  try {
    const res = await makeAuthenticatedRequest(ENDPOINTS.MFA.VERIFY, "POST", {
      code,
    });
  // Preserve original behavior of returning the Response when status === 200
    if (res.status === 200) return res;
    throw new Error("Invalid MFA code");
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

export const resendMfaCode = async () => {
  try {
    const res = await makeAuthenticatedRequest(ENDPOINTS.MFA.RESEND, "POST");
    if (res.status === 200) return res;
    throw new Error("Failed to resend MFA code");
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

export const cleanupMfaTokens = async () => {
  try {
    const res = await makeAuthenticatedRequest("/mfa/admin/cleanup", "POST");
    if (res.status === 200) return res;
    throw new Error("Failed to cleanup MFA tokens");
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

// ========================================
// ACCOUNT REFRESH & SYNC FUNCTIONS
// ========================================

export async function refreshAccounts() {
  try {
    await makeAuthenticatedRequest(ENDPOINTS.PLAID.REFRESH_ACCOUNTS, "POST");
  } catch (error) {
    console.error("Error refreshing accounts:", error);
    return null;
  }
}

export async function checkForceRefresh() {
  try {
    await makeAuthenticatedRequest(ENDPOINTS.PLAID.CHECK_FORCE_REFRESH, "POST");
  } catch (error) {
    console.error("Error refreshing accounts:", error);
    return null;
  }
}

export async function checkRefreshAccount() {
  try {
    const message = await requestText(ENDPOINTS.PLAID.CHECK_REFRESH_ACCOUNT, "POST");
    return message.includes("Refresh completed") ? "REFRESHED" : "SKIPPED";
  } catch (error) {
    console.error("Failed to check if accounts needed to refresh:", error);
    return null;
  }
}
