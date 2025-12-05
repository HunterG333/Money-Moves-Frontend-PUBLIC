import { Dropdown } from "react-bootstrap";

interface DropdownItemWithIconProps {
    icon: string;
    iconClass?: string;
    title: string;
    subtitle?: string;
    onClick: () => void;
    disabled?: boolean;
  }

export const DropdownItemWithIcon = ({ icon, iconClass, title, subtitle, onClick, disabled }: DropdownItemWithIconProps) => (
    <Dropdown.Item onClick={onClick} disabled={disabled} className="d-flex align-items-center">
        <i className={`bi ${icon} me-2 ${iconClass || ''}`}></i>
        <div>
            <div className="fw-semibold">{title}</div>
            {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
    </Dropdown.Item>
);