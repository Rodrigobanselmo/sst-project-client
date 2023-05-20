import { FC } from 'react';

import { BoxProps, Divider } from '@mui/material';
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
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableSmallTitle from 'components/atoms/STable/components/STableSmallTitle/STableSmallTitle';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { initialCatState } from 'components/organisms/modals/ModalAddCat/hooks/useAddCat';
import dayjs from 'dayjs';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import {
  IScheduleBlock,
  ScheduleBlockTypeMap,
} from 'core/interfaces/api/IScheduleBlock';
import { useQueryScheduleBlocks } from 'core/services/hooks/queries/block/useQueryScheduleBlocks/useQueryScheduleBlocks';
import { useQueryCats } from 'core/services/hooks/queries/useQueryCats/useQueryCats';
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';

export const getScheduleStartEndDate = (schedule: IScheduleBlock) => {
  const start = `${dayjs(schedule.startDate).format('DD/MM/YY')} - ${
    schedule.startTime
  }`;
  const end = `${dayjs(schedule.endDate).format('DD/MM/YY')} - ${
    schedule.endTime
  }`;

  return { start, end };
};

export const getScheduleRecurrence = (schedule: IScheduleBlock) => {
  if (schedule.yearRecurrence) return 'Anual';
  return '-';
};

export const ScheduleBlockTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (group: IScheduleBlock) => void;
      hideTitle?: boolean;
      companyId?: string;
    }
> = ({ rowsPerPage = 8, onSelectData, hideTitle, companyId }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: blocks,
    isLoading: loadBlocks,
    count,
  } = useQueryScheduleBlocks(page, { search }, rowsPerPage, companyId);

  const isSelect = !!onSelectData;

  const { onStackOpenModal } = useModal();

  const onAddCat = () => {
    onStackOpenModal(ModalEnum.SCHEDULE_BLOCK_ADD, { companyId } as Partial<
      typeof initialCatState
    >);
  };

  const onSelectRow = (group: IScheduleBlock) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditCat(group);
  };

  const onEditCat = (group: IScheduleBlock) => {
    onStackOpenModal(ModalEnum.SCHEDULE_BLOCK_ADD, {
      id: group.id,
      // employeeId: group.employee?.id,
      // companyId: group.employee?.companyId,
    } as Partial<typeof initialCatState>);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Justificativa', column: 'minmax(150px, 200px)' },
    { text: 'Tipo', column: '150px' },
    { text: 'Data Bloqueada', column: 'minmax(150px, 200px)' },
    { text: 'Recorrencia', column: 'minmax(100px, 150px)' },
    { text: 'Todas', column: 'minmax(100px, 1fr)' },
    { text: 'Editar', column: '50px' },
  ];

  return (
    <>
      <>
        {!hideTitle && <STableTitle>Bloqueio de Agenda</STableTitle>}
        <STableSearch
          onAddClick={onAddCat}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </>
      <STable
        loading={loadBlocks}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<(typeof blocks)[0]>
          rowsData={blocks}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const { end, start } = getScheduleStartEndDate(row);
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
                status={row.status == 'CANCELED' ? 'inactive' : undefined}
              >
                <TextIconRow text={row.name} />
                <TextIconRow
                  text={ScheduleBlockTypeMap[row.type]?.content || '-'}
                />
                <TextIconRow
                  tooltipTitle=""
                  text={
                    <div>
                      <SText className="table-row-text " fontSize={12}>
                        de: &nbsp;&nbsp;{start}
                      </SText>
                      <SText className="table-row-text " fontSize={12}>
                        até:&nbsp; {end}
                      </SText>
                    </div>
                  }
                />
                <TextIconRow text={getScheduleRecurrence(row)} />
                <TextIconRow text={row.allCompanies ? 'SIM' : 'NÃO'} />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCat(row);
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
        totalCountOfRegisters={loadBlocks ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
