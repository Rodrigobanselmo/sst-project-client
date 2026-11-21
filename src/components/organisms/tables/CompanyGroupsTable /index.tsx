import { FC } from 'react';

import { Box, BoxProps } from '@mui/material';
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
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { initialCompanyGroupState } from 'components/organisms/modals/ModalAddCompanyGroup/hooks/useAddCompanyGroup';
import dayjs from 'dayjs';

import SCompanyGroupIcon from 'assets/icons/SCompanyGroupIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { ICompanyGroup } from 'core/interfaces/api/ICompanyGroup';
import { useQueryCompanyGroups } from 'core/services/hooks/queries/useQueryCompanyGroups';
import { dateToDate } from 'core/utils/date/date-format';

export const CompanyGroupsTable: FC<
  { children?: any } & BoxProps & {
      hideTitle?: boolean;
      rowsPerPage?: number;
      onSelectData?: (group: ICompanyGroup) => void;
    }
> = ({ rowsPerPage = 8, onSelectData, hideTitle }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryCompanyGroups(page, { search }, rowsPerPage);

  const isSelect = !!onSelectData;

  const { onOpenModal } = useModal();

  const onAddCompanyGroup = () => {
    onOpenModal(ModalEnum.COMPANY_GROUP_ADD);
  };

  const onSelectRow = (group: ICompanyGroup) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditCompanyGroup(group);
  };

  const onEditCompanyGroup = (group: ICompanyGroup) => {
    onOpenModal(ModalEnum.COMPANY_GROUP_ADD, {
      ...group,
      esocialStart: dateToDate(group.esocialStart),
      companies: group.companies || [],
    } as Partial<typeof initialCompanyGroupState>);
  };

  return (
    <>
      {!isSelect && !hideTitle && (
        <STableTitle icon={SCompanyGroupIcon}>Grupos Empresariais</STableTitle>
      )}
      <Box
        sx={{
          '&&&& button': {
            borderRadius: '999px',
            minHeight: 32,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <STableSearch
          autoFocus={false}
          boxProps={{ sx: { width: { xs: 200, md: 340 }, flexShrink: 0 } }}
          inputProps={{ style: { height: '13px', fontSize: '14px' } }}
          sx={{
            '&&&& .MuiOutlinedInput-root': {
              borderRadius: '999px',
              boxShadow: 'none',
              backgroundColor: 'background.paper',
            },
            '&&&& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1px',
              borderColor: 'divider',
              borderRadius: '999px',
            },
            '&&&& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, &&&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
              {
                borderWidth: '1px',
                borderColor: 'primary.main',
              },
          }}
          identitySquareActions
          onAddClick={onAddCompanyGroup}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </Box>
      <STable
        loading={loadGroup}
        rowsNumber={rowsPerPage}
        columns="minmax(150px, 2fr) minmax(200px, 4fr) 100px"
      >
        <STableHeader
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <STableHRow>Nome</STableHRow>
          <STableHRow>Descrição</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<(typeof group)[0]>
          rowsData={group}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                sx={{
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  minHeight: 48,
                  px: 5,
                }}
                key={row.id}
              >
                <TextIconRow clickable text={row.name} />
                <TextIconRow clickable text={row.description} />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCompanyGroup(row);
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
