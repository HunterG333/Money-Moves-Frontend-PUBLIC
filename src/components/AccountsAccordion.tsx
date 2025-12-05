import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, Card, Button, Badge } from "react-bootstrap";
import { Account, AccountType } from "../types";
import { useToast } from "./toast";

interface AccountsAccordionProps {
  investmentAccounts: Account[];
  assetAccounts: Account[];
  debtAccounts: Account[];
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const AccountsAccordion: React.FC<AccountsAccordionProps> = ({
  investmentAccounts,
  assetAccounts,
  debtAccounts,
  setRefresh,
}) => {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { showToast, showConfirm } = useToast();

  const navigate = useNavigate();

  //TODO: IMPLEMENT OR DELETE
  const handleDelete = (accountId: number) => {
    showConfirm(
      "Delete Account",
      "Are you sure you want to delete this account? This action cannot be undone.",
      async () => {
        setIsDeleting(accountId);
        try {
          // TODO: Call backend delete API here
          showToast("Account deleted successfully!", "success");
          setRefresh((prev) => !prev);
        } catch {
          showToast("An error occurred while deleting the account.", "error");
        } finally {
          setIsDeleting(null);
        }
      },
      { type: "danger", confirmText: "Delete", cancelText: "Cancel" }
    );
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.INVESTMENT_ACCOUNT:
        return "bi bi-graph-up text-success";
      case AccountType.ASSET_ACCOUNT:
        return "bi bi-piggy-bank text-primary";
      case AccountType.DEBT_ACCOUNT:
        return "bi bi-credit-card text-warning";
      default:
        return "bi bi-wallet text-secondary";
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const getTotalValue = (accounts: Account[]) =>
    accounts.reduce((sum, acc) => sum + acc.value, 0);

  const renderAccountList = (accounts: Account[]) => {
    if (accounts.length === 0) {
      return (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center text-muted py-4">
            <i className="bi bi-inbox display-4"></i>
            <p className="mt-2 mb-0">No accounts found</p>
            <small>Add your first account to get started</small>
          </Card.Body>
        </Card>
      );
    }

    return (
      <Accordion alwaysOpen>
        {accounts.map((account) => (
          <Accordion.Item
            key={account.id}
            eventKey={String(account.id)}
          >
            <Accordion.Header>
              <div className="d-flex align-items-center w-100">
                <i
                  className={`${getAccountTypeIcon(account.accountType)} me-3`}
                ></i>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    <span className="fw-semibold">{account.accountName}</span>
                    {account.plaidAccount && (
                      <Badge bg="info" className="ms-2">
                        <i className="bi bi-link-45deg me-1"></i> Plaid
                      </Badge>
                    )}
                  </div>
                  <small className="text-muted d-block">
                    {account.userGivenDisplayName !== account.accountName && account.userGivenDisplayName}
                  </small>
                </div>
                <div className="text-end">
                  <div className="fw-bold me-3">{formatCurrency(account.value)}</div>
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Account ID: {account.id}</small>
                  {account.accountName && (
                    <div>
                      <small className="text-muted">
                        Custom Name: {account.userGivenDisplayName}
                      </small>
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      const route = `/update-account-info?id=${account.id}`;
                      navigate(route);
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i> Manage
                  </Button>
                </div>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  };

const renderParentHeader = (
  label: string,
  total: number,
  badgeColor: string,
  badgeText: string,
  iconClass: string
) => (
  <div className="d-flex align-items-center w-100">
    <i className={`${iconClass} me-2`}></i>
    <span className="fw-semibold">{label}</span>
    <Badge bg={badgeColor} className="ms-2">
      {badgeText}
    </Badge>
    <div className="ms-auto fw-bold me-3">{formatCurrency(total)}</div>
  </div>
);


  return (
    <Accordion defaultActiveKey={[]}>
      <Accordion.Item eventKey="investment">
        <Accordion.Header>
          {renderParentHeader(
            "Investment Accounts",
            getTotalValue(investmentAccounts),
            "success",
            "INVESTMENT",
            "bi bi-graph-up text-success"
          )}
        </Accordion.Header>
        <Accordion.Body>{renderAccountList(investmentAccounts)}</Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="asset">
        <Accordion.Header>
          {renderParentHeader(
            "Asset Accounts",
            getTotalValue(assetAccounts),
            "primary",
            "ASSET",
            "bi bi-piggy-bank text-primary"
          )}
        </Accordion.Header>
        <Accordion.Body>{renderAccountList(assetAccounts)}</Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="debt">
        <Accordion.Header>
          {renderParentHeader(
            "Debt Accounts",
            getTotalValue(debtAccounts),
            "warning",
            "DEBT",
            "bi bi-credit-card text-warning"
          )}
        </Accordion.Header>
        <Accordion.Body>{renderAccountList(debtAccounts)}</Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default AccountsAccordion;
