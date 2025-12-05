import { PlaidLinkOnSuccessMetadata, usePlaidLink } from "react-plaid-link";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { createLinkToken, exchangePublicToken, refreshAccounts } from "../api/api";

interface Props {
  onSuccess: () => void;
  onError?: (message: string) => void;
}

export function LinkPlaidAccountButton({ onSuccess, onError }: Props) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const isOAuthRedirect = new URLSearchParams(location.search).has("oauth_state_id");

  useEffect(() => {
    async function fetchToken() {
      setIsLoading(true);
      setError(null);
      try {
        const token = await createLinkToken();
        if (token) {
          setLinkToken(token);
        } else {
          setError("Failed to create link token. Please try again.");
          onError?.("Failed to create link token. Please try again.");
        }
      } catch {
        setError("Failed to connect to bank service. Please try again.");
        onError?.("Failed to connect to bank service. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchToken();
  }, [isOAuthRedirect, onError]);

  const { open, ready } = usePlaidLink(
    linkToken
      ? {
          token: linkToken,
          onSuccess: async (public_token: string, metadata: PlaidLinkOnSuccessMetadata ) => {
            setIsLoading(true);
            setError(null);
            try {
              const success = await exchangePublicToken(public_token, metadata.institution?.name);
              if (success) {
                await refreshAccounts();
                onSuccess();
              } else {
                setError("Failed to connect account. Please try again.");
                onError?.("Failed to connect account. Please try again.");
              }
            } catch {
              setError("Failed to connect account. Please try again.");
              onError?.("Failed to connect account. Please try again.");
            } finally {
              setIsLoading(false);
            }
          },
          onExit: (err) => {
            if (err) {
              setError("Connection was cancelled or failed. Please try again.");
              onError?.("Connection was cancelled or failed. Please try again.");
            }
          },
        }
      : { token: "", onSuccess: () => {}, onExit: () => {} }
  );

  useEffect(() => {
    if (ready && linkToken && isOAuthRedirect) {
      open();
    }
  }, [ready, linkToken, isOAuthRedirect, open]);

  return (
    <div className="w-100">
      <button
        onClick={() => {
          setError(null);
          open();
        }}
        disabled={!ready || isLoading }
        className="btn btn-success btn-lg w-100"
        style={{ minHeight: "60px" }}
      >
        { isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Connecting...
          </>
        ) : !ready ? (
          <>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Loading...
          </>
        ) : (
          <>
            <i className="bi bi-bank me-2"></i>
            Connect Your Bank Account
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-danger bg-opacity-10 border border-danger rounded">
          <small className="text-danger">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {error}
          </small>
        </div>
      )}
    </div>
  );
}
