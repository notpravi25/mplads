import React from 'react';
import { Compass, ClipboardCheck, Menu } from 'lucide-react';

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: () => void;
  onOpenCitizenPortal: () => void;
  onOpenOfficerCenter: () => void;
  onOpenSidebar: () => void;
  isSidebarCollapsed: boolean;
  activeTab?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onOpenCitizenPortal,
  onOpenOfficerCenter,
  onOpenSidebar,
  isSidebarCollapsed,
  activeTab = 'overview',
}) => {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'overview': return 'NATIONAL PORTFOLIO  /  OVERVIEW';
      case 'risk-monitor': return 'PORTFOLIO  /  REVIEW CASES';
      case 'state-risk-analytics': return 'PORTFOLIO  /  STATE RISK & RECORDS';
      case 'mp-intelligence': return 'PORTFOLIO  /  MP WORKS & FUND INTELLIGENCE';
      case 'financial-analytics': return 'ENGINES  /  FINANCIAL ANOMALY ANALYTICS';
      case 'geotag-evidence': return 'ENGINES  /  FIELD PHOTOGRAPHIC EVIDENCE';
      case 'duplicate-inspector': return 'ENGINES  /  CANDIDATE DUPLICATE INSPECTOR';
      case 'compliance-monitor': return 'ENGINES  /  COMPLIANCE EVIDENCE GAPS';
      case 'schedule-progress': return 'ENGINES  /  SCHEDULE & PROGRESS RISK';
      case 'material-fairness': return 'ENGINES  /  MATERIAL FAIRNESS';
      case 'officer-dashboard': return 'OPERATIONS  /  OFFICER CENTER';
      case 'citizen-portal': return 'OPERATIONS  /  CITIZEN PORTAL';
      case 'data-sync': return 'GOVERNANCE  /  DATA SYNC & STATUS';
      case 'model-monitoring': return 'GOVERNANCE  /  MODEL MONITORING';
      default: return 'NATIONAL PORTFOLIO  /  OVERVIEW';
    }
  };

  const getPageLabel = () => {
    switch (activeTab) {
      case 'overview': return 'Overview';
      case 'risk-monitor': return 'Review cases';
      case 'state-risk-analytics': return 'State risk & records';
      case 'mp-intelligence': return 'MP intelligence';
      case 'financial-analytics': return 'Financial analytics';
      case 'geotag-evidence': return 'Field photographic evidence';
      case 'duplicate-inspector': return 'Duplicate inspector';
      case 'compliance-monitor': return 'Compliance evidence gaps';
      case 'schedule-progress': return 'Schedule & progress risk';
      case 'material-fairness': return 'Material fairness';
      case 'officer-dashboard': return 'Officer center';
      case 'citizen-portal': return 'Citizen portal';
      case 'data-sync': return 'Data sync & status';
      case 'model-monitoring': return 'Model register';
      default: return 'Overview';
    }
  };

  return (
    <header className={`shell-topbar ${isSidebarCollapsed ? 'shell-topbar--collapsed' : ''}`}>
      <div className="shell-topbar__context">
        <button type="button" aria-label="Open navigation" onClick={onOpenSidebar} className="shell-topbar__menu">
          <Menu className="w-4 h-4" />
        </button>
        <span className="shell-topbar__page-label">{getPageLabel()}</span>
        <span className="editorial-crumb shell-topbar__breadcrumb select-none">
          {getBreadcrumb()}
        </span>
      </div>

      <div className="shell-topbar__actions">
        <form onSubmit={(e) => { e.preventDefault(); onSearchSubmit(); }} className="shell-topbar__search">
          <input
            aria-label="Search works"
            type="text"
            placeholder="Search work ID, district, MP…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="editorial-search"
          />
        </form>

        <button
          type="button"
          id="citizen-login-btn"
          onClick={onOpenCitizenPortal}
          className="shell-topbar__action shell-topbar__action--citizen"
          title="Citizen Portal: Report works with geotagged proof"
        >
          <Compass className="w-3.5 h-3.5 text-[#b24e28]" />
          <span>Citizen Portal</span>
        </button>

        <button
          type="button"
          id="officer-center-btn"
          onClick={onOpenOfficerCenter}
          className="shell-topbar__action shell-topbar__action--officer"
          title="Implementing Officer Center"
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-[#4b8c72]" />
          <span>Officer Center</span>
        </button>

      </div>
    </header>
  );
};
