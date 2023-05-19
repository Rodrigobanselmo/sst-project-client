/* eslint-disable react/display-name */
import { useImperativeHandle, useMemo, useRef } from 'react';
import React from 'react';
import {
  Control,
  FieldValues,
  UseFormSetValue,
  useForm,
} from 'react-hook-form';

import { Box, BoxProps } from '@mui/material';
import { SDropButton } from 'components/atoms/SDropButton/SDropButton';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHeader,
  STableRow,
} from 'components/atoms/STable';
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { SelectForm } from 'components/molecules/form/select';
import { onDownloadPdf } from 'components/molecules/SIconDownloadExam/SIconDownloadExam';
import { IMenuSearchOption } from 'components/molecules/SMenuSearch/types';
import { onGetExamPdfRoute } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/hooks/useEditExamData';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import {
  employeeExamScheduleTypeList,
  ExamHistoryTypeEnum,
} from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';
import sortArray from 'sort-array';

import { SDocumentIcon } from 'assets/icons/SDocumentIcon';
import { SDownloadIcon } from 'assets/icons/SDownloadIcon';
import { SCheckboxIcon } from 'assets/icons/SUncheckBoxIcon';

import { statusOptionsConstantEmployee } from 'core/constants/maps/status-options.constant';
import { IdsEnum } from 'core/enums/ids.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useTableSearch } from 'core/hooks/useTableSearch';
import {
  IEmployee,
  IEmployeeExamsHistory,
  IEmployeeInfoExam,
} from 'core/interfaces/api/IEmployee';
import { IExam } from 'core/interfaces/api/IExam';
import { useQueryEmployees } from 'core/services/hooks/queries/useQueryEmployees';
import { IQueryEmployeeHistHier } from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';

import {
  getEmployeeRowExamData,
  getEmployeeRowExpiredDate,
  getEmployeeRowExpiredDateText,
  getEmployeeRowStatus,
} from '../HistoryExpiredExamCompanyTable/HistoryExpiredExamCompanyTable';
import { NumSelected } from './NumSelected';

export type IEmployeeSelectedProps = Record<
  number,
  Record<
    number,
    {
      checked?: boolean;
      exam?: IExam;
      infoExam?: IEmployeeInfoExam[number];
    }
  >
>;
export type IEmployeeSelectedExamTypeProps = Record<
  number,
  ExamHistoryTypeEnum
>;

export const EmployeeScheduleMedicalVisitTable = React.forwardRef<
  any,
  BoxProps & {
    rowsPerPage?: number;
    scheduleMedicalVisitId?: number;
    companyId?: string;
    query?: IQueryEmployeeHistHier;
    initialSelectedData?: IEmployeeSelectedProps;
    control: Control<any, object>;
    setValue: UseFormSetValue<FieldValues>;
    employeeExamsHistorySelected?: IEmployeeExamsHistory[];
  }
