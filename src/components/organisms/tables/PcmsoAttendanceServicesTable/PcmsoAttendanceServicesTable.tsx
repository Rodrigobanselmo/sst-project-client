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
import { initialPcmsoAttendanceServiceState } from 'components/organisms/modals/ModalAddPcmsoAttendanceService/hooks/useAddPcmsoAttendanceService';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import {
  IPcmsoAttendanceService,
  PCMsoAttendanceServiceTypeLabels,
} from 'core/interfaces/api/IPcmsoAttendanceService';
import { useQueryPcmsoAttendanceServices } from 'core/services/hooks/queries/useQueryPcmsoAttendanceServices/useQueryPcmsoAttendanceServices';
import { PermissionEnum } from 'project/enum/permission.enum';
import { StatusEnum } from 'project/enum/status.enum';

export const PcmsoAttendanceServicesTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    hideTitle?: boolean;
    companyId?: string;
    workspaceId?: string;
  }
> = ({ rowsPerPage = 8, hideTitle, companyId, workspaceId }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const { isValidPermissions } = useAccess();

  const canManage = isValidPermissions([PermissionEnum.PCMSO]);

  const {
    data: services,
    isLoading,
    isError,
    count,
  } = useQueryPcmsoAttendanceServices(
    page,
    { search },
    rowsPerPage,
    companyId,
    workspaceId,
  );

  const { onStackOpenModal } = useModal();

  if (!workspaceId || !canManage) return null;

  const onAddService = () => {
    onStackOpenModal(ModalEnum.PCMSO_ATTENDANCE_SERVICE_ADD, {
      companyId,
      workspaceId,
    } as Partial<typeof initialPcmsoAttendanceServiceState>);
  };

  const onEditService = (service: IPcmsoAttendanceService) => {
    onStackOpenModal(ModalEnum.PCMSO_ATTENDANCE_SERVICE_ADD, {
      ...service,
      companyId,
      workspaceId,
    } as Partial<typeof initialPcmsoAttendanceServiceState>);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(150px, 2fr)' },
    { text: 'Tipo', column: 'minmax(120px, 1fr)' },
    { text: 'Telefone', column: '120px' },
    { text: 'Distância', column: '110px' },
    { text: 'Ordem', column: '70px' },
    { text: 'Status', column: '90px' },
    { text: 'Editar', column: '50px' },
  ];

  return (
    <SFlex direction="column" mt={8}>
      {!hideTitle ? (
        <>
          <STableTitle>Serviços de atendimento de referência</STableTitle>
          <STableSearch
            onAddClick={onAddService}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </>
      ) : (
        <STableSmallTitle
          onAddClick={onAddService}
          text="Serviços de atendimento de referência"
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
        <STableBody<(typeof services)[0]>
          rowsData={services}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          contentEmpty={
            isError
              ? 'Erro ao carregar serviços de atendimento. Tente novamente.'
              : undefined
          }
          renderRow={(row) => (
            <STableRow onClick={() => onEditService(row)} clickable key={row.id}>
              <TextIconRow clickable text={row.name || '-'} />
              <TextIconRow
                clickable
                text={PCMsoAttendanceServiceTypeLabels[row.serviceType] || '-'}
              />
              <TextIconRow clickable text={row.phone || '-'} />
              <TextIconRow clickable text={row.distanceLabel || '-'} />
              <TextIconRow clickable justifyContent="center" text={String(row.sortOrder ?? 0)} />
              <TextIconRow
                clickable
                text={row.status === StatusEnum.ACTIVE ? 'Ativo' : 'Inativo'}
              />
              <IconButtonRow
                onClick={(e) => {
                  e.stopPropagation();
                  onEditService(row);
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
