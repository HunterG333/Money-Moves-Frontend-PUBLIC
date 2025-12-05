import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Accordion,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";

import * as Api from "../../api/api";
import { fetchCsrfToken } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { Account, AccountType } from "../../types";
import { useToast } from "../../components/toast";

interface Props {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  investmentAccounts: Account[];
  assetAccounts: Account[];
  debtAccounts: Account[];
  hiddenAccounts: Account[];
}

function UpdateAccountPage({
  setRefresh,
  investmentAccounts,
  assetAccounts,
  debtAccounts,
  hiddenAccounts,
}: Props) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [searchParams] = useSearchParams();
  const redirectedAccountId = searchParams.get("id");

  const { showToast, showConfirm } = useToast();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Account>>({});
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (account: Account) => {
    setSelectedAccount(account);
    setFormData(account);
    setShowModal(true);
    setEditMode(false);
  };

  const handleCloseModal = () => {
    setSelectedAccount(null);
    setShowModal(false);
    setEditMode(false);
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (redirectedAccountId) {
      const allAccounts = [
        ...investmentAccounts,
        ...assetAccounts,
        ...debtAccounts,
      ];
      const found = allAccounts.find(
        (a) => String(a.id) === redirectedAccountId
      );
      if (found) {
        handleOpenModal(found);
      }
    }
  }, [redirectedAccountId, investmentAccounts, assetAccounts, debtAccounts]);

  useEffect(() => {
  if (editMode && selectedAccount) {
    setFormData({
      accountName: selectedAccount.accountName,
      userGivenDisplayName: selectedAccount.userGivenDisplayName,
      value: selectedAccount.value,
      accountType: selectedAccount.accountType,
      hidden: selectedAccount.hidden,
    });
  }
}, [editMode, selectedAccount]);


  const handleDeleteWithConfirm = (id: string) => {
    showConfirm(
      "Delete Account",
      "Are you sure you want to delete this account? This action cannot be undone.",
      () => handleDelete(id),
      {
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger",
      }
    );
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await Api.deleteAccount(Number(id));
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleUpdate = async () => {
    if (!selectedAccount) return;
    try {
      setLoading(true);
      
      await Api.updateAccount(Number(selectedAccount.id), {
        accountName: formData.accountName ?? selectedAccount.accountName,
        userGivenDisplayName:
          formData.userGivenDisplayName ?? selectedAccount.userGivenDisplayName ?? undefined,
        value: formData.value ?? selectedAccount.value,
        accountType: formData.accountType ?? selectedAccount.accountType,
        hidden: formData.hidden ?? selectedAccount.hidden,
      });
      setRefresh((prev) => !prev);
      handleCloseModal();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
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

  const getAccountTypeColor = (type: AccountType) => {
    switch (type) {
      case AccountType.INVESTMENT_ACCOUNT:
        return "success";
      case AccountType.ASSET_ACCOUNT:
        return "primary";
      case AccountType.DEBT_ACCOUNT:
        return "warning";
      default:
        return "secondary";
    }
  };

  const accountGroups = [
    {
      label: "Investments",
      type: AccountType.INVESTMENT_ACCOUNT,
      accounts: investmentAccounts,
    },
    {
      label: "Assets",
      type: AccountType.ASSET_ACCOUNT,
      accounts: assetAccounts,
    },
    {
      label: "Debts",
      type: AccountType.DEBT_ACCOUNT,
      accounts: debtAccounts,
    },
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">
        <i className="bi bi-pencil me-2"></i> Manage Your Accounts
      </h2>

      {investmentAccounts.length +
        assetAccounts.length +
        debtAccounts.length ===
      0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No accounts available.</p>
          <Button
            variant="primary"
            onClick={() => navigate("/account-management")}
          >
            <i className="bi bi-arrow-left me-2"></i> Back to Account Management
          </Button>
        </div>
      ) : (
        <Accordion alwaysOpen>
          {accountGroups.map(
            (group, idx) =>
              group.accounts.length > 0 && (
                <Accordion.Item eventKey={idx.toString()} key={group.label}>
                  <Accordion.Header>
                    <i className="bi bi-folder me-2"></i>
                    <span className="me-2">{group.label}</span>
                    <Badge bg={getAccountTypeColor(group.type)}>
                      {group.label}
                    </Badge>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Accordion alwaysOpen>
                      {group.accounts.map((account, i) => (
                        <Accordion.Item
                          eventKey={`${idx}-${i}`}
                          key={account.id}
                        >
                          <Accordion.Header>
                            <i
                              className={`${getAccountTypeIcon(
                                account.accountType
                              )} me-2`}
                              style={{ fontSize: "1.25rem" }}
                            ></i>
                            <span className="me-2">{account.userGivenDisplayName? account.userGivenDisplayName : account.accountName}</span>
                            {account.plaidAccount && (
                              <Badge bg="info" className="ms-2">
                                <i className="bi bi-link-45deg me-1"></i>
                                Plaid
                              </Badge>
                            )}
                          </Accordion.Header>
                          <Accordion.Body>
                            <Card className="shadow-sm">
                              <Card.Body>
                                <div className="mb-3 d-flex justify-content-between">
                                  <div>
                                    <small className="text-muted d-block">
                                      Account ID
                                    </small>
                                    <strong>{account.id}</strong>
                                  </div>
                                  <div>
                                    <small className="text-muted d-block">
                                      Current Value
                                    </small>
                                    <strong className="text-primary">
                                      {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                      }).format(account.value)}
                                    </strong>
                                  </div>
                                </div>

                                {account.accountName && (
                                  <div className="mb-3">
                                    <small className="text-muted d-block">
                                      Account Name
                                    </small>
                                    <strong>{account.accountName}</strong>
                                  </div>
                                )}

                                {account.userGivenDisplayName && (
                                  <div className="mb-3">
                                    <small className="text-muted d-block">
                                      Display Name
                                    </small>
                                    <strong>{account.userGivenDisplayName}</strong>
                                  </div>
                                )}

                                <div className="d-flex justify-content-end">
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => handleOpenModal(account)}
                                  >
                                    <i className="bi bi-pencil-square me-1"></i>{" "}
                                    Manage
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Accordion.Body>
                </Accordion.Item>
              )
          )}

          <div className="mt-4">
            <Accordion.Item eventKey="hidden">
              <Accordion.Header>
                <i className="bi bi-eye-slash me-2"></i>
                <span className="me-2">Hidden Accounts</span>
                <Badge bg="secondary">Hidden</Badge>
              </Accordion.Header>
              <Accordion.Body>
                {hiddenAccounts.length > 0 ? (
                  <Accordion alwaysOpen>
                    {hiddenAccounts.map((account) => (
                      <Accordion.Item eventKey={`hidden-${account.id}`} key={account.id}>
                        <Accordion.Header>
                          <i className={`${getAccountTypeIcon(account.accountType)} me-2`}></i>
                          <span className="me-2">{account.userGivenDisplayName || account.accountName}</span>
                          {account.plaidAccount && (
                            <Badge bg="info" className="ms-2">
                              <i className="bi bi-link-45deg me-1"></i>
                              Plaid
                            </Badge>
                          )}
                        </Accordion.Header>
                        <Accordion.Body>
                          <Card className="shadow-sm">
                            <Card.Body>
                              <div className="mb-3 d-flex justify-content-between">
                                <div>
                                  <small className="text-muted d-block">Account ID</small>
                                  <strong>{account.id}</strong>
                                </div>
                                <div>
                                  <small className="text-muted d-block">Value</small>
                                  <strong className="text-primary">
                                    {new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                    }).format(account.value)}
                                  </strong>
                                </div>
                              </div>
                              <div className="d-flex justify-content-end">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => handleOpenModal(account)}
                                >
                                  <i className="bi bi-pencil-square me-1"></i> Manage
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted text-center">No hidden accounts</p>
                )}
              </Accordion.Body>
            </Accordion.Item>
          </div>

        </Accordion>
      )}

      {/* Modal for account actions */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="w-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-0">
                  {editMode ? "Edit Account" : "Manage Account"}
                </h5>
                {selectedAccount && (
                  <small className="text-muted">
                    {selectedAccount.userGivenDisplayName || "Unnamed Account"}
                  </small>
                )}
              </div>
              {selectedAccount && (
                <Badge
                  bg={getAccountTypeColor(selectedAccount.accountType)}
                  pill
                >
                  {AccountType[selectedAccount.accountType]}
                </Badge>
              )}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAccount && !editMode && (
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={() => setEditMode(true)}>
                <i className="bi bi-pencil-square me-1"></i> Edit Account
              </Button>

              <OverlayTrigger
                placement="right"
                overlay={
                  selectedAccount.plaidAccount ? (
                    <Tooltip id="delete-disabled-tooltip">
                      Cannot delete Plaid accounts.<br />
                      Manage unlinking in <strong>Manage Plaid Connections</strong>,<br />
                      or hide it by clicking <strong>Edit Account</strong>.
                    </Tooltip>
                  ) : (
                    <></>
                  )
                }
              >
                <span className="d-grid">
                  <Button
                    variant="danger"
                    onClick={() =>
                      handleDeleteWithConfirm(String(selectedAccount.id))
                    }
                    disabled={loading || selectedAccount.plaidAccount}
                    style={
                      selectedAccount.plaidAccount ? { pointerEvents: "none" } : undefined
                    } // required for tooltip to work on disabled button
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <i className="bi bi-trash me-1"></i>{" "}
                        {selectedAccount.plaidAccount
                          ? "Cannot delete"
                          : "Delete Account"}
                      </>
                    )}
                  </Button>
                </span>
              </OverlayTrigger>
            </div>
          )}

          {selectedAccount && editMode && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Account Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.accountName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  disabled={selectedAccount.plaidAccount}
                />
                {selectedAccount.plaidAccount && (
                  <Form.Text className="text-muted">
                    Account name is managed automatically by Plaid.
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Display Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.userGivenDisplayName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, userGivenDisplayName: e.target.value })
                  }
                />
                <Form.Text className="text-muted">
                  This name is only visible to you.
                </Form.Text>
              </Form.Group>
              {!selectedAccount.plaidAccount && (
                <Form.Group className="mb-3">
                  <Form.Label>Value</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.value ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, value: Number(e.target.value) })
                    }
                  />
                </Form.Group>
              )}

              {!selectedAccount.plaidAccount && (
                <Form.Group className="mb-3">
                  <Form.Label>Account Type</Form.Label>
                  <Form.Select
                    value={formData.accountType || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountType: parseInt(e.target.value) as unknown as AccountType,
                      })
                    }
                  >
                    <option value={AccountType.INVESTMENT_ACCOUNT}>Investment</option>
                    <option value={AccountType.ASSET_ACCOUNT}>Asset</option>
                    <option value={AccountType.DEBT_ACCOUNT}>Debt</option>
                  </Form.Select>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Hidden Account (Account will be removed from tracking)</Form.Label>
                <Form.Check
                  type="switch"
                  id="hidden-switch"
                  checked={!!formData.hidden}
                  onChange={(e) =>
                    setFormData({ ...formData, hidden: e.target.checked })
                  }
                />
              </Form.Group>

              
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpdate} disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Save Changes"}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      
    </Container>

    
  );
}

export default UpdateAccountPage;
