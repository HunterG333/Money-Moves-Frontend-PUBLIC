import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Container, Row, Col, Spinner, Badge } from "react-bootstrap";
import { PlaidItem } from "../../types";

import * as Api from "../../api/api";
import { useToast } from "../../components/toast";
import { useRefresh } from "../../components/RefreshContext";



export default function PlaidLinkManagementPage() {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useToast();
  const {setRefresh} = useRefresh();


  const [plaidItems, setPlaidItems] = useState<PlaidItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const data = await Api.getPlaidItems();
        setPlaidItems(data);
      } catch {
        setError("Failed to load Plaid-linked institutions.");
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const handleUnlink = async (itemId: string, institutionName: string) => {
  try {
    await Api.unlinkPlaidItem(itemId);
    setPlaidItems((prev) => prev.filter((p) => p.itemId !== itemId));
    setRefresh((prev) => !prev);
    showToast(`${institutionName} has been successfully unlinked.`, "success");
  } catch {
    setError(`Failed to unlink ${institutionName}.`);
  }
};


  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h3 className="mb-0">
                <i className="bi bi-sliders me-2"></i>
                Manage Plaid Connections
              </h3>
            </Card.Header>

            <Card.Body className="p-4">
              <p className="text-muted text-center mb-4">
                View and manage your connected financial institutions below.
              </p>

              {/* Add new institution */}
              <div className="text-center mb-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/create-plaid-account")}
                >
                  <i className="bi bi-plus-circle me-2"></i> Connect New Institution
                </Button>
              </div>

              {/* Loading / error states */}
              {loading && (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="text-muted mt-3">Loading linked institutions...</p>
                </div>
              )}

              {error && <p className="text-danger text-center">{error}</p>}

              {/* Empty state */}
              {!loading && plaidItems.length === 0 && (
                <div className="text-center py-4">
                  <i className="bi bi-bank2 text-secondary" style={{ fontSize: "2rem" }}></i>
                  <p className="text-muted mt-3 mb-0">
                    No Plaid-linked institutions found.
                  </p>
                </div>
              )}

              {/* Linked Institutions */}
              {!loading &&
                plaidItems.map((item) => (
                  <Card key={item.itemId} className="shadow-sm mb-3">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{item.institutionName}</strong>
                        <Badge bg="info" className="ms-2">
                          {item.accounts.length} account
                          {item.accounts.length !== 1 && "s"}
                        </Badge>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                            showConfirm(
                            "Unlink Institution",
                            `Are you sure you want to unlink ${item.institutionName}?`,
                            () => handleUnlink(item.itemId, item.institutionName),
                            {
                                confirmText: "Unlink",
                                cancelText: "Cancel",
                                type: "danger",
                            }
                            )
                        }
                        >
                        <i className="bi bi-x-circle me-1"></i> Unlink
                        </Button>

                    </Card.Header>

                    <Card.Body className="p-3">
                      {item.accounts.map((acc) => (
                        <div
                          key={acc.accountId}
                          className="d-flex justify-content-between align-items-center border-bottom py-2"
                        >
                          <span>{acc.name}</span>
                          <span className="text-primary fw-semibold">
                            ${acc.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                ))}

              {/* Back button */}
              <div className="text-center mt-4">
                <Button
                  variant="light"
                  size="lg"
                  className="border"
                  onClick={() => navigate("/account-management")}
                >
                  <i className="bi bi-arrow-left me-2"></i> Back to Account Management
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
