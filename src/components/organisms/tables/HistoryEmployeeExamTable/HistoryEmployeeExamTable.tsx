import { FC } from 'react';

import { BoxProps, Icon } from '@mui/material';
import { Box } from '@mui/system';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
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
import SText from 'components/atoms/SText';
import { SIconUploadFile } from 'components/molecules/SIconUploadFile/SIconUploadFile';
import { initialEmployeeHistoryExamState } from 'components/organisms/modals/ModalAddEmployeeHistoryExam/hooks/useAddData';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';
import dayjs from 'dayjs';
import { employeeExamEvaluationTypeMap } from 'project/enum/employee-exam-history-evaluation.enum';
import { employeeExamTypeMap } from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { useMutUploadEmployeeHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUploadEmployeeHisExam/useMutUploadEmployeeHisExam';
import { useMutUpdateEmployee } from 'core/services/hooks/mutations/manager/useMutUpdateEmployee';
import {
  IQueryEmployeeHistHier,
  useQueryHisExamEmployee,
} from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { dateToString } from 'core/utils/date/date-format';
import { sortDate } from 'core/utils/sorts/data.sort';

export const HistoryEmployeeExamTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IEmployeeExamsHistory) => void;
    hideTitle?: boolean;
    companyId?: string;
    employeeId?: number;
    employee?: IEmployee;
    query?: IQueryEmployeeHistHier;
  }
> = ({
  rowsPerPage = 8,
  onSelectData,
  hideTitle,
  companyId,
  employeeId,
  employee,
  query,
}) => {
  const { search, page, setPage } = useTableSearchAsync();
  const uploadMutation = useMutUploadEmployeeHisExam();
  const updateEmployee = useMutUpdateEmployee();

  const {
    data: history,
    isLoading: loadQuery,
    count,
    _companyId,
  } = useQueryHisExamEmployee(
    page,
    { search, employeeId: employeeId, ...query },
    rowsPerPage,
    companyId || employee?.companyId,
  );

  const isSelect = !!onSelectData;
  const modalName = ModalEnum.EMPLOYEE_HISTORY_EXAM_ADD;

  const { onStackOpenModal } = useModal();

  const onAdd = () => {
    onStackOpenModal(modalName, {
      companyId: _companyId,
      employeeId,
      employee,
      hierarchyId: employee?.hierarchyId,
      doneDate: new Date(),
    } as Partial<typeof initialEmployeeHistoryExamState>);
  };

  const onAddExamBefore = () => {
    if (employeeId)
      onStackOpenModal(ModalEnum.MODAL_BLANK, {
        onSelect: (data: any) => {
          updateEmployee
            .mutateAsync({ lastExam: data.startDate, id: employeeId })
            .catch(() => {});
        },
        content: (setData: any, data: any) => (
          <SFlex direction="row" gap={10} mb={150}>
            <SDatePicker
              inputProps={{
                labelPosition: 'top',
                ...((data?.errorMessage || data?.error) && {
                  error: true,
                  helperText: data?.errorMessage,
                }),
              }}
              placeholderText="__/__/__"
              selected={data.startDate}
              label={'Data do Exame Anterior ao Contrato'}
              onChange={(date) => {
                setData((d: any) => ({ ...d, startDate: date }));
              }}
            />
          </SFlex>
        ),
      } as Partial<typeof initialBlankState>);
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

  const uploadExam = async ({
    ids,
    file,
    companyId,
  }: {
    ids: number[];
    file: File;
    companyId?: string;
  }) => {
    await uploadMutation.mutateAsync({
      ids,
      companyId,
      file,
    });
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
            <STagButton
              onClick={onAddExamBefore}
              maxWidth={220}
              mt={-5}
              mb={-5}
              icon={SAddIcon}
              text={'Exame anterior contrato'}
              active
              bg={'grey.500'}
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
        columns="100px minmax(150px, 2fr) 100px 80px 100px 100px 85px 150px 150px 80px"
      >
        <STableHeader>
          <STableHRow>Data</STableHRow>
          <STableHRow>Exame</STableHRow>
          <STableHRow>Tipo</STableHRow>
          <STableHRow>Peridiocidade</STableHRow>
          <STableHRow>Vencimento</STableHRow>
          <STableHRow>Resultado</STableHRow>
          <STableHRow>Status</STableHRow>
          <STableHRow>Agendado por</STableHRow>
          <STableHRow>Finalizado por</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof history[0]>
          rowsData={
            history
            // .sort((a, b) => sortDate(b.created_at, a.created_at))
            // .sort((a, b) => sortDate(b.doneDate, a.doneDate))
          }
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
                <SFlex>
                  <IconButtonRow
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row);
                    }}
                    icon={<EditIcon />}
                  />
                  <SIconUploadFile
                    loading={uploadMutation.isLoading}
                    disabledDownload={!row.fileUrl}
                    isActive={!!row.fileUrl}
                    downloadPath={
                      ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM +
                      `/${row.id}/download/${_companyId}`
                    }
                    onUpload={(file) =>
                      uploadExam({
                        file,
                        ids: [row.id],
                        companyId: _companyId,
                      })
                    }
                  />
                </SFlex>
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      {employee?.lastExam && (
        <SFlex
          align={'center'}
          justifyContent={'space-between'}
          sx={{
            mt: 2,
            mb: 4,
            backgroundColor: 'background.box',
            px: 10,
            py: 3,
            border: '1px solid',
            borderColor: 'grey.400',
            borderRadius: 4,
          }}
        >
          <SText sx={{ mt: 0, fontSize: 13 }}>
            Exame Anterior ao Contrato: {dateToString(employee?.lastExam)}
          </SText>
          <SIconButton
            onClick={() =>
              updateEmployee
                .mutateAsync({ lastExam: null, id: employeeId })
                .catch(() => {})
            }
            sx={{ height: 30, width: 50 }}
          >
            <SText sx={{ mt: 0, fontSize: 12 }}>deletar</SText>
            <Icon component={SDeleteIcon} sx={{ fontSize: 14 }} />
          </SIconButton>
        </SFlex>
      )}
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