>(
  (
    {
      rowsPerPage = 500,
      scheduleMedicalVisitId,
      companyId,
      initialSelectedData,
      query,
      control,
      setValue,
      employeeExamsHistorySelected,
      ...props
    },
    ref,
  ) => {
    const selectedRef = useRef<IEmployeeSelectedProps>(
      initialSelectedData || {},
    );
    const numRef = useRef<{ update: () => void }>(null);
    const selectedExamTypeRef = useRef<IEmployeeSelectedExamTypeProps>({});
    const { enqueueSnackbar } = useSnackbar();

    useImperativeHandle(ref, () => ({
      getData: () => {
        return {
          data: selectedRef.current,
          examTypes: selectedExamTypeRef.current,
        };
      },
      reset: () => {
        selectedRef.current = initialSelectedData || {};
        selectedExamTypeRef.current = {};
      },
    }));

    const {
      data: employees,
      isLoading: loadQuery,
      count,
      isFetching,
      isRefetching,
      exams,
    } = useQueryEmployees(
      1,
      {
        disabled: !companyId,
        companyId,
        getAllExams: true,
        getAllExamsWithSchedule: true,
        noPagination: true,
        ...query,
      },
      rowsPerPage,
    );

    const { handleSearchChange, results, page, setPage } = useTableSearch({
      data: employees,
      keys: ['name', 'cpf', 'rg'],
      rowsPerPage,
      minLengthSearch: 2,
      transformSearchTextBefore: (text: string) => text.replace(/[.-]/g, ''),
    });

    const filterProps = useFilterTable(undefined, {
      key: 'employeeScheduleMedicalVisitTable',
      timeout: 60 * 60 * 1000,
      setPage,
    });

    const employeeExamsSelect = useMemo(
      () =>
        employeeExamsHistorySelected?.reduce((acc, curr) => {
          if (!acc[curr.employeeId]) acc[curr.employeeId] = {};
          acc[curr.employeeId][curr.examId] = curr;

          return acc;
        }, {} as Record<number, Record<number, IEmployeeExamsHistory>>),
      [employeeExamsHistorySelected],
    );

    // const { onStackOpenModal } = useModal();

    // const onAdd = () => {
    //   onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE);
    // };

    const onSelectExamType = async (
      row: IEmployee,
      examType: ExamHistoryTypeEnum,
    ) => {
      selectedExamTypeRef.current[row.id] = examType;
    };

    const onSelectRef = ({
      employee,
      examId,
      checked,
    }: {
      employee: IEmployee;
      examId: number;
      checked?: boolean;
    }) => {
      const employeeId = employee.id;

      {
        if (!selectedRef.current[employeeId])
          selectedRef.current[employeeId] = {};
        if (!selectedRef.current[employeeId][examId])
          selectedRef.current[employeeId][examId] = {};
      }

      {
        selectedRef.current[employeeId][examId].checked = checked;

        if (!selectedRef.current[employeeId][examId].exam) {
          selectedRef.current[employeeId][examId].exam = exams.find(
            (exam) => exam.id == examId,
          );
        }

        if (!selectedRef.current[employeeId][examId].infoExam) {
          selectedRef.current[employeeId][examId].infoExam =
            employee?.infoExams?.[examId];
        }
      }
    };

    const onSelectEmployeeExam = async ({
      employee,
      examId,
      checked,
    }: {
      employee: IEmployee;
      examId: number;
      checked?: boolean;
    }) => {
      const employeeId = employee.id;

      if (!selectedRef.current[employeeId])
        selectedRef.current[employeeId] = {};
      if (!selectedRef.current[employeeId][examId])
        selectedRef.current[employeeId][examId] = {};

      if (checked !== undefined) {
        onSelectRef({ employee, examId, checked });
      } else {
        const checkedNewValue =
          !selectedRef.current[employeeId][examId]?.checked;

        if (
          !checkedNewValue &&
          Object.values(selectedRef.current[employeeId]).filter(
            (v) => v?.checked,
          ).length === 1
        ) {
          setCheckboxChecked(employeeId, false);
        }

        if (
          Object.values(selectedRef.current[employeeId]).every(
            (v) => !v?.checked,
          )
        ) {
          setCheckboxChecked(employeeId, true);
        }

        onSelectRef({ employee, examId, checked: checkedNewValue });
      }
    };

    const onSelectEmployee = (row: IEmployee) => {
      numRef.current?.update();

      const selected = selectedRef.current?.[row.id];

      if (selected && Object.values(selected).some((v) => v?.checked)) {
        setAllCheckboxesChecked({ employee: row, checked: false });
      } else if (
        !selected ||
        Object.values(selected).every((v) => !v?.checked)
      ) {
        setAllCheckboxesChecked({ employee: row, checked: true });
      }
    };

    const onClickEmployeeExam = async (
      row: IEmployee,
      exam: { id: number },
    ) => {
      numRef.current?.update();
      onSelectEmployeeExam({
        employee: row,
        examId: exam.id,
      });
    };

    const onClickEmployeeExamCell = async (
      row: IEmployee,
      exam: { id: number },
    ) => {
      numRef.current?.update();

      document
        .getElementById(
          `schedule_medical_visit_table_checkbox_${row.id}_${exam.id}`,
        )
        ?.click();
    };

    const onClickEmployeeCheck = async (employeeId: number) => {
      numRef.current?.update();
      document
        .getElementById(`schedule_medical_visit_table_checkbox_${employeeId}`)
        ?.click();
    };

    const onClickEmployeeCell = async (row: IEmployee) => {
      numRef.current?.update();
      onClickEmployeeCheck(row.id);
    };

    function setAllCheckboxesChecked({
      employee,
      checked,
    }: {
      employee: IEmployee;
      checked: boolean;
    }) {
      const employeeId = employee.id;
      numRef.current?.update();
      const checkboxes = document.querySelectorAll<HTMLInputElement>(
        `.schedule_medical_visit_table_checkbox_${employeeId}`,
      );
      checkboxes.forEach((checkbox) => {
        const idCheckbox = checkbox.id.split('_');
        const examId = idCheckbox[idCheckbox.length - 1];

        onSelectEmployeeExam({ employee, examId: Number(examId), checked });

        checkbox.checked = checked;
      });
    }

    function setCheckboxChecked(employeeId: number, checked: boolean) {
      numRef.current?.update();
      const checkbox = document.getElementById(
        `schedule_medical_visit_table_checkbox_${employeeId}`,
      ) as HTMLInputElement;

      checkbox.checked = !!checked;
    }

    function onSelectExpiredExams() {
      numRef.current?.update();
      let isChecked = false;
      let pass = false;

      employees.forEach((employee) => {
        employee.infoExams &&
          Object.values(employee.infoExams)?.forEach((exam) => {
            const attendanceExpired =
              dayjs(employee.expiredDateExam).isBefore(dayjs()) &&
              exam?.isAttendance;

            const isExpired =
              !exam?.expiredDate || dayjs(exam?.expiredDate).isBefore(dayjs());

            const employeeExam = employeeExamsSelect?.[employee.id];
            const examOnVisit = employeeExam?.[exam.examId];

            const select =
              exam?.closeToExpired || isExpired || attendanceExpired;

            if (select && !examOnVisit) {
              const checked =
                !!selectedRef.current?.[employee.id]?.[exam.examId]?.checked;
              if (checked && !pass) {
                isChecked = true;
              }

              pass = true;

              if (isChecked == checked)
                onClickEmployeeExamCell(employee, { id: exam.examId });
            }
          });
      });
    }

    function onDownloadAso(option: IMenuSearchOption) {
      if (!scheduleMedicalVisitId)
        enqueueSnackbar('Crie a Visita médica antes de baixar o ASO', {
          variant: 'error',
          autoHideDuration: 1500,
        });

      const map: Record<any, { handle: () => void }> = {
        1: {
          handle: () => {
            onDownloadPdf(onGetExamPdfRoute({ isAvaliation: false }), {
              companyId,
              scheduleMedicalVisitId,
            });
          },
        },
        2: {
          handle: () => {
            onDownloadPdf(onGetExamPdfRoute({ isAvaliation: false }), {
              companyId,
              withDate: true,
              scheduleMedicalVisitId,
            });
          },
        },
      };

      if (option.value) map[option.value]?.handle();
    }

    function onDownloadVisitReport() {
      if (!scheduleMedicalVisitId)
        enqueueSnackbar('Crie a Visita médica antes de baixar o ASO', {
          variant: 'error',
          autoHideDuration: 1500,
        });

      onDownloadPdf(RoutesEnum.PDF_VISIT_REPORT, {
        companyId,
        withDate: true,
        scheduleMedicalVisitId,
      });
    }

    const sortedExams = sortArray(exams, { by: 'isAttendance', order: 'desc' });

    const header: (BoxProps & { text: string; column: string })[] = [
      // { text: 'Funcionário', column: '200px' },
      { text: 'Funcionário', column: 'minmax(250px, 1fr)' },
      { text: 'Cargo', column: '190px' },
      { text: 'Válidade', column: '180px' },
      { text: 'Status', column: '90px' },
      { text: 'Tipo de exame', column: '200px' },
      ...sortedExams.map((exam) => {
        return {
          text: exam.name,
          column: '180px',
          // ...(exam.isAttendance && { text: 'Exame Clínico' })
        };
      }),
      // { text: 'Editar', column: '40px', justifyContent: 'center' },
    ];

    return (
      <Box {...props}>
        <STableSearch
          // onAddClick={onAdd}
          boxProps={{ sx: { flex: 1, maxWidth: 400 } }}
          addText="Agendar"
          placeholder="Pesquisar por nome, cpf, email, matrícula..."
          onChange={(e) => handleSearchChange(e.target.value)}
          loadingReload={loadQuery || isFetching || isRefetching}
          // onReloadClick={onRefetchThrottle}
          // filterProps={{ filters: expiredExamFilterList, ...filterProps }}
        />

        <FilterTagList filterProps={filterProps} />
        <SFlex
          p={6}
          py={4}
          mt={-2}
          mb={2}
          border={'1px solid'}
          borderColor={'grey.300'}
          borderRadius={1}
          sx={{ backgroundColor: 'background.paper' }}
        >
          <NumSelected
            {...(employeeExamsHistorySelected?.length &&
              employeeExamsSelect && {
                numSelected: Object.keys(employeeExamsSelect).length,
              })}
            ref={numRef}
            selectedRef={selectedRef}
            mr="auto"
          />
          <STagButton
            icon={SDocumentIcon}
            text={'Baixar Relatório'}
            onClick={onDownloadVisitReport}
          />
          <SDropButton
            icon={SDocumentIcon}
            text="Baixar ASO"
            onSelect={onDownloadAso}
            options={[
              {
                name: 'Imprimir ASOs',
                icon: SDownloadIcon,
                value: 1,
              },
              {
                name: 'Imprimir ASOs (c/ data)',
                icon: SDownloadIcon,
                value: 2,
              },
            ]}
          />
        </SFlex>
        <STable
          loading={loadQuery}
          position="relative"
          rowsNumber={rowsPerPage}
          columns={header.map(({ column }) => column).join(' ')}
        >
          <STableHeader
            sx={{
              backgroundColor: 'grey.50',
            }}
            position={'sticky'}
            top={0}
            py={0}
            zIndex={3}
          >
            {header.map(({ column, text, ...props }, index) => (
              <STooltip
                withWrapper
                title={text}
                key={text}
                boxProps={{
                  ...props,
                  py: 6,
                  display: 'flex',
                  sx: {
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                    backgroundColor: 'grey.50',
                    height: '100%',
                    position: 'relative',
                    ':before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      left: '-10px',
                      minWidth: '10px',
                      height: '100%',
                      backgroundColor: 'grey.50',
                      zIndex: 100,
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    },
                    ...(index == 0 && {
                      position: 'sticky',
                      left: 0,
                      zIndex: 101,
                    }),
                    ...(index == header.length - 1 && {
                      ':after': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: '-16px',
                        minWidth: '16px',
                        height: '100%',
                        backgroundColor: 'grey.50',
                        zIndex: 100,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                      },
                    }),
                  },
                }}
              >
                <>
                  {index == 0 && (
                    <STagButton
                      icon={SCheckboxIcon}
                      width="25px"
                      text={''}
                      mr={5}
                      onClick={onSelectExpiredExams}
                    />
                  )}
                  <SText
                    sx={{ backgroundColor: 'grey.50', height: '100%', flex: 1 }}
                    noBreak
                    fontSize={13}
                    // {...{ px: 6, py: 4, mb: 2 }}
                  >
                    {text}
                  </SText>
                </>
              </STooltip>
            ))}
          </STableHeader>

          <STableBody<typeof employees[0]>
            rowsData={results}
            maxHeight={'calc(100vh - 280px)'}
            hideLoadMore
            rowsInitialNumber={rowsPerPage}
            renderRow={(row) => {
              const { status, validity, employee } =
                getEmployeeRowExamData(row);
              const employeeChecked = selectedRef.current[row.id];
              const examTypeLits = employeeExamScheduleTypeList(employee);
              const employeeExam = employeeExamsSelect?.[row.id];

              return (
                <STableRow
                  key={row.id}
                  clickable
                  position={'relative'}
                  // onClick={() => onClickRow(row)}
                  {...(employeeExam && { status: 'info' })}
                >
                  <SFlex
                    position={'sticky'}
                    left={0}
                    zIndex={2}
                    className="table-row-checkbox"
                    gap={5}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickEmployeeCell(row);
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`schedule_medical_visit_table_checkbox_${row.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmployee(row);
                      }}
                      disabled={!!employeeExam}
                      defaultChecked={
                        !!employeeExam ||
                        (employeeChecked &&
                          Object.values(employeeChecked).some((v) => v))
                      }
                    />
                    <TextEmployeeRow employee={employee} />
                  </SFlex>
                  <TextIconRow
                    text={employee.hierarchy?.name}
                    fontSize={12}
                    mr={3}
                  />
                  <SFlex align="center">
                    <Box
                      sx={{
                        minWidth: '7px',
                        minHeight: '7px',
                        maxWidth: '7px',
                        maxHeight: '7px',
                        borderRadius: 1,
                        backgroundColor: status.color,
                      }}
                    />
                    <TextIconRow
                      lineNumber={1}
                      fontSize={11}
                      color="text.light"
                      sx={{ textDecoration: 'underline' }}
                      justifyContent="center"
                      text={validity}
                    />
                  </SFlex>
                  <SFlex direction="column" mr={5}>
                    <StatusSelect
                      selected={employee.statusStep || employee.status}
                      large={false}
                      disabled
                      iconProps={{ sx: { fontSize: 10 } }}
                      textProps={{ sx: { fontSize: 10 } }}
                      width={'100%'}
                      sx={{ width: '100%' }}
                      options={statusOptionsConstantEmployee}
                      statusOptions={[]}
                    />
                  </SFlex>
                  <SFlex center zIndex={1}>
                    <SelectForm
                      unmountOnChangeDefault
                      setValue={setValue}
                      defaultValue={
                        selectedExamTypeRef.current[row.id] ||
                        (employeeExam &&
                          Object.values(employeeExam)?.[0]?.examType) ||
                        examTypeLits[0].value
                      }
                      label=""
                      labelPosition="top"
                      control={control}
                      placeholder="selecione..."
                      disabled={!!employeeExam}
                      superSmall
                      name={IdsEnum.EMPLOYEE_SCHEDULE_MEDICAL_EXAM_TYPE_CHECKBOX.replace(
                        ':id',
                        String(row.id),
                      )}
                      onChange={(e) => {
                        e.stopPropagation();
                        const examType = (e as any).target.value;
                        onSelectExamType(row, examType as ExamHistoryTypeEnum);
                      }}
                      size="small"
                      options={examTypeLits}
                      boxProps={{ flex: 1, maxWidth: 200 }}
                    />
                  </SFlex>
                  {sortedExams.map((exam) => {
                    const examFound = row.infoExams?.[exam.id];

                    if (!examFound) return <div />;

                    const examsHistory = row.examsHistory?.filter(
                      (hExam) => hExam.examId === exam.id,
                    );

                    const examHistoryData = examsHistory?.[0];

                    const status = getEmployeeRowStatus(
                      examHistoryData,
                      examFound.expiredDate,
                    );

                    const isScheduled =
                      examHistoryData?.status == StatusEnum.PROCESSING;

                    const validity = getEmployeeRowExpiredDate(
                      isScheduled
                        ? examHistoryData.doneDate
                        : examFound?.expiredDate,
                    );

                    const textNext = getEmployeeRowExpiredDateText(
                      employee,
                      status.status,
                      examHistoryData,
                    ).textNext;

                    const examOnVisit = employeeExam?.[exam.id];

                    return (
                      <SFlex
                        onClick={(e) => {
                          e.stopPropagation();
                          onClickEmployeeExamCell(row, exam);
                        }}
                        key={exam.id}
                        align="center"
                      >
                        <input
                          type="checkbox"
                          id={`schedule_medical_visit_table_checkbox_${row.id}_${exam.id}`}
                          className={`schedule_medical_visit_table_checkbox_${row.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClickEmployeeExam(row, exam);
                          }}
                          disabled={!!examOnVisit}
                          defaultChecked={
                            !!examOnVisit ||
                            !!selectedRef.current?.[row.id]?.[exam.id]?.checked
                          }
                        />
                        {/* <BpCheckbox
                        id={`schedule_medical_visit_table_checkbox_${row.id}_${exam.id}`}
                        className={`schedule_medical_visit_table_checkbox_${row.id}`}
                      /> */}
                        <Box
                          sx={{
                            minWidth: '7px',
                            minHeight: '7px',
                            maxWidth: '7px',
                            maxHeight: '7px',
                            borderRadius: 1,
                            backgroundColor: status.color,
                          }}
                        />
                        <TextIconRow
                          lineNumber={1}
                          fontSize={11}
                          color="text.light"
                          sx={{ textDecoration: 'underline' }}
                          justifyContent="center"
                          text={textNext + validity}
                        />
                      </SFlex>
                    );
                  })}
                  {/* <SFlex center> */}
                  {/* <SDropIconEmployee
                      employee={employee}
                      company={{
                        ...employee.company,
                        id: employee.companyId,
                      }}
                      loading={loadQuery || isFetching || isRefetching}
                      isScheduled={isScheduled}
                      isExpired={isExpired}
                      onEditEmployee={onEditEmployee}
                      canSchedule={canScheduleWith45Days}
                      exam={exam}
                      skipOS
                      skipGuia
                    /> */}
                  {/* </SFlex> */}
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
  },
);
