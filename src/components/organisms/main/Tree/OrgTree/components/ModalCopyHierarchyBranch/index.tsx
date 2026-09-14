import React, { FC, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import { Alert, Autocomplete, Box, TextField } from '@mui/material';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { selectAllHierarchyTreeNodes } from 'store/reducers/hierarchy/hierarchySlice';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutCopyHierarchyBranch } from 'core/services/hooks/mutations/checklist/hierarchy/useMutCopyHierarchyBranch';
import { parseOrgWorkspaceFilterIds } from 'core/utils/org-workspace-query';

import { ITreeMap } from '../../interfaces';
import {
  CopyHierarchyDestinationOption,
  collectSubtreeTreeIds,
  getCopyHierarchyDestinationOptions,
  getHierarchyIdFromTreeId,
  getWorkspaceIdFromTreeNode,
  getWorkspaceLabelFromTreeNode,
  formatCopyHierarchyDestinationLabel,
} from '../../utils/get-copy-hierarchy-destinations';

export const initialCopyHierarchyBranchState = {
  sourceTreeId: '' as string,
};

const modalName = ModalEnum.HIERARCHY_COPY_BRANCH;

export const ModalCopyHierarchyBranch: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const nodes = useAppSelector(selectAllHierarchyTreeNodes) as ITreeMap;
  const { query } = useRouter();
  const selectedWorkspaceIds = parseOrgWorkspaceFilterIds(query);
  const copyMutation = useMutCopyHierarchyBranch();
  const [sourceTreeId, setSourceTreeId] = useState('');
  const [destination, setDestination] =
    useState<CopyHierarchyDestinationOption | null>(null);

  useEffect(() => {
    const initialData = getModalData(
      modalName,
    ) as typeof initialCopyHierarchyBranchState;

    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setSourceTreeId(initialData.sourceTreeId || '');
      setDestination(null);
    }
  }, [getModalData]);

  const source = sourceTreeId ? nodes?.[sourceTreeId] : undefined;
  const destinations = useMemo(() => {
    if (!source) return [];
    return getCopyHierarchyDestinationOptions({
      source,
      nodes,
      selectedWorkspaceIds,
    });
  }, [nodes, selectedWorkspaceIds, source]);

  const hasDescendants = source
    ? collectSubtreeTreeIds(String(source.id), nodes).size > 1
    : false;

  const onClose = () => {
    onCloseModal(modalName);
    setSourceTreeId('');
    setDestination(null);
  };

  const handleCopy = async () => {
    if (!source || !destination) return;

    try {
      await copyMutation.mutateAsync({
        sourceHierarchyId: getHierarchyIdFromTreeId(String(source.id)),
        sourceWorkspaceId: getWorkspaceIdFromTreeNode(source),
        targetParentId: destination.targetParentId,
        targetWorkspaceId: destination.targetWorkspaceId,
      });
      onClose();
    } catch {
      // Erro já exibido no toast; a árvore local permanece intacta.
    }
  };

  const buttons = [
    {
      text: 'Cancelar',
      variant: 'outlined',
      onClick: onClose,
      disabled: copyMutation.isLoading,
    },
    {
      text: 'Copiar estrutura',
      variant: 'contained',
      onClick: handleCopy,
      disabled: !destination || copyMutation.isLoading,
    },
  ] as IModalButton[];

  return (
    <SModal {...registerModal(modalName)} keepMounted={false} onClose={onClose}>
      <SModalPaper width={['100%', 520]} center p={8}>
        <SModalHeader onClose={onClose} title="Copiar estrutura" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <SText>
            Será criada uma nova estrutura no destino. Trabalhadores, GSE,
            riscos e demais dados de SST não serão copiados.
          </SText>
          {hasDescendants ? (
            <SText>Toda a estrutura descendente será copiada.</SText>
          ) : null}
          {source ? (
            <SText color="text.secondary">
              Origem: {formatCopyHierarchyDestinationLabel({
                label: source.label,
                workspaceLabel: getWorkspaceLabelFromTreeNode(source, nodes),
              })}
            </SText>
          ) : (
            <Alert severity="warning">
              Não foi possível localizar o card de origem.
            </Alert>
          )}
          <Autocomplete
            options={destinations}
            value={destination}
            onChange={(_, value) => setDestination(value)}
            getOptionLabel={(option) =>
              formatCopyHierarchyDestinationLabel(option)
            }
            isOptionEqualToValue={(option, value) =>
              option.treeId === value.treeId
            }
            noOptionsText="Nenhum destino válido nos estabelecimentos visíveis"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Copiar para"
                placeholder="Selecione o destino"
              />
            )}
          />
        </Box>
        <SModalButtons
          loading={copyMutation.isLoading}
          onClose={onClose}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
