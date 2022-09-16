import { FC } from 'react';

import { BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import {
  ITableRowStatus,
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import TextUserRow from 'components/atoms/STable/components/Rows/TextUserRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import { getCompanyName } from 'components/organisms/main/Header/Location';
import { initialEmployeeHistoryExamState } from 'components/organisms/modals/ModalAddEmployeeHistoryExam/hooks/useAddData';
import { initialExamScheduleState } from 'components/organisms/modals/ModalAddExamSchedule/hooks/useEditExamEmployee';
import dayjs from 'dayjs';
import { employeeExamEvaluationTypeMap } from 'project/enum/employee-exam-history-evaluation.enum';
import { employeeExamTypeMap } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { useQueryHisScheduleExam } from 'core/services/hooks/queries/useQueryHisScheduleExam/useQueryHisScheduleExam';
import { dateToString } from 'core/utils/date/date-format';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { sortData } from 'core/utils/sorts/data.sort';

export const ScheduleAskExamTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IEmployeeExamsHistory) => void;
    hideTitle?: boolean;
    companyId?: string;
    employeeId?: number;
    employee?: IEmployee;
  }
> = ({ rowsPerPage = 8, onSelectData, hideTitle, companyId, employeeId }) => {
  const { search, page, handleSearchChange, setPage } = useTableSearchAsync();

  const {
    data: history,
    isLoading: loadQuery,
    count,
  } = useQueryHisScheduleExam(
    page,
    { search, allCompanies: true, employeeId: employeeId },
    rowsPerPage,
    companyId,
  );

  const isSelect = !!onSelectData;
  const modalName = ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE;

  const { onStackOpenModal } = useModal();

  const onSelectRow = (data: IEmployeeExamsHistory) => {
    if (isSelect) {
      onSelectData(data);
    } else onEdit(data);
  };

  const onEdit = (data: IEmployeeExamsHistory) => {
    onStackOpenModal(modalName, {
      isPendingExams: true,
      examType: data.examType,
      hierarchyId: data.hierarchyId,
      companyId: data?.employee?.company?.id,
      employeeId: data?.employee?.id,
    } as Partial<typeof initialExamScheduleState>);
  };

  const getRowColor = (row: IEmployeeExamsHistory): ITableRowStatus => {
    if (row.status === StatusEnum.DONE) return 'info';
    if (row.status === StatusEnum.PROCESSING) return 'warn';
    if (row.status === StatusEnum.PENDING) return 'warn';
    if (row.status === StatusEnum.EXPIRED) return 'inactive';
    if (row.status === StatusEnum.CANCELED) return 'inactive';
  };

  return (
    <>
      {!hideTitle && (
        <>
          <SFlex mb={12} gap={10} align="center">
            <STableTitle mb={0}>Pedidos de Agenda</STableTitle>
            {/* <STagButton
              onClick={onAdd}
              maxWidth={120}
              mt={-5}
              mb={-5}
              icon={SAddIcon}
              text={'Novo exame'}
              active
              bg={'success.dark'}
              textProps={{ sx: { mb: 0 } }}
            /> */}
          </SFlex>
          {/* <STableSearch onChange={(e) => handleSearchChange(e.target.value)} /> */}
        </>
      )}
      <STable
        loading={loadQuery}
        rowsNumber={rowsPerPage}
        columns="150px 40px minmax(200px, 1fr) 120px minmax(220px, 1fr) 110px minmax(220px, 1fr)"
      >
        <STableHeader>
          <STableHRow>Data Pedido</STableHRow>
          <STableHRow>Uf</STableHRow>
          <STableHRow>Empresa</STableHRow>
          <STableHRow>CPF</STableHRow>
          <STableHRow>Nome</STableHRow>
          <STableHRow>Tipo Exame</STableHRow>
          <STableHRow>Agendado por</STableHRow>
        </STableHeader>
        <STableBody<typeof history[0]>
          rowsData={history
            .sort((a, b) => sortData(b.created_at, a.created_at))
            .sort((a, b) => sortData(b.doneDate, a.doneDate))}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
                status={getRowColor(row)}
              >
                <TextIconRow
                  text={
                    <>
                      {dateToString(row.doneDate) || '-'} &nbsp;&nbsp;{' '}
                      {row?.time || ''}
                    </>
                  }
                />
                <TextIconRow
                  clickable
                  text={row.employee?.company?.address?.state}
                />
                <TextIconRow
                  clickable
                  text={getCompanyName(row.employee?.company)}
                />
                <TextIconRow clickable text={cpfMask.mask(row.employee?.cpf)} />
                <TextIconRow clickable text={row.employee?.name} />
                <TextIconRow
                  text={employeeExamTypeMap[row.examType]?.content || '-'}
                />
                <TextUserRow clickable user={row?.userSchedule} />
              </STableRow>
            );
          }}
        />
      </STable>
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
