import type { ReactNode } from 'react';

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': true,
} as const;

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <svg {...ICON_PROPS} className="lp-pres-problem__icon">
      {children}
    </svg>
  );
}

function DocumentIcon() {
  return (
    <IconFrame>
      <path d="M14.2 3.2H7.6A1.6 1.6 0 0 0 6 4.8v14.4A1.6 1.6 0 0 0 7.6 21h8.8a1.6 1.6 0 0 0 1.6-1.6V8.2L14.2 3.2Z" />
      <path d="M14.2 3.2V8.2H18" />
      <path d="M9 12.6h6.2M9 16h4.2" />
    </IconFrame>
  );
}

function SpreadsheetIcon() {
  return (
    <IconFrame>
      <rect x="5" y="4.2" width="14" height="15.6" rx="1.4" />
      <path d="M5 9.6h14M5 14.6h14M12 9.6V19.8" />
      <path className="lp-pres-problem__icon-accent" d="M7.2 6.7h3.2" />
    </IconFrame>
  );
}

function RiskIcon() {
  return (
    <IconFrame>
      <circle cx="10.4" cy="10.4" r="5.8" />
      <path d="M14.7 14.8 20 20.1" />
      <path className="lp-pres-problem__icon-accent" d="M10.4 7.7v3.3" />
      <circle className="lp-pres-problem__icon-accent is-dot" cx="10.4" cy="13.4" r="0.7" />
    </IconFrame>
  );
}

function ActionPlanIcon() {
  return (
    <IconFrame>
      <rect x="6.2" y="5.4" width="11.6" height="14.4" rx="1.4" />
      <rect x="9" y="3.2" width="6" height="3.2" rx="0.8" />
      <path className="lp-pres-problem__icon-accent" d="M8.4 11.1l1.1 1.1 2-2.1" />
      <path d="M13 11.2h3.4M8.6 15.2h7.8M8.6 18.1h5.4" />
    </IconFrame>
  );
}

function IntegrationIcon() {
  return (
    <IconFrame>
      <circle cx="7.1" cy="8" r="2.45" />
      <circle cx="16.9" cy="8" r="2.45" />
      <circle cx="12" cy="16.8" r="2.45" />
      <path d="M8.7 9.7 11 14.6" />
      <path d="M15.3 9.7 13 14.6" />
      <circle className="lp-pres-problem__icon-accent is-dot" cx="12" cy="12.5" r="0.75" />
    </IconFrame>
  );
}

function LegalIcon() {
  return (
    <IconFrame>
      <path d="M12 4.2v13.2M8.2 20.2h7.6" />
      <path d="M4.4 8.4h15.2" />
      <path d="M6.4 8.4 4.3 14.6M17.6 8.4l2.1 6.2" />
      <path d="M3.3 14.6h6.2M14.5 14.6h6.2" />
      <circle className="lp-pres-problem__icon-accent is-dot" cx="12" cy="8.4" r="0.85" />
    </IconFrame>
  );
}

export const PRESENTATION_PROBLEM_ICONS = {
  '01': DocumentIcon,
  '02': SpreadsheetIcon,
  '03': RiskIcon,
  '04': ActionPlanIcon,
  '05': IntegrationIcon,
  '06': LegalIcon,
} as const;
