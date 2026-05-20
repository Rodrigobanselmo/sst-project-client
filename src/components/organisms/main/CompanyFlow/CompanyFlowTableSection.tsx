import { ReactNode } from 'react';

import { STable } from 'components/atoms/STable';
import { STableProps } from 'components/atoms/STable/types';

import { CompanyFlowStickySubheader } from './CompanyFlowStickySubheader';

type Props = {
  chrome?: ReactNode;
  columns: string;
  loading?: STableProps['loading'];
  rowsNumber?: STableProps['rowsNumber'];
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Cola o chrome abaixo das abas do módulo (Caracterização, Documentos). */
  belowModuleTabs?: boolean;
};

/**
 * Separa o chrome da tabela (título, busca, cabeçalho de colunas) do corpo rolável,
 * mantendo o chrome sticky abaixo das abas do módulo no fluxo empresarial.
 */
export function CompanyFlowTableSection({
  chrome,
  columns,
  loading,
  rowsNumber,
  header,
  footer,
  children,
  belowModuleTabs = false,
}: Props): JSX.Element {
  return (
    <>
      <CompanyFlowStickySubheader belowModuleTabs={belowModuleTabs}>
        {chrome}
        <STable columns={columns} loading={false} rowsNumber={rowsNumber}>
          {header}
        </STable>
      </CompanyFlowStickySubheader>
      <STable columns={columns} loading={loading} rowsNumber={rowsNumber}>
        {children}
      </STable>
      {footer}
    </>
  );
}
