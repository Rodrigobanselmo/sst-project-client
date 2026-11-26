import { ReactNode, useState } from 'react';

/** Accordion interaction stays local: other expanded factors do not render again. */
export function RiskFactorDisclosure({ children }: { children: (expanded: boolean, toggle: () => void) => ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return <>{children(expanded, () => setExpanded(previous => !previous))}</>;
}
