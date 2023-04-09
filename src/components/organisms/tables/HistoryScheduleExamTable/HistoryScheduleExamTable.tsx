import { FC, ReactNode } from 'react';

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
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import TextUserRow from 'components/atoms/STable/components/Rows/TextUserRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SText from 'components/atoms/SText';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { SIconUploadFile } from 'components/molecules/SIconUploadFile/SIconUploadFile';
import { initialEmployeeHistoryExamState } from 'components/organisms/modals/ModalAddEmployeeHistoryExam/hooks/useAddData';
import {
  ModalAddEmployeeHistoryExam,
  StackModalAddEmployeeHistoryExam,
} from 'components/organisms/modals/ModalAddEmployeeHistoryExam/ModalAddEmployeeHistoryExam';
import { initialExamScheduleState } from 'components/organisms/modals/ModalAddExamSchedule/hooks/useEditExamEmployee';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { employeeExamTypeMap } from 'project/enum/employee-exam-history-type.enum';
import { PermissionEnum } from 'project/enum/permission.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SCalendarIcon from 'assets/icons/SCalendarIcon';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useThrottle } from 'core/hooks/useThrottle';
import { IAddress } from 'core/interfaces/api/ICompany';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { useMutUploadEmployeeHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUploadEmployeeHisExam/useMutUploadEmployeeHisExam';
import {
  IQueryEmployeeHistHier,
  useQueryHisExamEmployee,
} from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { queryClient } from 'core/services/queryClient';
import { dateToString } from 'core/utils/date/date-format';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { cepMask } from 'core/utils/masks/cep.mask';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { sortDate } from 'core/utils/sorts/data.sort';

export const HistoryScheduleExamTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IEmployeeExamsHistory) => void;
    hideTitle?: boolean;
    companyId?: string;
    employeeId?: number;
    employee?: IEmployee;
    query?: IQueryEmployeeHistHier;
    isPending?: boolean;
    isHideEmpty?: boolean;
  }
