import { Link } from "react-router-dom";

interface HeaderButtonProps {
    to?: string;
    onClick?: () => void;
    icon: string;
    label: string;
    disabled?: boolean;
  }

  export const HeaderButton = ({ to, onClick, icon, label, disabled }: HeaderButtonProps) => (
    to ? (
      <Link 
        to={to} 
        className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
        style={{ height: "40px" }}
      >
        <i className={`bi ${icon}`}></i>
        <span className="d-none d-sm-inline">{label}</span>
      </Link>
    ) : (
      <button 
        onClick={onClick} 
        disabled={disabled} 
        className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
        style={{ height: "40px" }}
      >
        <i className={`bi ${icon}`}></i>
        <span className="d-none d-sm-inline">{label}</span>
      </button>
    )
  );