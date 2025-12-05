import { AuthState } from "../types";


/**
 * Checks if a user meets the required authentication level
 * @param currentState - The user's current authentication state
 * @param requiredState - The minimum required authentication level
 * @returns boolean - Whether the user meets the requirement
 */
export function meetsAuthRequirement(
  currentState: AuthState | null,
  requiredState: AuthState
): boolean {
  if (currentState === null) return false;
  
  switch (requiredState) {
    case AuthState.LOGGED_IN:
      return currentState === AuthState.LOGGED_IN || currentState === AuthState.FULLY_AUTHENTICATED;
    case AuthState.FULLY_AUTHENTICATED:
      return currentState === AuthState.FULLY_AUTHENTICATED;
    case AuthState.LOGGED_OUT:
      return true; // Everyone can access public routes
    default:
      return false;
  }
}

