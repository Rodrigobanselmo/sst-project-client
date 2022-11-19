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
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableSmallTitle from 'components/atoms/STable/components/STableSmallTitle/STableSmallTitle';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { initialProfessionalResponsibleState } from 'components/organisms/modals/ModalAddProfessionalResponsible/hooks/useAddProfessionalResponsible';
import { profRespMap } from 'project/enum/professional-responsible-type.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IProfessionalResponsible } from 'core/interfaces/api/IProfessionalResponsible';
import { useQueryProfessionalResponsible } from 'core/services/hooks/queries/useQueryProfessionalResponsible/ProfessionalResponsible';
import { dateToString } from 'core/utils/date/date-format';

export const ProfessionalResponsibleTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IProfessionalResponsible) => void;
    hideTitle?: boolean;
    companyId?: string;
  }
> = ({ rowsPerPage = 8, onSelectData, hideTitle, companyId }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryProfessionalResponsible(page, { search }, rowsPerPage, companyId);

  const isSelect = !!onSelectData;

  const { onStackOpenModal } = useModal();

  const onAddProfessionalResponsible = () => {
    onStackOpenModal(ModalEnum.PROF_RESPONSIBLE, { companyId } as Partial<
      typeof initialProfessionalResponsibleState
    >);
  };

  const onSelectRow = (group: IProfessionalResponsible) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditProfessionalResponsible(group);
  };

  const onEditProfessionalResponsible = (group: IProfessionalResponsible) => {
    onStackOpenModal(ModalEnum.PROF_RESPONSIBLE, {
      ...group,
    } as Partial<typeof initialProfessionalResponsibleState>);
  };

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>Responsáveis Monitoramento</STableTitle>
          <STableSearch
            onAddClick={onAddProfessionalResponsible}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </>
      )}
      {hideTitle && (
        <STableSmallTitle
          onAddClick={onAddProfessionalResponsible}
          text="Responsáveis Monitoramento"
        />
      )}
      <STable
        loading={loadGroup}
        rowsNumber={rowsPerPage}
        columns="80px minmax(200px, 2fr) 110px 50px"
      >
        <STableHeader>
          <STableHRow>Tipo</STableHRow>
          <STableHRow>Nome</STableHRow>
          <STableHRow>A partir de</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof group[0]>
          hideEmpty
          rowsData={group}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                <TextIconRow
                  clickable
                  text={profRespMap[row.type]?.content || '-'}
                />
                <TextIconRow clickable text={row?.professional?.name || '-'} />
                <TextIconRow
                  justifyContent="center"
                  clickable
                  text={dateToString(row.startDate) || '-'}
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProfessionalResponsible(row);
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
