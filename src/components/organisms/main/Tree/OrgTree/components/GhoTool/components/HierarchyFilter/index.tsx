/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useEffect, useRef } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import {
  clearSelectedNodeIds,
  selectAllHierarchyTreeNodes,
  selectHierarchySelectedNodeIds,
  selectHierarchySelectionMode,
  setHierarchySearch,
  setSelectedNodeIds,
  setSelectionMode,
} from 'store/reducers/hierarchy/hierarchySlice';
import { useDebouncedCallback } from 'use-debounce';

import { SCheckIcon } from 'assets/icons/SCheckIcon';
import { SCloseIcon } from 'assets/icons/SCloseIcon';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGlobalModal } from 'core/hooks/useGlobalModal';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';
import { useMutBulkDeleteHierarchy } from 'core/services/hooks/mutations/checklist/hierarchy/useMutBulkDeleteHierarchy';
import { PermissionEnum } from 'project/enum/permission.enum';

import {
  formatHierarchyTypeSummary,
  isHierarchyNodeSelectable,
  toHierarchyApiId,
} from '../../../../constants/hierarchy-selection.constant';
import { usePreventNode } from '../../../../hooks/usePreventNode';
import { STSInput } from './styles';
import { GhoHeaderProps } from './types';

export const HierarchyFilter: FC<{ children?: any } & GhoHeaderProps> = () => {
  const dispatch = useAppDispatch();
  const { onOpenModal } = useModal();
  const { isValidPermissions } = useAccess();
  const canSanitize = isValidPermissions([PermissionEnum.EMPLOYEE]);
  const ref = useRef<HTMLInputElement>(null);
  const search = useAppSelector((s) => s.hierarchy.search);
  const selectionMode = useAppSelector(selectHierarchySelectionMode);
  const selectedNodeIds = useAppSelector(selectHierarchySelectedNodeIds);
  const nodes = useAppSelector(selectAllHierarchyTreeNodes);
  const { searchFilterNodes, removeNodesFromTree } = useHierarchyTreeActions();
  const { preventDelete } = usePreventNode();
  const { onOpenGlobalModal } = useGlobalModal();
  const bulkDeleteMutation = useMutBulkDeleteHierarchy();

  useEffect(() => {
    if (ref.current) {
      if (search) ref.current.value = search;
      else ref.current.value = '';
    }
  }, [search]);

  const exitSelectionMode = useCallback(() => {
    dispatch(setSelectionMode(false));
  }, [dispatch]);

  useEffect(() => {
    if (!selectionMode) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        exitSelectionMode();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exitSelectionMode, selectionMode]);

  const handleSearch = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 1000);

  const onSearch = (value: string) => {
    searchFilterNodes(value);
    dispatch(setHierarchySearch(value));
  };

  const handleOpenHierarchyModal = () => {
    onOpenModal(ModalEnum.HIERARCHIES_EXCEL_ADD);
  };

  const handleOpenSanitizationModal = () => {
    onOpenModal(ModalEnum.HIERARCHY_SANITIZATION);
  };

  const handleEnterSelectionMode = () => {
    dispatch(setSelectionMode(true));
  };

  const handleClearSelection = () => {
    dispatch(clearSelectedNodeIds());
  };

  const handleSelectVisible = () => {
    const visibleIds = Object.values(nodes)
      .filter(
        (node) =>
          !node.hide && isHierarchyNodeSelectable(node) && node.id !== 'mock_id',
      )
      .map((node) => String(node.id));
    dispatch(setSelectedNodeIds(visibleIds));
  };

  const handleBulkDelete = async () => {
    if (!selectedNodeIds.length || bulkDeleteMutation.isLoading) return;

    const apiIds = [
      ...new Set(selectedNodeIds.map((id) => toHierarchyApiId(id))),
    ];

    try {
      const preview = await bulkDeleteMutation.mutateAsync({
        ids: apiIds,
        confirm: false,
      });

      if (!preview) return;

      const deletableCount = Object.values(preview.typeSummary || {}).reduce(
        (acc: number, count) => acc + (count || 0),
        0,
      );
      const blockedCount = preview.blocked?.length || 0;
      const typeLines = formatHierarchyTypeSummary(preview.typeSummary);
      const blockedPreview = (preview.blocked || []).slice(0, 5);

      if (deletableCount === 0) {
        onOpenGlobalModal({
          title: 'Exclusão bloqueada',
          confirmText: 'Ok',
          confirmCancel: '',
          tag: 'warning',
          text: (
            <Box>
              <SText fontSize={14} mb={2}>
                Nenhum dos {preview.requested} item(ns) selecionado(s) pode ser
                excluído.
              </SText>
              {blockedPreview.map((item) => (
                <SText key={item.id} fontSize={13} color="text.secondary">
                  • {item.name}
                  {item.type ? ` (${item.type})` : ''}: {item.reason}
                </SText>
              ))}
              {blockedCount > 5 && (
                <SText fontSize={13} color="text.secondary" mt={1}>
                  … e mais {blockedCount - 5} item(ns)
                </SText>
              )}
            </Box>
          ),
        });
        return;
      }

      preventDelete(
        async () => {
          const result = await bulkDeleteMutation.mutateAsync({
            ids: apiIds,
            confirm: true,
          });

          if (!result?.deletedIds?.length) return;

          removeNodesFromTree(result.deletedIds);
          exitSelectionMode();
        },
        (
          <Box>
            <SText fontSize={14} mb={2}>
              Selecionados: {preview.requested} · Podem ser excluídos:{' '}
              {deletableCount} · Bloqueados: {blockedCount}
            </SText>
            {!!typeLines.length && (
              <SText fontSize={13} mb={2}>
                Resumo: {typeLines.join(', ')}.
              </SText>
            )}
            {blockedCount > 0 && (
              <Box mb={2}>
                <SText fontSize={13} mb={1}>
                  {blockedCount}{' '}
                  {blockedCount === 1
                    ? 'item não pode ser excluído'
                    : 'itens não podem ser excluídos'}{' '}
                  (permanecerão no organograma):
                </SText>
                {blockedPreview.map((item) => (
                  <SText key={item.id} fontSize={13} color="text.secondary">
                    • {item.name}
                    {item.type ? ` (${item.type})` : ''}: {item.reason}
                  </SText>
                ))}
                {blockedCount > 5 && (
                  <SText fontSize={13} color="text.secondary" mt={1}>
                    … e mais {blockedCount - 5} item(ns)
                  </SText>
                )}
              </Box>
            )}
            <SText fontSize={13} color="error.main">
              Esta ação é irreversível. Os nós válidos serão excluídos em uma
              única operação; os bloqueados não serão alterados.
            </SText>
          </Box>
        ),
        {
          title: 'Excluir selecionados?',
          confirmText: `Excluir ${deletableCount}`,
          inputConfirm: true,
        },
      );
    } catch {
      // erro já tratado no onError da mutation
    }
  };

  const selectedCount = selectedNodeIds.length;

  return (
    <SFlex align="center" gap={4} ml={13} mt={10} flexWrap="wrap">
      <STSInput
        size="small"
        inputRef={ref}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={'Pesquisar no organograma...'}
        subVariant="search"
        fullWidth
      />

      {!selectionMode && (
        <>
          <STagButton
            large
            text="Selecionar"
            tooltipTitle="Selecionar (Shift + clique)"
            icon={SCheckIcon}
            onClick={handleEnterSelectionMode}
          />
          <STagButton
            large
            tooltipTitle="Importar e exportar o organograma da empresa por planilhas"
            icon={SUploadIcon}
            onClick={handleOpenHierarchyModal}
          />
          {canSanitize && (
            <STagButton
              large
              text="Sanitizar organograma"
              tooltipTitle="Localizar e excluir cargos sem utilização (comuns e desenvolvidos)"
              icon={SDeleteIcon}
              onClick={handleOpenSanitizationModal}
            />
          )}
        </>
      )}

      {selectionMode && (
        <>
          <SText
            fontSize={13}
            sx={{ whiteSpace: 'nowrap', color: 'text.secondary', px: 1 }}
          >
            {selectedCount} selecionado{selectedCount === 1 ? '' : 's'}
          </SText>
          <STagButton
            large
            text="Selecionar visíveis"
            tooltipTitle="Selecionar todos os nós visíveis e elegíveis"
            onClick={handleSelectVisible}
            disabled={bulkDeleteMutation.isLoading}
          />
          <STagButton
            large
            text="Limpar"
            tooltipTitle="Limpar seleção"
            onClick={handleClearSelection}
            disabled={!selectedCount || bulkDeleteMutation.isLoading}
          />
          <STagButton
            large
            text={`Excluir selecionados${
              selectedCount ? ` (${selectedCount})` : ''
            }`}
            tooltipTitle="Excluir nós selecionados"
            icon={SDeleteIcon}
            bg="error.main"
            active
            loading={bulkDeleteMutation.isLoading}
            disabled={!selectedCount || bulkDeleteMutation.isLoading}
            onClick={handleBulkDelete}
          />
          <STagButton
            large
            text="Cancelar"
            tooltipTitle="Sair do modo de seleção (Esc)"
            icon={SCloseIcon}
            onClick={exitSelectionMode}
            disabled={bulkDeleteMutation.isLoading}
          />
        </>
      )}
    </SFlex>
  );
};
