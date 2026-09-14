import { FC, useEffect, useMemo, useState } from 'react';

import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import EditIcon from 'assets/icons/SEditIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IEstablishmentGroup } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEstablishmentGroups } from 'core/services/hooks/queries/useQueryEstablishmentGroups';
import {
  useMutAssignEstablishmentGroupWorkspaces,
  useMutCreateEstablishmentGroup,
  useMutDeleteEstablishmentGroup,
  useMutUpdateEstablishmentGroup,
} from 'core/services/hooks/mutations/manager/establishment-group/useMutEstablishmentGroup';
import { listSelectableWorkspacesForEstablishmentGroup } from './list-selectable-workspaces';

type ModalData = {
  groupId?: string;
};

type FormState = {
  id?: string;
  name: string;
  selectedWorkspaceIds: string[];
};

const emptyForm: FormState = {
  name: '',
  selectedWorkspaceIds: [],
};

export const ModalEstablishmentGroups: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const { preventDelete } = usePreventAction();
  const { data: company } = useQueryCompany();
  const { data: groups, isLoading } = useQueryEstablishmentGroups();
  const createMutation = useMutCreateEstablishmentGroup();
  const updateMutation = useMutUpdateEstablishmentGroup();
  const deleteMutation = useMutDeleteEstablishmentGroup();
  const assignMutation = useMutAssignEstablishmentGroupWorkspaces();

  const [form, setForm] = useState<FormState | null>(null);

  const modalData = getModalData<ModalData>(ModalEnum.ESTABLISHMENT_GROUPS);

  const groupByWorkspaceId = useMemo(() => {
    const map = new Map<string, IEstablishmentGroup>();
    groups.forEach((group) => {
      (group.workspaceIds || []).forEach((workspaceId) => {
        map.set(workspaceId, group);
      });
    });
    return map;
  }, [groups]);

  const workspaces = useMemo(
    () =>
      listSelectableWorkspacesForEstablishmentGroup({
        workspaces: company?.workspace || [],
        groupByWorkspaceId,
        currentGroupId: form?.id,
      }),
    [company?.workspace, form?.id, groupByWorkspaceId],
  );

  useEffect(() => {
    if (!modalData?.groupId || !groups.length) return;
    const group = groups.find((item) => item.id === modalData.groupId);
    if (!group) return;
    setForm({
      id: group.id,
      name: group.name,
      selectedWorkspaceIds: [...(group.workspaceIds || [])],
    });
  }, [groups, modalData?.groupId]);

  const loading =
    createMutation.isLoading ||
    updateMutation.isLoading ||
    deleteMutation.isLoading ||
    assignMutation.isLoading;

  const onClose = () => {
    setForm(null);
    onCloseModal(ModalEnum.ESTABLISHMENT_GROUPS);
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
  };

  const openEdit = (group: IEstablishmentGroup) => {
    setForm({
      id: group.id,
      name: group.name,
      selectedWorkspaceIds: [...(group.workspaceIds || [])],
    });
  };

  const toggleWorkspace = (workspaceId: string) => {
    setForm((current) => {
      if (!current) return current;
      const selected = new Set(current.selectedWorkspaceIds);
      if (selected.has(workspaceId)) selected.delete(workspaceId);
      else selected.add(workspaceId);
      return { ...current, selectedWorkspaceIds: [...selected] };
    });
  };

  const onSave = async () => {
    if (!form) return;
    const name = form.name.trim();
    if (!name) return;

    const selected = new Set(form.selectedWorkspaceIds);

    if (!form.id) {
      const created = await createMutation.mutateAsync({ name });
      if (created?.id && selected.size) {
        await assignMutation.mutateAsync({
          id: created.id,
          add: [...selected],
        });
      }
      setForm(null);
      return;
    }

    const current = groups.find((group) => group.id === form.id);
    if (current && current.name !== name) {
      await updateMutation.mutateAsync({ id: form.id, name });
    }

    const previous = new Set(current?.workspaceIds || []);
    const add = [...selected].filter((id) => !previous.has(id));
    const remove = [...previous].filter((id) => !selected.has(id));
    if (add.length || remove.length) {
      await assignMutation.mutateAsync({
        id: form.id,
        add,
        remove,
      });
    } else if (current && current.name === name) {
      setForm(null);
      return;
    }

    setForm(null);
  };

  const onDelete = (group: IEstablishmentGroup) => {
    preventDelete(
      () => {
        deleteMutation.mutate(group.id);
        if (form?.id === group.id) setForm(null);
      },
      'O grupo será excluído. Os estabelecimentos não serão apagados — apenas deixarão de pertencer a este grupo.',
      { title: 'Excluir grupo de estabelecimentos?' },
    );
  };

  const buttons = [
    form
      ? {
          text: 'Voltar',
          variant: 'outlined',
          onClick: () => setForm(null),
        }
      : {},
    form
      ? {
          text: 'Salvar',
          variant: 'contained',
          onClick: onSave,
          disabled: loading || !form.name.trim(),
        }
      : {
          text: 'Fechar',
          variant: 'outlined',
          onClick: onClose,
        },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.ESTABLISHMENT_GROUPS)}
      keepMounted={false}
      onClose={onClose}
    >
      <SModalPaper center p={8} sx={{ width: 640, maxWidth: '100%' }}>
        <SModalHeader
          tag={form?.id ? 'edit' : form ? 'add' : undefined}
          onClose={onClose}
          title={
            form?.id
              ? 'Editar grupo de estabelecimentos'
              : form
                ? 'Novo grupo de estabelecimentos'
                : 'Grupos de estabelecimentos'
          }
        />

        {!form && (
          <SFlex direction="column" gap={8} mt={8}>
            <SText fontSize={13} color="grey.600">
              Organize estabelecimentos em grupos visuais no organograma. Cada
              estabelecimento pode estar em no máximo um grupo.
            </SText>
            <Box>
              <SButton
                variant="contained"
                onClick={openCreate}
                startIcon={<FolderCopyOutlinedIcon />}
              >
                Novo grupo
              </SButton>
            </Box>
            {isLoading && <SText>Carregando grupos...</SText>}
            {!isLoading && !groups.length && (
              <SText color="grey.600">Nenhum grupo cadastrado.</SText>
            )}
            {groups.map((group) => (
              <SFlex
                key={group.id}
                align="center"
                justify="space-between"
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  px: 4,
                  py: 3,
                }}
              >
                <Box>
                  <SText fontWeight={700}>{group.name}</SText>
                  <SText fontSize={12} color="grey.600">
                    {(group.workspaceIds || []).length} estabelecimento
                    {(group.workspaceIds || []).length === 1 ? '' : 's'}
                  </SText>
                </Box>
                <SFlex gap={1}>
                  <IconButton
                    size="small"
                    onClick={() => openEdit(group)}
                    aria-label={`Editar ${group.name}`}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(group)}
                    aria-label={`Excluir ${group.name}`}
                  >
                    <SDeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </SFlex>
              </SFlex>
            ))}
          </SFlex>
        )}

        {form && (
          <SFlex direction="column" gap={8} mt={8}>
            <SInput
              label="Nome do grupo"
              value={form.name}
              onChange={(e) =>
                setForm((current) =>
                  current ? { ...current, name: e.target.value } : current,
                )
              }
              placeholder="Ex.: BRASKEM"
              size="small"
              autoFocus
              fullWidth
            />
            <SText fontSize={13} color="grey.600">
              Marque os estabelecimentos deste grupo. Estabelecimentos que já
              pertencem a outro grupo não são exibidos.
            </SText>
            <Box
              sx={{
                maxHeight: 320,
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 1,
                px: 2,
                py: 1,
              }}
            >
              {!workspaces.length && (
                <SText color="grey.600" p={2}>
                  {(company?.workspace || []).length
                    ? 'Nenhum estabelecimento disponível. Os demais já pertencem a outros grupos.'
                    : 'Nenhum estabelecimento cadastrado.'}
                </SText>
              )}
              {workspaces.map((workspace) => {
                const checked = form.selectedWorkspaceIds.includes(
                  workspace.id,
                );
                return (
                  <Box key={workspace.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => toggleWorkspace(workspace.id)}
                        />
                      }
                      label={<SText>{workspace.name}</SText>}
                    />
                  </Box>
                );
              })}
            </Box>
          </SFlex>
        )}

        <SModalButtons loading={loading} onClose={onClose} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
