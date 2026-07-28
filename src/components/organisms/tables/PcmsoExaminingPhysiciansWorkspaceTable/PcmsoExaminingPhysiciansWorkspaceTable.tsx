import { FC } from 'react';

import { Alert, BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SButton } from 'components/atoms/SButton';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSmallTitle from 'components/atoms/STable/components/STableSmallTitle/STableSmallTitle';
import { initialPcmsoExaminingPhysicianState } from 'components/organisms/modals/ModalAddPcmsoExaminingPhysician/hooks/useAddPcmsoExaminingPhysician';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useModal } from 'core/hooks/useModal';
import {
  formatExaminingPhysicianCouncil,
  formatExaminingPhysicianName,
  IPcmsoExaminingPhysician,
} from 'core/interfaces/api/IPcmsoExaminingPhysician';
import { useMutCustomizePcmsoExaminingPhysicians } from 'core/services/hooks/mutations/manager/pcmsoExaminingPhysician/useMutCustomizePcmsoExaminingPhysicians/useMutCustomizePcmsoExaminingPhysicians';
import { useQueryPcmsoExaminingPhysiciansResolved } from 'core/services/hooks/queries/useQueryPcmsoExaminingPhysiciansResolved/useQueryPcmsoExaminingPhysiciansResolved';
import { PermissionEnum } from 'project/enum/permission.enum';
import { StatusEnum } from 'project/enum/status.enum';

export const PcmsoExaminingPhysiciansWorkspaceTable: FC<
  BoxProps & {
    companyId?: string;
    workspaceId?: string;
  }
> = ({ companyId, workspaceId }) => {
  const { isValidPermissions } = useAccess();
  const canManage = isValidPermissions([PermissionEnum.PCMSO]);
  const { onStackOpenModal } = useModal();
  const customizeMutation = useMutCustomizePcmsoExaminingPhysicians();

  const { source, items, isLoading, isError } =
    useQueryPcmsoExaminingPhysiciansResolved(companyId, workspaceId);

  const isInherited = source === 'COMPANY';
  const canEdit = canManage && !isInherited;

  if (!workspaceId || !canManage) return null;

  const onAddPhysician = () => {
    onStackOpenModal(ModalEnum.PCMSO_EXAMINING_PHYSICIAN_ADD, {
      companyId,
      workspaceId,
    } as Partial<typeof initialPcmsoExaminingPhysicianState>);
  };

  const onEditPhysician = (physician: IPcmsoExaminingPhysician) => {
    if (!canEdit) return;

    onStackOpenModal(ModalEnum.PCMSO_EXAMINING_PHYSICIAN_ADD, {
      ...physician,
      companyId,
      workspaceId,
    } as Partial<typeof initialPcmsoExaminingPhysicianState>);
  };

  const handleCustomize = async () => {
    if (!workspaceId) return;
    await customizeMutation.mutateAsync({ workspaceId, companyId });
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(180px, 2fr)' },
    { text: 'Conselho', column: 'minmax(140px, 1.2fr)' },
    { text: 'Observações', column: 'minmax(140px, 1.4fr)' },
    { text: 'Ordem', column: '70px' },
    { text: 'Status', column: '90px' },
    ...(canEdit ? [{ text: 'Editar', column: '50px' }] : []),
  ];

  return (
    <SFlex direction="column" mt={8}>
      {isInherited && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Esta lista está herdada da empresa. Personalize para editar os médicos
          examinadores deste estabelecimento.
        </Alert>
      )}

      <SFlex align="center" justify="space-between" flexWrap="wrap" gap={4}>
        <STableSmallTitle
          onAddClick={canEdit ? onAddPhysician : undefined}
          text="Médicos examinadores PCMSO"
        />
        {isInherited && (
          <SButton
            variant="contained"
            size="small"
            onClick={handleCustomize}
            disabled={customizeMutation.isLoading}
          >
            Personalizar para este estabelecimento
          </SButton>
        )}
      </SFlex>

      <STable
        loading={isLoading}
        rowsNumber={Math.max(items.length, 3)}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<(typeof items)[0]>
          rowsData={items}
          hideLoadMore
          rowsInitialNumber={Math.max(items.length, 3)}
          contentEmpty={
            isError
              ? 'Erro ao carregar médicos examinadores. Tente novamente.'
              : isInherited
                ? 'Nenhum médico examinador cadastrado na empresa.'
                : undefined
          }
          renderRow={(row) => (
            <STableRow
              onClick={() => onEditPhysician(row)}
              clickable={canEdit}
              key={row.id}
            >
              <TextIconRow clickable={canEdit} text={formatExaminingPhysicianName(row)} />
              <TextIconRow
                clickable={canEdit}
                text={formatExaminingPhysicianCouncil(row)}
              />
              <TextIconRow clickable={canEdit} text={row.notes || '-'} />
              <TextIconRow
                clickable={canEdit}
                justifyContent="center"
                text={String(row.sortOrder ?? 0)}
              />
              <TextIconRow
                clickable={canEdit}
                text={row.status === StatusEnum.ACTIVE ? 'Ativo' : 'Inativo'}
              />
              {canEdit && (
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPhysician(row);
                  }}
                  icon={<EditIcon />}
                />
              )}
            </STableRow>
          )}
        />
      </STable>
    </SFlex>
  );
};
