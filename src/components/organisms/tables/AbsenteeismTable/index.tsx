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
import { initialAbsenteeismState } from 'components/organisms/modals/ModalAddAbsenteeism/hooks/useAddAbsenteeism';
import dayjs from 'dayjs';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IAbsenteeism } from 'core/interfaces/api/IAbsenteeism';
import { useQueryAbsenteeisms } from 'core/services/hooks/queries/useQueryAbsenteeisms/useQueryAbsenteeisms';
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';

export const AbsenteeismsTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IAbsenteeism) => void;
    hideTitle?: boolean;
    companyId?: string;
  }
> = ({ rowsPerPage = 8, onSelectData, hideTitle, companyId }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryAbsenteeisms(page, { search }, rowsPerPage, companyId);

  const isSelect = !!onSelectData;

  const { onStackOpenModal } = useModal();

  const onAddAbsenteeism = () => {
    onStackOpenModal(ModalEnum.ABSENTEEISM_ADD, { companyId } as Partial<
      typeof initialAbsenteeismState
    >);
  };

  const onSelectRow = (group: IAbsenteeism) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditAbsenteeism(group);
  };

  const onEditAbsenteeism = (group: IAbsenteeism) => {
    onStackOpenModal(ModalEnum.ABSENTEEISM_ADD, {
      id: group.id,
      employeeId: group.employee?.id,
      companyId: group.employee?.companyId,
    } as Partial<typeof initialAbsenteeismState>);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Funcionário', column: 'minmax(150px, 200px)' },
    { text: 'Empresa', column: 'minmax(150px, 150px)' },
    { text: 'Motivo', column: 'minmax(150px, 1fr)' },
    { text: 'Data', column: '150px' },
    { text: 'Tempo afastado', column: '140px', justifyContent: 'center' },
    { text: 'Editar', column: '50px' },
  ];

  return (
    <>
      <>
        {!hideTitle && <STableTitle>Absenteísmo</STableTitle>}
        <STableSearch
          onAddClick={onAddAbsenteeism}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </>
      <STable
        loading={loadGroup}
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
        <STableBody<typeof group[0]>
          rowsData={group}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const employee = row?.employee;
            const company = employee?.company;
            const isDay = row.timeUnit == DateUnitEnum.DAY;

            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                <TextEmployeeRow employee={employee} />
                <TextCompanyRow company={company} />
                <TextIconRow
                  clickable
                  text={row.esocial18?.description || '-'}
                />
                <TextIconRow
                  text={`${dateToString(row.startDate)} - ${dateToTimeString(
                    row.startDate,
                  )} até ${dateToString(row.endDate)} - ${dateToTimeString(
                    row.endDate,
                  )}`}
                />
                <TextIconRow
                  justifyContent={'center'}
                  text={`${-dayjs(row.startDate).diff(
                    row.endDate,
                    isDay ? 'd' : 'hour',
                  )} ${isDay ? 'dias' : 'horas'}`}
                />

                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAbsenteeism(row);
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
        totalCountOfRegisters={loadGroup ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
