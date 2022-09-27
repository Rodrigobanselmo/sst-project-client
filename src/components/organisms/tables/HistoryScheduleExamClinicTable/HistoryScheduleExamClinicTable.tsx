import { FC, useMemo, useState } from 'react';

import { BoxProps } from '@mui/material';
import clone from 'clone';
import SFlex from 'components/atoms/SFlex';
import {
  ITableRowStatus,
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import { TextCompanyRow } from 'components/atoms/STable/components/Rows/TextCompanyRow';
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SText from 'components/atoms/SText';
import { ModalEditEmployeeHisExamClinic } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/ModalEditEmployeeHisExamClinic';
import { EvaluationSelect } from 'components/organisms/tagSelects/EvaluationSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import {
  employeeExamTypeMap,
  ExamHistoryTypeEnum,
} from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { useMutUpdateManyScheduleHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateManyScheduleHisExam/useMutUpdateManyScheduleHisExam';
import { IQueryEmployeeHistHier } from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { useQueryHisScheduleExamClinic } from 'core/services/hooks/queries/useQueryHisScheduleExamClinic/useQueryHisScheduleExamClinic';
import { sortData } from 'core/utils/sorts/data.sort';
import { sortNumber } from 'core/utils/sorts/number.sort';

import { PersonalDatePicker } from './PersonalDatePicker';

export const HistoryScheduleExamClinicTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IEmployeeExamsHistory) => void;
    hideTitle?: boolean;
    companyId?: string;
    employeeId?: number;
    employee?: IEmployee;
    query?: IQueryEmployeeHistHier;
  }