> = ({
  rowsPerPage = 12,
  onSelectData,
  hideTitle,
  companyId,
  query,
  isPending,
  isHideEmpty,
  ...props
}) => {
  const { search, page, setPage, handleSearchChange } = useTableSearchAsync();
  const uploadMutation = useMutUploadEmployeeHisExam();

  const {
    data: history,
    isLoading: loadQuery,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryHisExamEmployee(
    page,
    {
      search,
      status: isPending
        ? [StatusEnum.PENDING]
        : [StatusEnum.PROCESSING, StatusEnum.DONE, StatusEnum.CANCELED],
      orderByCreation: true,
      includeClinic: true,
      allCompanies: true,
      ...query,
    },
    rowsPerPage,
    companyId,
  );

  const isSelect = !!onSelectData;

  const { onStackOpenModal } = useModal();

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    // invalidate next or previous pages
    queryClient.invalidateQueries([QueryEnum.EMPLOYEE_HISTORY_EXAM]);
  }, 1000);

  const onAdd = () => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE);
  };

  const onSelectRow = (data: IEmployeeExamsHistory) => {
    if (isSelect) {
      onSelectData(data);
    } else onEdit(data);
  };

  const onReSchedule = (data: IEmployeeExamsHistory) => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE, {
      examType: data.examType,
      hierarchyId: data.hierarchyId,
      companyId: data?.employee?.companyId,
      employeeId: data?.employee?.id,
    } as Partial<typeof initialExamScheduleState>);
  };

  const onEdit = (data: IEmployeeExamsHistory) => {
    onStackOpenModal(ModalEnum.EMPLOYEE_HISTORY_EXAM_ADD, {
      ...data,
      companyId: data?.employee?.companyId,
    } as Partial<typeof initialEmployeeHistoryExamState>);
  };

  const getRowColor = (
    row: IEmployeeExamsHistory,
  ): ITableRowStatus | undefined => {
    if (row.status === StatusEnum.DONE) return 'info';
    // if (row.status === StatusEnum.PROCESSING) return 'warn';
    // if (row.status === StatusEnum.PENDING) return 'warn';
    if (row.status === StatusEnum.EXPIRED) return 'inactive';
    if (row.status === StatusEnum.CANCELED) return 'inactive';
    return undefined;
  };

  const getAddress = (address?: IAddress) => {
    if (!address) return '';
    return `${address.street}, ${address.number} - ${address.neighborhood} ${address.complement}`;
  };

  const getAddressCity = (address?: IAddress) => {
    if (!address) return '';
    return `${address.city} - ${address.state}, ${cepMask.mask(address.cep)}`;
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

  if (isHideEmpty) {
    if (!history) return null;
    if (history.length === 0) return null;
  }

  const header: (BoxProps & { text: ReactNode; column: string })[] = [
    { text: 'Data Agendada', column: '140px' },
    { text: 'Exame', column: 'minmax(150px, 1fr)' },
    { text: 'Funcionário', column: 'minmax(150px, 1fr)' },
    { text: 'Tipo', column: '100px' },
    { text: 'Clínica', column: 'minmax(100px, 1fr)' },
    { text: 'Status', column: '100px' },
    { text: 'Agendado por', column: '120px' },
    { text: '', column: '80px', justifyContent: 'center' },
  ];

  return (
    <Box {...props}>
      {!hideTitle && (
        <>
          <STableTitle>
            {isPending ? 'Pedidos de Agenda' : 'Exames Agendados'}
          </STableTitle>
          {!isPending && (
            <STableSearch
              boxProps={{ sx: { flex: 1, maxWidth: 400 } }}
              onAddClick={onAdd}
              addText="Agendar"
              placeholder="Pesquisar por nome, cpf ou matricula"
              onChange={(e) => handleSearchChange(e.target.value)}
              loadingReload={loadQuery || isFetching || isRefetching}
              onReloadClick={onRefetchThrottle}
            />
          )}
        </>
      )}
      <STable
        loading={loadQuery}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }, index) => (
            <STableHRow key={String(index)} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<typeof history[0]>
          rowsData={history
            .sort((a, b) => sortDate(b.created_at, a.created_at))
            .sort((a, b) => sortDate(b.doneDate, a.doneDate))}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() =>
                  isPending ? onReSchedule(row) : onSelectRow(row)
                }
                clickable
                key={row.id}
                status={getRowColor(row)}
              >
                <TextIconRow
                  text={
                    <>
                      {dateToString(row.doneDate) || '-'} &nbsp;&nbsp;
                      {isPending && <br />}
                      {row?.time || ''}
                    </>
                  }
                />
                <TextIconRow clickable text={row?.exam?.name || '-'} />
                <TextIconRow
                  tooltipTitle={
                    <Box>
                      <SText color="common.white" fontSize={13}>
                        {row?.employee?.name || '-'}
                      </SText>
                      <SText color="common.white" fontSize={13}>
                        CPF: {cpfMask.mask(row?.employee?.cpf) || '-'}
                      </SText>
                      {row?.employee?.phone && (
                        <SText color="common.white" fontSize={13}>
                          Telefone: {row?.employee?.phone || '-'}
                        </SText>
                      )}
                      {row?.employee?.email && (
                        <SText color="common.white" fontSize={13}>
                          Email:{row?.employee?.email || '-'}
                        </SText>
                      )}
                      {row?.employee?.company && (
                        <>
                          <SText color="common.white" fontSize={11} mt={3}>
                            Empresa:
                          </SText>
                          <SText color="common.white" fontSize={11} mt={1}>
                            {getCompanyName(row?.employee?.company)}
                          </SText>
                          <SText color="common.white" fontSize={11} mt={1}>
                            CNPJ: {cnpjMask.mask(row?.employee?.company.cnpj)}
                          </SText>
                        </>
                      )}
                    </Box>
                  }
                >
                  <Box>
                    <SText lineNumber={1} fontSize={13}>
                      {row?.employee?.name || '-'}
                    </SText>
                    {row?.employee?.company && (
                      <SText fontSize={11} mt={1}>
                        {getCompanyName(row?.employee?.company)}
                      </SText>
                    )}
                  </Box>
                </TextIconRow>
                <TextIconRow
                  text={employeeExamTypeMap[row.examType]?.content || '-'}
                />
                <TextIconRow
                  tooltipTitle={
                    <Box>
                      <SText
                        fontSize={13}
                        color="common.white"
                        fontWeight="500"
                      >
                        {row?.clinic?.fantasy}
                      </SText>
                      <SText fontSize={12} color="common.white">
                        {getAddressCity(row?.clinic?.address)}
                      </SText>
                      <SText fontSize={12} color="common.white">
                        {getAddress(row?.clinic?.address)}{' '}
                      </SText>
                    </Box>
                  }
                  text={
                    <SText fontSize={13}>{row?.clinic?.fantasy || '-'}</SText>
                  }
                />
                <StatusSelect
                  selected={row?.status}
                  large={false}
                  width={'100%'}
                  sx={{ width: '100%' }}
                  disabled
                  options={statusOptionsConstantExam}
                  statusOptions={[]}
                />
                <TextUserRow clickable user={row?.userSchedule} />
                <SFlex center gap={0} ml={0}>
                  <IconButtonRow
                    tooltipTitle="Reagendar exame"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReSchedule(row);
                    }}
                    icon={<SCalendarIcon sx={{ color: 'info.dark' }} />}
                  />
                  <SIconUploadFile
                    loading={uploadMutation.isLoading}
                    disabledDownload={!row.fileUrl}
                    isActive={!!row.fileUrl}
                    downloadPath={
                      ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM +
                      `/${row.id}/download/${row?.employee?.companyId}`
                    }
                    onUpload={(file) =>
                      uploadExam({
                        file,
                        ids: [row.id],
                        companyId: row?.employee?.companyId,
                      })
                    }
                  />
                </SFlex>
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
      </STable>{' '}
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

export const StackHistoryScheduleExamTable = () => {
  return (
    <>
      <SAuthShow
        permissions={[PermissionEnum.EMPLOYEE_HISTORY, PermissionEnum.MASTER]}
      >
        <ModalAddEmployeeHistoryExam />
        <StackModalAddEmployeeHistoryExam />
      </SAuthShow>
    </>
  );
};
