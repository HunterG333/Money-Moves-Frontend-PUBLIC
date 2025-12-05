import { Dropdown } from "react-bootstrap";
import { DropdownItemWithIcon } from "./DropdownItemWithIcon";

interface SettingsDropdownProps {
  isCleaningUpMFA: boolean;
  onCleanup: () => void;

  isTestDataActive?: boolean;
  onOverrideGraphData?: () => void;

  onForceRefresh: () => void;
}

export function SettingsDropdown({
  isCleaningUpMFA,
  onCleanup,
  isTestDataActive,
  onOverrideGraphData,
  onForceRefresh,
}: SettingsDropdownProps) {
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-light"
        className="d-flex align-items-center justify-content-center"
        style={{ width: "40px", height: "40px", padding: "0" }}
      >
        <i className="bi bi-gear" style={{ fontSize: "1.1rem" }} />
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-lg border-0">
        <Dropdown.Header className="fw-bold text-primary">
          <i className="bi bi-tools me-2" />
          Admin Tools
        </Dropdown.Header>

        <Dropdown.Divider />

        {/* Cleanup MFA Tokens */}
        <DropdownItemWithIcon
          icon="bi-trash"
          iconClass="text-danger"
          title={isCleaningUpMFA ? "Cleaning up..." : "Cleanup MFA Tokens"}
          subtitle="Remove expired tokens"
          onClick={onCleanup}
          disabled={isCleaningUpMFA}
        />

        {/* Enable/Disable Test Data */}
        {onOverrideGraphData && (
          <DropdownItemWithIcon
            icon={isTestDataActive ? "bi-graph-up" : "bi-graph-up-arrow"}
            iconClass={isTestDataActive ? "text-success" : "text-warning"}
            title={isTestDataActive ? "Disable Test Data" : "Enable Test Data"}
            subtitle={
              isTestDataActive
                ? "Switch back to real data"
                : "Deploy test data for graph testing"
            }
            onClick={onOverrideGraphData}
          />
        )}

        {/* Force Account Refresh */}
        <DropdownItemWithIcon
          icon="bi-arrow-repeat"
          iconClass="text-warning"
          title="Force Account Refresh (1 hour delay)"
          onClick={onForceRefresh}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}
