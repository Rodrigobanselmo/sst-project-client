import { FC } from 'react';

import { Box, BoxProps } from '@mui/material';
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
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import TextUserRow from 'components/atoms/STable/components/Rows/TextUserRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
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
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';
import { getCompanyName } from 'core/utils/helpers/companyName';
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
> = ({
  rowsPerPage = 15,
  onSelectData,
  hideTitle,
  companyId,
  employeeId,
  ...props
}) => {
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

  const getRowColor = (
    row: IEmployeeExamsHistory,
  ): ITableRowStatus | undefined => {
    // if (row.status === StatusEnum.DONE) return 'info';
    // if (row.status === StatusEnum.PROCESSING) return 'warn';
    // if (row.status === StatusEnum.PENDING) return 'warn';
    // if (row.status === StatusEnum.EXPIRED) return 'inactive';
    // if (row.status === StatusEnum.CANCELED) return 'inactive';
    return undefined;
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Data Pedido', column: '150px' },
    { text: 'Uf', column: '40px' },
    { text: 'Empresa', column: '200px' },
    { text: 'Funcionário', column: 'minmax(150px, 1fr)' },
    { text: 'Tipo Exame', column: '110px' },
    { text: 'Agendado por', column: '200px' },
  ];

  return (
    <Box {...props}>
      {!hideTitle && (
        <>
          <SFlex mb={12} gap={10} align="center">
            <STableTitle mb={0}>Pedidos de Agenda</STableTitle>
          </SFlex>
          {/* <STableSearch onChange={(e) => handleSearchChange(e.target.value)} /> */}
        </>
      )}
      <STable
        loading={loadQuery}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ column, text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
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
                      {dateToString(row.created_at) || '-'} &nbsp;&nbsp;
                      {dateToTimeString(row.created_at) || ''}
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
                <TextEmployeeRow employee={row.employee} />
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
    </Box>
  );
};
