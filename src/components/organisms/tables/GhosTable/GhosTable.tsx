import { FC, useCallback, useState } from 'react';

import { BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { STableButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/STableButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch as STableSearchV2 } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { CompanyFlowTableSection } from 'components/organisms/main/CompanyFlow/CompanyFlowTableSection';
import {
  GhoAddLayout,
  initialAddGhoState,
} from 'components/organisms/modals/ModalAddGHO/hooks/useAddGho';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';
import { CharacterizationQuickCountCell } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationQuickCountCell';
import { CharacterizationRisksQuickCell } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationRisksQuickCell';

import EditIcon from 'assets/icons/SEditIcon';
import { SGhoIcon } from 'assets/icons/SGhoIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IGho } from 'core/interfaces/api/IGho';
import {
  IQueryGhos,
  useQueryGhos,
} from 'core/services/hooks/queries/useQueryGhos/useQueryGhos';
import { resolveGseTableOpenStep } from 'components/organisms/modals/ModalAddGHO/gse-wizard-steps';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useGseImportFlow } from './useGseImportFlow';

const GHO_TABLE_PAGE_SIZES = [15, 25, 50, 100] as const;
const DEFAULT_GHO_TABLE_PAGE_SIZE = 15;

export const GhosTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      workspaceId?: string;
      onSelectData?: (company: IGho) => void;
      selectedData?: IGho[];
      query?: IQueryGhos;
      companyFlowSticky?: boolean;
      companyFlowBelowTabs?: boolean;
      /** Layout amplo (sem backdrop de modal) na edição/criação de GSE. */
      pageGhoLayout?: boolean;
    }
> = ({
  rowsPerPage: rowsPerPageProp,
  workspaceId,
  onSelectData,
  selectedData,
  query,
  companyFlowSticky = false,
  companyFlowBelowTabs = false,
  pageGhoLayout = false,
}) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const [pageSize, setPageSize] = useState(() =>
    typeof rowsPerPageProp === 'number'
      ? rowsPerPageProp
      : DEFAULT_GHO_TABLE_PAGE_SIZE,
  );

  const isSelect = !!onSelectData;

  const {
    data: risks,
    isLoading: loadRisks,
    count,
  } = useQueryGhos(page, { search, workspaceId, ...query }, pageSize);

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!(GHO_TABLE_PAGE_SIZES as readonly number[]).includes(size)) return;
      setPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const { companyId: destCompanyId } = useGetCompanyId();
  const { handleImportGse } = useGseImportFlow({
    destCompanyId,
    destWorkspaceId: workspaceId,
  });

  const { onStackOpenModal } = useModal();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const ghoModalPayload = (
    data: Partial<typeof initialAddGhoState> = {},
  ): typeof initialAddGhoState =>
    ({
      ...initialAddGhoState,
      ...data,
      ...(pageGhoLayout && { layout: 'page' as GhoAddLayout }),
    }) as typeof initialAddGhoState;

  const onAddGHO = () => {
    onStackOpenModal(ModalEnum.GHO_ADD, ghoModalPayload());
  };

  const onEditGHO = (
    gho: IGho,
    action: 'row' | 'edit' | 'cargos' | 'risks' | 'ai' = 'edit',
  ) => {
    onStackOpenModal(
      ModalEnum.GHO_ADD,
      ghoModalPayload({
        ...(gho as any),
        initialWizardStep: resolveGseTableOpenStep(action),
      }),
    );
  };

  const onSelectRow = (risk: IGho) => {
    if (isSelect) {
      onSelectData(risk);
    } else onEditGHO(risk, 'row');
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(160px, 1fr)' },
    ...(pageGhoLayout
      ? [
          { text: 'Cargos', column: '90px', justifyContent: 'center' },
          { text: 'Riscos', column: '90px', justifyContent: 'center' },
        ]
      : []),
    { text: 'Status', column: '90px', justifyContent: 'center' },
    { text: 'Editar', column: '80px', justifyContent: 'center' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  const tableColumns = header.map(({ column }) => column).join(' ');
  const tableChrome = (
    <>
      {!isSelect && (
        <STableTitle icon={SGhoIcon}>Grupo Similar de Exposição</STableTitle>
      )}
      <STableSearchV2 onSearch={handleSearchChange} search={search}>
        {!isSelect && (
          <STableSearchContent>
            <>
              <STableAddButton onClick={onAddGHO} />
              <STableButton
                onClick={handleImportGse}
                text="Importar GSE"
                tooltip="Importe um GSE existente, copiando nome, descrição e riscos diretos para este estabelecimento."
                icon={<ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />}
                color="success"
                disabled={!workspaceId}
              />
            </>
          </STableSearchContent>
        )}
      </STableSearchV2>
    </>
  );
  const tableHeader = (
    <STableHeader>
      {header.map(({ text, ...props }) => (
        <STableHRow key={text} {...props}>
          {text}
        </STableHRow>
      ))}
    </STableHeader>
  );
  const tableBody = (
    <STableBody<(typeof risks)[0]>
      rowsData={risks}
      hideLoadMore
      rowsInitialNumber={pageSize}
      renderRow={(row) => (
        <STableRow onClick={() => onSelectRow(row)} clickable key={row.id}>
          {selectedData && (
            <SCheckBox
              label=""
              checked={!!selectedData.find((exam) => exam.id === row.id)}
            />
          )}
          <TextIconRow clickable text={row.name || '-'} />
          {pageGhoLayout && (
            <CharacterizationQuickCountCell
              count={row.hierarchyCount ?? 0}
              showZeroCount
              emptyTooltip="Abrir cargos do GSE"
              countTooltip="Abrir cargos do GSE"
              addTooltip="Adicionar cargo ao GSE"
              onOpen={() => onEditGHO(row, 'cargos')}
              onAdd={() => onEditGHO(row, 'cargos')}
            />
          )}
          {pageGhoLayout && (
            <CharacterizationRisksQuickCell
              count={row.riskCount ?? 0}
              countTooltip="Abrir Fatores de Riscos"
              onOpenFactors={() => onEditGHO(row, 'risks')}
              onOpenAiAnalysis={() => onEditGHO(row, 'ai')}
              aiTooltip="Analisar riscos com IA"
            />
          )}
          <StatusSelect
            large={false}
            sx={{ maxWidth: '90px' }}
            selected={'status' in row ? row.status : StatusEnum.ACTIVE}
            statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
            handleSelectMenu={(option) => handleEditStatus(option.value)}
            disabled
          />
          <IconButtonRow
            icon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onEditGHO(row, 'edit');
            }}
          />
        </STableRow>
      )}
    />
  );
  const tablePagination = (
    <STablePagination
      mt={2}
      registersPerPage={pageSize}
      totalCountOfRegisters={loadRisks ? undefined : count}
      currentPage={page}
      onPageChange={setPage}
      {...(typeof rowsPerPageProp !== 'number' && {
        pageSizeOptions: [...GHO_TABLE_PAGE_SIZES],
        onRegistersPerPageChange,
      })}
    />
  );

  if (companyFlowSticky) {
    return (
      <CompanyFlowTableSection
        chrome={tableChrome}
        columns={tableColumns}
        loading={loadRisks}
        rowsNumber={pageSize}
        header={tableHeader}
        footer={tablePagination}
        belowModuleTabs={companyFlowBelowTabs}
      >
        {tableBody}
      </CompanyFlowTableSection>
    );
  }

  return (
    <>
      {tableChrome}
      <STable columns={tableColumns} loading={loadRisks} rowsNumber={pageSize}>
        {tableHeader}
        {tableBody}
      </STable>
      {tablePagination}
    </>
  );
};
