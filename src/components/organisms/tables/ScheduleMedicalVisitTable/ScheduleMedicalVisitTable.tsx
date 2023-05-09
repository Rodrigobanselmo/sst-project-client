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
import { TextCompanyRow } from 'components/atoms/STable/components/Rows/TextCompanyRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import { medicalVisitFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/medicalVisitFilterList';
import { expiredExamFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/expiredExamFilterList';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { initialExamScheduleState } from 'components/organisms/modals/ModalAddExamSchedule/hooks/useEditExamEmployee';
import { ModalEditEmployeeHisExamClinic } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/ModalEditEmployeeHisExamClinic';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';

import EditIcon from 'assets/icons/SEditIcon';
import {
  statusOptionsConstantEmployee,
  statusOptionsConstantExam,
} from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useThrottle } from 'core/hooks/useThrottle';
import { IScheduleMedicalVisit } from 'core/interfaces/api/IScheduleMedicalVisit';
import {
  IQueryScheduleMedicalVisit,
  useQueryScheduleMedicalVisit,
} from 'core/services/hooks/queries/useQueryScheduleMedicalVisit/useQueryScheduleMedicalVisit';
import { queryClient } from 'core/services/queryClient';
import { dateToString } from 'core/utils/date/date-format';
import { initialModalEditScheduleMedicalVisitState } from 'components/organisms/modals/ModalEditScheduleMedicalVisit/hooks/useModalEditScheduleMedicalVisit';

export const ScheduleMedicalVisitTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IScheduleMedicalVisit) => void;
    hideTitle?: boolean;
    companyId?: string;
    query?: IQueryScheduleMedicalVisit;
  }
> = ({ rowsPerPage = 8, hideTitle, companyId, query }) => {
  const { search, page, setPage, handleSearchChange } = useTableSearchAsync();
  const filterProps = useFilterTable(undefined, {
    key: 'scheduleMedicalVisitTable',
    timeout: 60 * 60 * 1000,
    setPage,
  });

  const {
    data: historyExam,
    isLoading: loadQuery,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryScheduleMedicalVisit(
    page,
    {
      search,
      companyId,
      ...query,
      ...filterProps.filtersQuery,
    },
    rowsPerPage,
  );

  const { onStackOpenModal } = useModal();

  const onAdd = () => {
    onStackOpenModal(ModalEnum.SCHEDULE_MEDICAL_VISIT_MODAL);
  };

  const onEdit = async (data?: IScheduleMedicalVisit) => {
    if (data) {
      onStackOpenModal(ModalEnum.SCHEDULE_MEDICAL_VISIT_MODAL, {
        id: data.id,
        companyId: data.companyId,
      } as Partial<typeof initialModalEditScheduleMedicalVisitState>);
    }
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Empresa', column: '200px' },
    { text: 'Data Visita', column: '110px' },
    { text: 'Data Laboratório', column: '1fr' },
    { text: 'Status', column: '120px', justifyContent: 'center' },
    { text: 'Editar', column: '60px', justifyContent: 'center' },
  ];

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
  }, 1000);

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>Visitas Médicas</STableTitle>
          <STableSearch
            onAddClick={onAdd}
            boxProps={{ sx: { flex: 1, maxWidth: 400 } }}
            addText="Agendar"
            placeholder="Pesquisar por nome da empresa, cnpj..."
            onChange={(e) => handleSearchChange(e.target.value)}
            loadingReload={loadQuery || isFetching || isRefetching}
            onReloadClick={onRefetchThrottle}
            filterProps={{ filters: medicalVisitFilterList, ...filterProps }}
          />
        </>
      )}
      <FilterTagList filterProps={filterProps} />
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
        <STableBody<typeof historyExam[0]>
          rowsData={historyExam}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                key={row.id}
                clickable
                onClick={() => onEdit(row)}
                // status={getRowColor(row.status)}
              >
                <TextCompanyRow fontSize={10} company={row.company} />
                <TextIconRow
                  text={dateToString(row.doneClinicDate) || '-'}
                  fontSize={12}
                  mr={3}
                />
                <TextIconRow
                  text={dateToString(row.doneLabDate) || '-'}
                  fontSize={12}
                  mr={3}
                />
                <SFlex direction="column">
                  <StatusSelect
                    selected={row.status}
                    large={false}
                    disabled
                    iconProps={{ sx: { fontSize: 10 } }}
                    textProps={{ sx: { fontSize: 10 } }}
                    width={'100%'}
                    sx={{ width: '100%' }}
                    options={statusOptionsConstantExam}
                    statusOptions={[]}
                  />
                </SFlex>
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
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadQuery ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
      <ModalEditEmployeeHisExamClinic />
    </>
  );
};
