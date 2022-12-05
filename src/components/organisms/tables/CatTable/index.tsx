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
import { ICat } from 'core/interfaces/api/ICat';
import { useQueryCats } from 'core/services/hooks/queries/useQueryCats/useQueryCats';
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';

export const CatsTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: ICat) => void;
    hideTitle?: boolean;
    companyId?: string;
  }
> = ({ rowsPerPage = 8, onSelectData, hideTitle, companyId }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryCats(page, { search }, rowsPerPage, companyId);

  const isSelect = !!onSelectData;

  const { onStackOpenModal } = useModal();

  const onAddCat = () => {
    onStackOpenModal(ModalEnum.CAT_ADD, { companyId } as Partial<
      typeof initialCatState
    >);
  };

  const onSelectRow = (group: ICat) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditCat(group);
  };

  const onEditCat = (group: ICat) => {
    onStackOpenModal(ModalEnum.CAT_ADD, {
      id: group.id,
      employeeId: group.employee?.id,
      companyId: group.employee?.companyId,
    } as Partial<typeof initialCatState>);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Funcionário', column: 'minmax(150px, 200px)' },
    { text: 'Empresa', column: 'minmax(150px, 150px)' },
    // { text: 'Motivo', column: 'minmax(150px, 1fr)' },
    { text: 'Data', column: 'minmax(150px, 1fr)' },
    { text: 'Editar', column: '50px' },
  ];

  return (
    <>
      <>
        {!hideTitle && <STableTitle>CAT</STableTitle>}
        <STableSearch
          onAddClick={onAddCat}
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

            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                <TextEmployeeRow employee={employee} />
                <TextCompanyRow company={company} />
                {/* <TextIconRow
                  clickable
                  text={row.esocial18?.description || '-'}
                /> */}
                <TextIconRow
                  text={`${dateToString(row.dtAcid)} - ${row.hrAcid}`}
                />

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
        totalCountOfRegisters={loadGroup ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
