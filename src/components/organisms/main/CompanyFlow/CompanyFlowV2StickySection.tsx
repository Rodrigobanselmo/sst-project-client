import { ReactNode } from 'react';

import { CompanyFlowStickySubheader } from './CompanyFlowStickySubheader';

type Props = {
  chrome: ReactNode;
  tableHeader?: ReactNode;
  children: ReactNode;
  belowModuleTabs?: boolean;
};

/**
 * Sticky do chrome de tabelas v2 (busca, filtros, cabeçalho de colunas)
 * no fluxo empresarial, alinhado ao CompanyFlowTableSection das tabelas legadas.
 */
export function CompanyFlowV2StickySection({
  chrome,
  tableHeader,
  children,
  belowModuleTabs = false,
}: Props): JSX.Element {
  return (
    <>
      <CompanyFlowStickySubheader belowModuleTabs={belowModuleTabs}>
        {chrome}
        {tableHeader}
      </CompanyFlowStickySubheader>
      {children}
    </>
  );
}
