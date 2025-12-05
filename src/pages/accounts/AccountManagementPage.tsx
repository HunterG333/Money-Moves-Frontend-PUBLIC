import { LinkContainer } from "react-router-bootstrap"
import { Button, Card, Container, Row, Col } from "react-bootstrap";

function AccountManagementPage() {
  return (
  <Container className="py-4">
    <Row className="justify-content-center">
      <Col lg={8} xl={6}>
        <Card className="border-0 shadow-lg">
          <Card.Header className="bg-primary text-white text-center py-3">
            <h3 className="mb-0">
              <i className="bi bi-gear-fill me-2"></i>
              Account Management
            </h3>
          </Card.Header>

          <Card.Body className="p-4">
            <p className="text-muted text-center mb-4">
              Manage your connected institutions and manual accounts below.
            </p>

            {/* Linked Institutions */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-success text-white text-center fw-semibold py-2">
                <i className="bi bi-link-45deg me-2"></i> Linked Institutions
              </Card.Header>
              <Card.Body className="d-grid gap-3 p-3">
                <LinkContainer to="/create-plaid-account">
                  <Button variant="outline-success" size="lg">
                    <i className="bi bi-plus-circle me-2"></i> Connect New Bank
                  </Button>
                </LinkContainer>
                <LinkContainer to="/manage-plaid-links">
                  <Button variant="outline-secondary" size="lg">
                    <i className="bi bi-sliders me-2"></i> Manage Plaid Connections
                  </Button>
                </LinkContainer>
              </Card.Body>
            </Card>

            {/* Accounts */}
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white text-center fw-semibold py-2">
                <i className="bi bi-wallet2 me-2"></i> Accounts
              </Card.Header>
              <Card.Body className="d-grid gap-3 p-3">
                <LinkContainer to="/create-account">
                  <Button variant="outline-success" size="lg">
                    <i className="bi bi-plus-circle me-2"></i> Add Manual Account
                  </Button>
                </LinkContainer>
                <LinkContainer to="/update-account-info">
                  <Button variant="outline-secondary" size="lg">
                    <i className="bi bi-pencil-square me-2"></i> View & Manage Accounts
                  </Button>
                </LinkContainer>
                <LinkContainer to="/dashboard">
                  <Button variant="light" size="lg" className="border">
                    <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
                  </Button>
                </LinkContainer>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

}

export default AccountManagementPage;
