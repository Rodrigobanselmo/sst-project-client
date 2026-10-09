import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { HierarchyHomoTable } from 'components/organisms/tables/HierarchyHomoTable/HierarchyHomoTable';
import { useStartEndDate } from 'components/organisms/modals/ModalAddCharacterization/hooks/useStartEndDate';
import { initialHierarchySelectState } from 'components/organisms/modals/ModalSelectHierarchy';
import { resolveHierarchyTypeLabelsFromCompany } from 'core/constants/maps/hierarchy-type-labels';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IHierarchyChildren } from 'core/interfaces/api/IHierarchy';
import {
  CharacterizationHierarchyUnlinkError,
  commitCharacterizationHierarchySelection,
} from 'components/organisms/modals/ModalAddCharacterization/hooks/commit-characterization-hierarchy-selection';
import { deleteGho } from 'core/services/hooks/mutations/checklist/gho/useMutDeleteHierarchyGho/useMutDeleteHierarchyGho';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { buildGseCargoTabRows } from 'core/utils/gse-effective-office-membership.util';

import {
  hierarchyMapToCoverageNodes,
  officesForSelectedEstablishment,
} from '../characterization-office-coverage.util';
import { invalidateCharacterizationInventory } from './invalidate-characterization-inventory';

type CharacterizationCargoManagerDialogProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  row: CharacterizationBrowseResultModel | null;
  preferAdd?: boolean;
};

