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
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import { initialEmployeeHistoryExamState } from 'components/organisms/modals/ModalAddEmployeeHistoryExam/hooks/useAddData';
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
import { useQueryHisExamEmployee } from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { dateToString } from 'core/utils/date/date-format';
import { sortData } from 'core/utils/sorts/data.sort';

export const HistoryEmployeeExamTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IEmployeeExamsHistory) => void;
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
  } = useQueryHisExamEmployee(
    page,
    { search, employeeId: employeeId },
    rowsPerPage,
    companyId,
  );

  const isSelect = !!onSelectData;
  const modalName = ModalEnum.EMPLOYEE_HISTORY_EXAM_ADD;

  const { onStackOpenModal } = useModal();

  const onAdd = () => {
    onStackOpenModal(modalName, {
      companyId,
      employeeId,
      employee,
      hierarchyId: employee?.hierarchyId,
      doneDate: new Date(),
    } as Partial<typeof initialEmployeeHistoryExamState>);
  };

  const onSelectRow = (data: IEmployeeExamsHistory) => {
    if (isSelect) {
      onSelectData(data);
    } else onEdit(data);
  };

  const onEdit = (data: IEmployeeExamsHistory) => {
    onStackOpenModal(modalName, {
      ...data,
      hierarchyId: employee?.hierarchyId,
      employeeId,
      companyId,
    } as Partial<typeof initialEmployeeHistoryExamState>);
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
            <STableTitle mb={0}>Histórico de Exames</STableTitle>
            <STagButton
              onClick={onAdd}
              maxWidth={120}
              mt={-5}
              mb={-5}
              icon={SAddIcon}
              text={'Novo exame'}
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
        columns="100px minmax(150px, 2fr) 100px 80px 100px 100px 85px 150px 150px 50px"
      >
        <STableHeader>
          <STableHRow>Data</STableHRow>
          <STableHRow>Exame</STableHRow>
          <STableHRow>Tipo</STableHRow>
          <STableHRow>Validade</STableHRow>
          <STableHRow>Vencimento</STableHRow>
          <STableHRow>Resultado</STableHRow>
          <STableHRow>Status</STableHRow>
          <STableHRow>Agendado por</STableHRow>
          <STableHRow>Finalizado por</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
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
                    (dateToString(row.doneDate) || '-') + ` ${row?.time || ''}`
                  }
                />
                <TextIconRow clickable text={row?.exam?.name || '-'} />
                <TextIconRow
                  text={employeeExamTypeMap[row.examType]?.content || '-'}
                />
                <TextIconRow
                  clickable
                  text={String(row?.validityInMonths || '-') + ' meses'}
                />
                <TextIconRow
                  clickable
                  text={
                    dayjs(row.doneDate)
                      .add(row.validityInMonths || 0, 'month')
                      .format('DD/MM/YYYY') || '-'
                  }
                />

                <TextIconRow
                  text={
                    employeeExamEvaluationTypeMap[row.evaluationType]
                      ?.content || '-'
                  }
                />
                <TextIconRow
                  clickable
                  text={statusOptionsConstantExam[row?.status].name || '-'}
                />
                <TextUserRow clickable user={row?.userSchedule} />
                <TextUserRow clickable user={row?.userDone} />
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
