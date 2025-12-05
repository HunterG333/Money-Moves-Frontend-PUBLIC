
import React from "react";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import AccountsAccordion from "../../components/AccountsAccordion";
import MoneyGraph from "../../components/charts/MoneyGraph";
import NetWorth from "../../components/NetWorth";
import TimePeriodSelector from "../../components/TimePeriodSelector";
import TutorialModal from "../../components/TutorialModal";
import * as Api from "../../api/api";
import { AccountDataDTO, NetWorthData } from "../../types";
import { TIME_PERIODS } from "../../constants";
import { useNavigate } from "react-router-dom";

interface DashboardPageProps {
  accountData: AccountDataDTO;
  netWorthData: NetWorthData;
  selectedTimePeriod: keyof typeof TIME_PERIODS;
  accountError: string | null;
  netWorthError: string | null;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  handleTimePeriodChange: (period: keyof typeof TIME_PERIODS) => void;
  calculatePercentageChange: (current: number, previous: number) => number;
}

function DashboardPage({
  accountData,
  netWorthData,
  selectedTimePeriod,
  accountError,
  netWorthError,
  setRefresh,
  handleTimePeriodChange,
  calculatePercentageChange,
}: DashboardPageProps) {

  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Api.getUserData().then((data) => {
        if (!data.completedTutorial) {
          setShowTutorial(true);
        }
      })
  }, []);

  return (
    <Container fluid className="py-4">
      {/* Key Financial Metrics */}
      <Row className="mb-4">
        <Col>
          <div className="bg-primary bg-opacity-10 rounded-4 p-4 shadow-lg border border-primary">
            <NetWorth
              dataset={netWorthData.dataset}
              error={netWorthError}
              percentageChange={
                netWorthData.dataset.length >= 2
                  ? (() => {
                      const first = Number(netWorthData.dataset[0]);
                      const last = Number(netWorthData.dataset.at(-1));
                      const change = calculatePercentageChange(last, first);
                      return { change, isPositive: change >= 0 };
                    })()
                  : null
              }
            />
          </div>
        </Col>
      </Row>

      {/* Quick Financial Overview */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-info bg-opacity-10">
            <Card.Body className="text-center p-3">
              <div className="h4 mb-1 text-info fw-bold">
                $
                {accountData.investmentAccounts
                  .reduce((sum, acc) => sum + acc.value, 0)
                  .toLocaleString()}
              </div>
              <div className="text-muted small">Total Investments</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card
            className="border-0 shadow-sm h-100"
            style={{ backgroundColor: "rgba(111,66,193,0.1)" }}
          >
            <Card.Body className="text-center p-3">
              <div
                className="h4 mb-1"
                style={{ color: "#6f42c1", fontWeight: "700" }}
              >
                $
                {accountData.assetAccounts
                  .reduce((sum, acc) => sum + acc.value, 0)
                  .toLocaleString()}
              </div>
              <div className="text-muted small">Total Assets</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100 bg-warning bg-opacity-10">
            <Card.Body className="text-center p-3">
              <div className="h4 mb-1 text-warning fw-bold">
                $
                {accountData.debtAccounts
                  .reduce((sum, acc) => sum + acc.value, 0)
                  .toLocaleString()}
              </div>
              <div className="text-muted small">Total Debts</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts and Stats Section */}
      <Row className="mb-5">
        {/* Net Worth Chart */}
        <Col className="mb-4">
          <Card className="border-0 shadow-lg h-100">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-graph-up text-primary me-2"></i>
                  Net Worth Trend
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">Time Period:</span>
                  <TimePeriodSelector
                    selectedPeriod={selectedTimePeriod}
                    onPeriodChange={handleTimePeriodChange}
                  />
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <MoneyGraph
                labels={netWorthData.labels}
                dataset={netWorthData.dataset}
                title="Net Worth Over Time"
                height="400px"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Accounts Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0 fw-semibold">
                    <i className="bi bi-bank text-primary me-2"></i>
                    Account Management
                  </h5>
                  <p className="text-muted small mb-0 mt-1">
                    View and manage your financial accounts
                  </p>
                </div>
                <div className="text-end">
                  <div className="d-flex gap-4">
                    <div className="text-center px-3">
                      <div className="h6 mb-0 text-success fw-bold">
                        {accountData.investmentAccounts.length}
                      </div>
                      <div className="text-muted small">Investment</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="h6 mb-0 text-primary fw-bold">
                        {accountData.assetAccounts.length}
                      </div>
                      <div className="text-muted small">Assets</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="h6 mb-0 text-warning fw-bold">
                        {accountData.debtAccounts.length}
                      </div>
                      <div className="text-muted small">Debts</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="h6 mb-0 text-primary fw-bold">
                        {accountData.investmentAccounts.length +
                          accountData.assetAccounts.length +
                          accountData.debtAccounts.length}
                      </div>
                      <div className="text-muted small">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {accountError ? (
                <div className="alert alert-danger m-3" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Error loading accounts: {accountError}
                </div>
              ) : (
                <AccountsAccordion
                  investmentAccounts={accountData.investmentAccounts}
                  assetAccounts={accountData.assetAccounts}
                  debtAccounts={accountData.debtAccounts}
                  setRefresh={setRefresh}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showTutorial && (
        <TutorialModal show={showTutorial} onClose={() => setShowTutorial(false)} onNavigateToAccounts={() =>  navigate("/account-management")} />
      )}

    </Container>
  );
}

export default DashboardPage;