> = ({ rowsPerPage = 12, onSelectData, hideTitle, companyId, query }) => {
  const [actualDate, setActualDate] = useState(dayjs().toDate());

  const { data: employee, isLoading: loadQuery } =
    useQueryHisScheduleExamClinic({
      date: actualDate,
      companyId,
      ...query,
    });

  const isSelect = !!onSelectData;

  const dayTableRows = useMemo(() => {
    const data: (IEmployee & {
      time: string;
      examType?: ExamHistoryTypeEnum;
    })[] = [];

    employee.forEach((employee) => {
      const time: any = {};

      employee.examsHistory?.forEach((exam) => {
        if (time[exam.time]) return;
        time[exam.time] = true;
        const cloneEmployee = clone(employee);

        cloneEmployee.examsHistory =
          cloneEmployee?.examsHistory?.filter((e) => e.time == exam.time) || [];

        data.push({
          ...cloneEmployee,
          time: exam.time,
          examType: cloneEmployee?.examsHistory?.find((e) => e.examType)
            ?.examType,
        });
      });
    });

    return data
      .sort((a, b) => sortData(a.created_at, b.created_at))
      .sort((a, b) =>
        sortNumber(
          Number(a?.examsHistory?.[0]?.time.replace(':', '')),
          Number(b?.examsHistory?.[0]?.time.replace(':', '')),
        ),
      );
  }, [employee]);

  const { handleSearchChange, results } = useTableSearch({
    data: dayTableRows,
    keys: ['name'],
  });

  const updateMutation = useMutUpdateManyScheduleHisExam();
  const { onStackOpenModal } = useModal();

  const onSelectRow = (data: IEmployee) => {
    if (isSelect) {
      // onSelectData(data);
    } else onEdit(employee.find((e) => e.id === data.id));
  };

  const onEdit = (data?: IEmployee) => {
    if (data)
      onStackOpenModal(ModalEnum.EMPLOYEE_HISTORY_EXAM_EDIT_CLINIC, data);
  };

  const onChangeStatus = (data?: Partial<IEmployeeExamsHistory>) => {
    if (data && data.id && data.employeeId) {
      updateMutation.mutateAsync({
        isClinic: true,
        data: [{ employeeId: data.employeeId, id: data.id, ...data }],
      });
    }
  };

  const getRowColor = (status: StatusEnum): ITableRowStatus | undefined => {
    if (status === StatusEnum.DONE) return 'info';
    if (status === StatusEnum.EXPIRED) return 'inactive';
    if (status === StatusEnum.CANCELED) return 'inactive';
    return undefined;
  };

  const getStatus = (
    status: StatusEnum,
    date: Date,
    time: string,
  ): StatusEnum => {
    if (status === StatusEnum.PROCESSING) {
      if (dayjs(date).isBefore(new Date())) return StatusEnum.PENDING;

      const actualTime = Number(dayjs().format('HHmm'));
      const examTime = Number(time.replace(':', ''));

      if (actualTime > examTime) return StatusEnum.PENDING;
    }
    return status;
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Hora', column: '50px' },
    { text: 'Empresa', column: '150px' },
    { text: 'Funcionário', column: '200px' },
    { text: 'Tipo', column: '80px' },
    { text: 'Status', column: '110px', justifyContent: 'center' },
    { text: 'Exame', column: 'minmax(150px, 1fr)' },
    { text: 'Resultado', column: '100px', justifyContent: 'center', pr: 5 },
  ];

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>Exames Agendados</STableTitle>
          <STableSearch
            boxProps={{ sx: { flex: 1, maxWidth: 300 } }}
            addText="Agendar Exame"
            placeholder="Pesquisar por nome, cpf"
            onChange={(e) => handleSearchChange(e.target.value)}
          >
            <PersonalDatePicker
              actualDate={actualDate}
              onChangeDate={(date) => setActualDate(date)}
            />
          </STableSearch>
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
        <STableBody<typeof dayTableRows[0]>
          rowsData={results}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                key={row.id}
                clickable
                onClick={() => onSelectRow(row)}
                pr={10}
                // status={getRowColor(row.status)}
              >
                <TextIconRow text={row?.time} />
                <TextCompanyRow company={row.company} />
                <TextEmployeeRow employee={row} />
                <TextIconRow
                  text={
                    row.examType
                      ? employeeExamTypeMap[row.examType]?.content
                      : '-'
                  }
                />

                <SFlex direction="column">
                  {row.examsHistory?.map((historyExam) => {
                    if (!historyExam.exam) return null;
                    const options = statusOptionsConstantExam;
                    options[StatusEnum.PENDING].name = 'Pendente';
                    options[StatusEnum.PROCESSING].color = 'info.main';

                    return (
                      <StatusSelect
                        key={historyExam.exam.id}
                        selected={getStatus(
                          historyExam.status,
                          historyExam.doneDate,
                          historyExam.time,
                        )}
                        large={false}
                        width={'100%'}
                        sx={{ width: '100%' }}
                        options={statusOptionsConstantExam}
                        statusOptions={[
                          StatusEnum.DONE,
                          StatusEnum.PROCESSING,
                          StatusEnum.INACTIVE,
                        ]}
                        handleSelectMenu={(option) =>
                          onChangeStatus({
                            id: historyExam.id,
                            employeeId: row.id,
                            status: option.value,
                          })
                        }
                      />
                    );
                  })}
                </SFlex>

                <SFlex direction="column">
                  {row.examsHistory?.map((historyExam) => {
                    if (!historyExam.exam) return null;

                    return (
                      <SText
                        key={historyExam.exam.id}
                        fontSize={13}
                        lineNumber={1}
                        mt={1}
                      >
                        {historyExam.exam.name}
                      </SText>
                    );
                  })}
                </SFlex>

                <SFlex direction="column">
                  {row.examsHistory?.map((historyExam) => {
                    if (!historyExam.exam) return null;

                    return (
                      <SFlex key={historyExam.exam.id}>
                        {historyExam.exam?.isAttendance &&
                        historyExam.doctor ? (
                          <EvaluationSelect
                            selected={historyExam.evaluationType}
                            large={false}
                            sx={{
                              minWidth: '110px',
                              maxWidth: '110px',
                            }}
                            handleSelectMenu={(option) =>
                              onChangeStatus({
                                id: historyExam.id,
                                employeeId: row.id,
                                evaluationType: option.value,
                              })
                            }
                          />
                        ) : (
                          <SText
                            fontSize={13}
                            lineNumber={1}
                            sx={{ opacity: 0 }}
                            mt={1}
                          >
                            -
                          </SText>
                        )}
                      </SFlex>
                    );
                  })}
                </SFlex>

                {/* <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                  icon={<SCalendarIcon sx={{ color: 'info.dark' }} />}
                /> */}
                {/* <IconButtonRow
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
          icon={<SCancelIcon sx={{ color: 'error.dark' }} />}
        /> */}
              </STableRow>
            );
          }}
        />
      </STable>
      <ModalEditEmployeeHisExamClinic />
    </>
  );
};