export function CharacterizationCargoManagerDialog({
  open,
  onClose,
  companyId,
  workspaceId,
  row,
  preferAdd = false,
}: CharacterizationCargoManagerDialogProps) {
  const characterizationId = row?.id || '';
  const { onStackOpenModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const { selectStartEndDate } = useStartEndDate();
  const upsertMutation = useMutUpsertCharacterization();
  const { data: ghoQuery } = useQueryGHOAll();
  const { data: company } = useQueryCompany();
  const hierarchyQuery = useQueryHierarchies(companyId);
  const didAutoAddRef = useRef(false);
  const closingAfterLastUnlinkRef = useRef(false);

  const {
    data: detail,
    isLoading,
    isFetching,
    refetch,
  } = useQueryCharacterization(open ? characterizationId : '', {
    companyId,
    workspaceId,
  });

  const hierarchies = useMemo(() => detail?.hierarchies || [], [detail]);

  const cargoCoverageRows = useMemo(() => {
    const nodes = officesForSelectedEstablishment(
      hierarchyMapToCoverageNodes(hierarchyQuery.data),
      workspaceId,
    );
    if (!hierarchyQuery.isSuccess || !nodes.length || !hierarchies.length) {
      return [];
    }

    const workspaceNamesById = (company?.workspace || []).reduce(
      (acc, workspace) => {
        acc[workspace.id] = workspace.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    return buildGseCargoTabRows({
      nodes,
      hierarchies,
      gseWorkspaceIds: workspaceId ? [workspaceId] : [],
      workspaceNamesById,
      companyId,
      typeLabels: resolveHierarchyTypeLabelsFromCompany(company),
    });
  }, [
    company,
    companyId,
    hierarchies,
    hierarchyQuery.data,
    hierarchyQuery.isSuccess,
    workspaceId,
  ]);

  const refresh = useCallback(async () => {
    await refetch();
    await invalidateCharacterizationInventory({
      companyId,
      workspaceId,
      characterizationId,
    });
  }, [companyId, workspaceId, characterizationId, refetch]);

  const handleClose = useCallback(async () => {
    await invalidateCharacterizationInventory({
      companyId,
      workspaceId,
      characterizationId,
    });
    onClose();
  }, [companyId, workspaceId, characterizationId, onClose]);

  const onUnlinkSuccess = useCallback(
    async ({ remainingActiveCount }: { remainingActiveCount: number }) => {
      if (remainingActiveCount > 0) {
        await refresh();
        return;
      }

      // Último vínculo ativo removido com sucesso → fecha o modal.
      if (closingAfterLastUnlinkRef.current) return;
      closingAfterLastUnlinkRef.current = true;
      await invalidateCharacterizationInventory({
        companyId,
        workspaceId,
        characterizationId,
      });
      onClose();
      closingAfterLastUnlinkRef.current = false;
    },
    [refresh, companyId, workspaceId, characterizationId, onClose],
  );

  const onAddHierarchy = useCallback(() => {
    if (!detail?.id) return;

    const handleSelect = (
      selected: IHierarchyChildren[],
      startDate: Date,
      endDate: Date,
      close?: () => void,
    ) => {
      void commitCharacterizationHierarchySelection({
        hierarchies,
        confirmedHierarchyIds: selected.map((h) =>
          String(h.id).split('//')[0],
        ),
        workspaceId,
        unlink: (ids) => deleteGho({ ids, companyId }, companyId),
        upsert: () =>
          upsertMutation.mutateAsync({
            id: detail.id,
            name: detail.name,
            type: detail.type,
            companyId,
            workspaceId,
            startDate,
            endDate,
            hierarchyIds: selected.map((h) => String(h.id).split('//')[0]),
          }),
        refreshAfterPartialFailure: refresh,
      })
        .then(async () => {
          close?.();
          await refresh();
        })
        .catch((error) => {
          if (error instanceof CharacterizationHierarchyUnlinkError) {
            enqueueSnackbar(
              'Não foi possível remover os vínculos. A seleção não foi salva.',
              { variant: 'error' },
            );
          }
        });
    };

    onStackOpenModal(ModalEnum.HIERARCHY_SELECT, {
      keepOpen: true,
      onSelect: (hIds, closeModal) =>
        selectStartEndDate((d) => {
          handleSelect(hIds, d.startDate, d.endDate, closeModal);
        }),
      selectByGHO: ghoQuery.some((gho) => !gho.type),
      workspaceId,
      addSubOffice: true,
      forceCargoFilter: true,
      characterizationCargoSelect: true,
      characterizationId: detail.id,
      hierarchiesIds: hierarchies
        .filter((h) =>
          (h as any)?.hierarchyOnHomogeneous?.some((hg: any) => !hg?.endDate),
        )
        .map((hierarchy) =>
          String(hierarchy.id).split('//').length === 1
            ? `${String(hierarchy.id)}//${workspaceId}`
            : String(hierarchy.id),
        ),
      allHierarchiesIds: hierarchies
        .filter((h) =>
          (h as any)?.hierarchyOnHomogeneous?.some((hg: any) => !hg?.endDate),
        )
        .map((hierarchy) =>
          String(hierarchy.id).split('//').length === 1
            ? `${String(hierarchy.id)}//${workspaceId}`
            : String(hierarchy.id),
        ),
    } as typeof initialHierarchySelectState);
  }, [
    detail,
    companyId,
    workspaceId,
    hierarchies,
    ghoQuery,
    onStackOpenModal,
    selectStartEndDate,
    upsertMutation,
    refresh,
    enqueueSnackbar,
  ]);

  useEffect(() => {
    if (!open) {
      didAutoAddRef.current = false;
      closingAfterLastUnlinkRef.current = false;
      return;
    }
    if (!preferAdd || !detail?.id || isLoading || didAutoAddRef.current) return;
    didAutoAddRef.current = true;
    onAddHierarchy();
  }, [open, preferAdd, detail?.id, isLoading, onAddHierarchy]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle sx={{ pr: 6 }}>
        Cargos — {row?.name || 'Elemento'}
        <IconButton
          aria-label="Fechar"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Remover um vínculo não exclui o cargo da empresa. Pode alterar
          cobertura ocupacional, GSE e PCMSO.
        </Typography>
        {isLoading || (isFetching && !detail?.id) ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <HierarchyHomoTable
            onAdd={onAddHierarchy}
            loading={isLoading || upsertMutation.isLoading}
            hierarchies={hierarchies as any}
            isCreate={false}
            fixedRowsPerPage={15}
            groupBySector
            preferredWorkspaceId={workspaceId}
            gseWorkspaceIds={workspaceId ? [workspaceId] : []}
            coverageRows={
              hierarchyQuery.isSuccess && cargoCoverageRows.length
                ? cargoCoverageRows
                : undefined
            }
            onUnlinkSuccess={onUnlinkSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
