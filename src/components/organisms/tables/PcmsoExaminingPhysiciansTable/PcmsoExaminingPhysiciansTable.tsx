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
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableSmallTitle from 'components/atoms/STable/components/STableSmallTitle/STableSmallTitle';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { initialPcmsoExaminingPhysicianState } from 'components/organisms/modals/ModalAddPcmsoExaminingPhysician/hooks/useAddPcmsoExaminingPhysician';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import {
  formatExaminingPhysicianCouncil,
  formatExaminingPhysicianName,
  IPcmsoExaminingPhysician,
} from 'core/interfaces/api/IPcmsoExaminingPhysician';
import { useQueryPcmsoExaminingPhysicians } from 'core/services/hooks/queries/useQueryPcmsoExaminingPhysicians/useQueryPcmsoExaminingPhysicians';
import { PermissionEnum } from 'project/enum/permission.enum';
import { StatusEnum } from 'project/enum/status.enum';

export const PcmsoExaminingPhysiciansTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    hideTitle?: boolean;
    companyId?: string;
  }
> = ({ rowsPerPage = 8, hideTitle, companyId }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const { isValidPermissions } = useAccess();
  const canManage = isValidPermissions([PermissionEnum.PCMSO]);

  const {
    data: physicians,
    isLoading,
    isError,
    count,
  } = useQueryPcmsoExaminingPhysicians(page, { search }, rowsPerPage, companyId);

  const { onStackOpenModal } = useModal();

  if (!companyId || !canManage) return null;

  const onAddPhysician = () => {
    onStackOpenModal(ModalEnum.PCMSO_EXAMINING_PHYSICIAN_ADD, {
      companyId,
      workspaceId: null,
    } as Partial<typeof initialPcmsoExaminingPhysicianState>);
  };

  const onEditPhysician = (physician: IPcmsoExaminingPhysician) => {
    onStackOpenModal(ModalEnum.PCMSO_EXAMINING_PHYSICIAN_ADD, {
      ...physician,
      companyId,
      workspaceId: null,
    } as Partial<typeof initialPcmsoExaminingPhysicianState>);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(180px, 2fr)' },
    { text: 'Conselho', column: 'minmax(140px, 1.2fr)' },
    { text: 'Observações', column: 'minmax(140px, 1.4fr)' },
    { text: 'Ordem', column: '70px' },
    { text: 'Status', column: '90px' },
    { text: 'Editar', column: '50px' },
  ];

  return (
    <SFlex direction="column" mt={8}>
      {!hideTitle ? (
        <>
          <STableTitle>Médicos examinadores PCMSO (padrão da empresa)</STableTitle>
          <STableSearch
            onAddClick={onAddPhysician}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </>
      ) : (
        <STableSmallTitle
          onAddClick={onAddPhysician}
          text="Médicos examinadores PCMSO (padrão da empresa)"
        />
      )}

      <STable
        loading={isLoading}
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
        <STableBody<(typeof physicians)[0]>
          rowsData={physicians}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          contentEmpty={
            isError
              ? 'Erro ao carregar médicos examinadores. Tente novamente.'
              : undefined
          }
          renderRow={(row) => (
            <STableRow onClick={() => onEditPhysician(row)} clickable key={row.id}>
              <TextIconRow clickable text={formatExaminingPhysicianName(row)} />
              <TextIconRow clickable text={formatExaminingPhysicianCouncil(row)} />
              <TextIconRow clickable text={row.notes || '-'} />
              <TextIconRow
                clickable
                justifyContent="center"
                text={String(row.sortOrder ?? 0)}
              />
              <TextIconRow
                clickable
                text={row.status === StatusEnum.ACTIVE ? 'Ativo' : 'Inativo'}
              />
              <IconButtonRow
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPhysician(row);
                }}
                icon={<EditIcon />}
              />
            </STableRow>
          )}
        />
      </STable>

      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={isLoading || isError ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </SFlex>
  );
};
