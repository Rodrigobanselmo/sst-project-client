import { FC, MouseEvent } from 'react';

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Box, BoxProps } from '@mui/material';
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
import {
  EMPLOYEE_HIERARCHY_ADD_EVENT_TOOLTIP,
  EMPLOYEE_HIERARCHY_CORRECT_RECORD_TOOLTIP,
  EMPLOYEE_HIERARCHY_TRANSFER_TOOLTIP,
} from 'components/organisms/modals/ModalAddEmployeeHistoryHier/employee-hierarchy-correction.util';
import { initialEmployeeHistoryHierState } from 'components/organisms/modals/ModalAddEmployeeHistoryHier/hooks/useAddData';
import { getLatestHierarchyMovementStartDate } from 'components/organisms/modals/ModalTransferEmployeeHierarchy/employee-hierarchy-transfer.util';
import {
  EmployeeHierarchyMotiveTypeEnum,
  employeeHierarchyMotiveTypeMap,
} from 'project/enum/employee-hierarchy-motive.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';
import {
  brandIdentityButtonSx,
  brandIdentityFillHoverSx,
  brandIdentityFillSx,
} from 'configs/theme/brand-identity-fill';

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

const lotacaoPrimaryButtonSx = {
  ...brandIdentityButtonSx,
  ...brandIdentityFillSx,
  boxShadow: 'none',
  filter: 'none',
  '& .text_main, & .icon_main, & .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    color: 'primary.identityOn',
  },
  '&:hover': {
    ...brandIdentityFillHoverSx,
    filter: 'none',
    '& .text_main, & .icon_main, & .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
      color: 'primary.identityOn',
    },
  },
} as const;

export const HistoryEmployeeHierarchyTable: FC<
  { children?: any } & BoxProps & {
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

  const stopToolbarEvent = (event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
  };

  const onAdd = (event?: MouseEvent) => {
    stopToolbarEvent(event);
    onStackOpenModal(modalName, {
      companyId,
      employeeId,
      employee,
      motive:
        history?.length === 0 ? EmployeeHierarchyMotiveTypeEnum.ADM : undefined,
      startDate: new Date(),
    } as Partial<typeof initialEmployeeHistoryHierState>);
  };

  const onTransfer = (event?: MouseEvent) => {
    stopToolbarEvent(event);
    onStackOpenModal(ModalEnum.EMPLOYEE_HIERARCHY_TRANSFER, {
      companyId,
      employeeId,
      employee,
      lastStartDate: getLatestHierarchyMovementStartDate(history),
      startDate: new Date(),
    });
  };

  const onSelectRow = (data: IEmployeeHierarchyHistory) => {
    if (isSelect) {
      onSelectData(data);
    } else onEdit(data);
  };

  const onEdit = (data: IEmployeeHierarchyHistory) => {
    onStackOpenModal(modalName, {
      ...data,
      subOffice: data?.subHierarchies?.[0],
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
          <SFlex
            mb={12}
            gap={10}
            align="center"
            flexWrap="wrap"
            sx={{ position: 'relative', zIndex: 2 }}
            onClick={stopToolbarEvent}
            onMouseDown={stopToolbarEvent}
          >
            <STableTitle mb={0}>Histórico de Lotação</STableTitle>
            <STagButton
              onClick={onTransfer}
              icon={SwapHorizIcon}
              text="Alterar lotação"
              tooltipTitle={EMPLOYEE_HIERARCHY_TRANSFER_TOOLTIP}
              sx={lotacaoPrimaryButtonSx}
              iconProps={{ sx: { color: 'primary.identityOn' } }}
              textProps={{ sx: { mb: 0, color: 'primary.identityOn' } }}
            />
            <STagButton
              onClick={onAdd}
              icon={SAddIcon}
              text="Adicionar evento"
              outline
              tooltipTitle={EMPLOYEE_HIERARCHY_ADD_EVENT_TOOLTIP}
              iconProps={{ sx: { color: 'grey.600' } }}
              textProps={{ sx: { mb: 0, color: 'text.primary' } }}
            />
          </SFlex>
          {/* <STableSearch
            onAddClick={onAddContact}
            onChange={(e) => handleSearchChange(e.target.value)}
          /> */}
        </>
      )}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <STable
          loading={loadQuery}
          rowsNumber={rowsPerPage}
          columns="100px  100px  minmax(150px, 2fr)  minmax(150px, 2fr) minmax(150px, 2fr) 200px 50px"
        >
        <STableHeader>
          <STableHRow>Data</STableHRow>
          <STableHRow>Motivo</STableHRow>
          <STableHRow>Setor</STableHRow>
          <STableHRow>Cargo</STableHRow>
          <STableHRow>Cargo Desvolvido</STableHRow>
          <STableHRow>Empresa</STableHRow>
          <STableHRow justifyContent="center">Corrigir</STableHRow>
        </STableHeader>
        <STableBody<(typeof history)[0]>
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
                <TextIconRow
                  clickable
                  text={row?.hierarchy?.parent?.name || '-'}
                />
                <TextIconRow clickable text={row?.hierarchy?.name || '-'} />
                <TextIconRow
                  clickable
                  text={
                    row?.subHierarchies?.map((s) => s.name).join(', ') || '-'
                  }
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
                  tooltipTitle={EMPLOYEE_HIERARCHY_CORRECT_RECORD_TOOLTIP}
                  icon={<EditIcon />}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      </Box>
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
