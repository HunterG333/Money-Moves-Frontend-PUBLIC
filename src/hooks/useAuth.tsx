import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { getAuthState, handleLogin, handleLogout } from '../api/api';
import { AuthState } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';


interface AuthContextType {
  authState: AuthState | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isFullyAuthenticated: boolean;
  sessionExpired: boolean;
  login: () => Promise<void>;
  logout: (onComplete?: () => void) => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const AUTH_REFRESH_INTERVAL_MS = 2 * 60 * 1000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [sessionExpired, setSessionExpired] = useState(false);

  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const authStateRef = useRef(authState);

  useEffect(() => {
    authStateRef.current = authState;
  }, [authState]);

  const refreshAuthState = useCallback(async () => {
    try {
      const authDto = await getAuthState();

      if (
        authStateRef.current !== null &&
        authStateRef.current !== AuthState.LOGGED_OUT &&
        authDto.state === AuthState.LOGGED_OUT
      ) {
        window.dispatchEvent(new CustomEvent("sessionExpired"));
      }

      setAuthState(authDto.state);
    } catch (error) {
      // If the backend is unreachable or returns 401/403, treat it as session expired
      if (authStateRef.current !== AuthState.LOGGED_OUT) {
        window.dispatchEvent(new CustomEvent("sessionExpired"));
      }

      setAuthState(AuthState.LOGGED_OUT);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async () => {
    setSessionExpired(false);
    await handleLogin();
  }, []);

  const logout = useCallback(async (onComplete?: () => void) => {
  try {
    await handleLogout();
  } finally {
    setAuthState(AuthState.LOGGED_OUT);
    onComplete?.();
  }
}, []);

  // Initial auth state check
  useEffect(() => {
    refreshAuthState();
  }, [refreshAuthState]);

  // Periodic auth state refresh (every 2 minutes)
  useEffect(() => {
    if (location.pathname === "/session-expired") return;

    const interval = setInterval(refreshAuthState, AUTH_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshAuthState, location.pathname]);

  const handleSessionExpired = useCallback(() => {
    if (isLoading || sessionExpired) return; // <-- prevent duplicate execution

    setSessionExpired(true);

    navigate("/session-expired", { replace: true });
  }, [isLoading, navigate, sessionExpired]);


  useEffect(() => {
    window.addEventListener("sessionExpired", handleSessionExpired);
    return () => window.removeEventListener("sessionExpired", handleSessionExpired);
  }, [handleSessionExpired]);



  const value: AuthContextType = {
    authState,
    isLoading,
    isLoggedIn: authState === AuthState.LOGGED_IN || authState === AuthState.FULLY_AUTHENTICATED,
    isFullyAuthenticated: authState === AuthState.FULLY_AUTHENTICATED,
    sessionExpired,
    login,
    logout,
    refreshAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
