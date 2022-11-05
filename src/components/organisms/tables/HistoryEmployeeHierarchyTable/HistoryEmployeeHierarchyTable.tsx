import { FC } from 'react';

import { BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
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
import { STagButton } from 'components/atoms/STagButton';
import { initialEmployeeHistoryHierState } from 'components/organisms/modals/ModalAddEmployeeHistoryHier/hooks/useAddData';
import {
  EmployeeHierarchyMotiveTypeEnum,
  employeeHierarchyMotiveTypeMap,
} from 'project/enum/employee-hierarchy-motive.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import {
  IEmployee,
  IEmployeeHierarchyHistory,
} from 'core/interfaces/api/IEmployee';
import { useQueryHisHierEmployee } from 'core/services/hooks/queries/useQueryHisHierEmployee/useQueryHisHierEmployee';
import { dateToString } from 'core/utils/date/date-format';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { sortDate } from 'core/utils/sorts/data.sort';

export const HistoryEmployeeHierarchyTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IEmployeeHierarchyHistory) => void;
    hideTitle?: boolean;
    companyId?: string;
    employeeId?: number;
    employee?: IEmployee;
  }
> = ({
  rowsPerPage = 8,
  onSelectData,
  hideTitle,
  companyId,
  employeeId,
  employee,
}) => {
  const { search, page, setPage } = useTableSearchAsync();

  const {
    data: history,
    isLoading: loadQuery,
    count,
  } = useQueryHisHierEmployee(
    page,
    { search, employeeId: employeeId },
    rowsPerPage,
    companyId,
  );

  const isSelect = !!onSelectData;
  const modalName = ModalEnum.EMPLOYEE_HISTORY_HIER_ADD;

  const { onStackOpenModal } = useModal();

  const onAdd = () => {
    onStackOpenModal(modalName, {
      companyId,
      employeeId,
      employee,
      motive:
        history?.length === 0 ? EmployeeHierarchyMotiveTypeEnum.ADM : undefined,
      startDate: new Date(),
    } as Partial<typeof initialEmployeeHistoryHierState>);
  };

  const onSelectRow = (data: IEmployeeHierarchyHistory) => {
    if (isSelect) {
      onSelectData(data);
    } else onEdit(data);
  };

  const onEdit = (data: IEmployeeHierarchyHistory) => {
    onStackOpenModal(modalName, {
      ...data,
      employeeId,
      companyId,
      sector: data?.hierarchy?.parents?.find(
        (p) => p.type == HierarchyEnum.SECTOR,
      ),
    } as Partial<typeof initialEmployeeHistoryHierState>);
  };

  return (
    <>
      {!hideTitle && (
        <>
          <SFlex mb={12} gap={10} align="center">
            <STableTitle mb={0}>Histórico de Lotação</STableTitle>
            <STagButton
              onClick={onAdd}
              maxWidth={120}
              mt={-5}
              mb={-5}
              icon={SAddIcon}
              text={'Novo cargo'}
              active
              bg={'success.dark'}
              textProps={{ sx: { mb: 0 } }}
            />
          </SFlex>
          {/* <STableSearch
            onAddClick={onAddContact}
            onChange={(e) => handleSearchChange(e.target.value)}
          /> */}
        </>
      )}
      <STable
        loading={loadQuery}
        rowsNumber={rowsPerPage}
        columns="100px  100px  minmax(150px, 2fr)  minmax(150px, 2fr) 200px 50px"
      >
        <STableHeader>
          <STableHRow>Data</STableHRow>
          <STableHRow>Motivo</STableHRow>
          <STableHRow>Cargo</STableHRow>
          <STableHRow>Setor</STableHRow>
          <STableHRow>Empresa</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof history[0]>
          rowsData={history
            .sort((a, b) => sortDate(b.created_at, a.created_at))
            .sort((a, b) => sortDate(b.startDate, a.startDate))}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
                status={employeeHierarchyMotiveTypeMap[row.motive]?.status}
              >
                <TextIconRow text={dateToString(row.startDate) || '-'} />
                <TextIconRow
                  text={
                    employeeHierarchyMotiveTypeMap[row.motive]?.content || '-'
                  }
                />
                <TextIconRow clickable text={row?.hierarchy?.name || '-'} />
                <TextIconRow
                  clickable
                  text={row?.hierarchy?.parent?.name || '-'}
                />
                <TextIconRow
                  clickable
                  text={getCompanyName(row?.hierarchy?.company) || '-'}
                  lineNumber={1}
                  tooltipTitle={getCompanyName(row?.hierarchy?.company) || '-'}
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                  icon={<EditIcon />}
                />
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadQuery ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
