import { FC } from 'react';

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
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { CompanyFlowTableSection } from 'components/organisms/main/CompanyFlow/CompanyFlowTableSection';
import { initialAddGhoState } from 'components/organisms/modals/ModalAddGHO/hooks/useAddGho';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import { SGhoIcon } from 'assets/icons/SGhoIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IGho } from 'core/interfaces/api/IGho';
import {
  IQueryGhos,
  useQueryGhos,
} from 'core/services/hooks/queries/useQueryGhos/useQueryGhos';

export const GhosTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      workspaceId?: string;
      onSelectData?: (company: IGho) => void;
      selectedData?: IGho[];
      query?: IQueryGhos;
      companyFlowSticky?: boolean;
      companyFlowBelowTabs?: boolean;
    }
> = ({
  rowsPerPage = 8,
  workspaceId,
  onSelectData,
  selectedData,
  query,
  companyFlowSticky = false,
  companyFlowBelowTabs = false,
}) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const isSelect = !!onSelectData;

  const {
    data: risks,
    isLoading: loadRisks,
    count,
  } = useQueryGhos(
    page,
    { search, workspaceId, ...query },
    rowsPerPage,
  );

  const { onStackOpenModal } = useModal();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const onAddGHO = () => {
    onStackOpenModal(ModalEnum.GHO_ADD, {} as typeof initialAddGhoState);
  };

  const onEditGHO = (gho: IGho) => {
    onStackOpenModal(ModalEnum.GHO_ADD, {
      ...(gho as any),
    } as typeof initialAddGhoState);
  };

  const onSelectRow = (risk: IGho) => {
    if (isSelect) {
      onSelectData(risk);
    } else onEditGHO(risk);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(160px, 1fr)' },
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
      <STableSearch
        onAddClick={onAddGHO}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
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
      rowsInitialNumber={rowsPerPage}
      renderRow={(row) => (
        <STableRow onClick={() => onSelectRow(row)} clickable key={row.id}>
          {selectedData && (
            <SCheckBox
              label=""
              checked={!!selectedData.find((exam) => exam.id === row.id)}
            />
          )}
          <TextIconRow clickable text={row.name || '-'} />
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
              onEditGHO(row);
            }}
          />
        </STableRow>
      )}
    />
  );
  const tablePagination = (
    <STablePagination
      mt={2}
      registersPerPage={rowsPerPage}
      totalCountOfRegisters={loadRisks ? undefined : count}
      currentPage={page}
      onPageChange={setPage}
    />
  );

  if (companyFlowSticky) {
    return (
      <CompanyFlowTableSection
        chrome={tableChrome}
        columns={tableColumns}
        loading={loadRisks}
        rowsNumber={rowsPerPage}
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
      <STable columns={tableColumns} loading={loadRisks} rowsNumber={rowsPerPage}>
        {tableHeader}
        {tableBody}
      </STable>
      {tablePagination}
    </>
  );
};
