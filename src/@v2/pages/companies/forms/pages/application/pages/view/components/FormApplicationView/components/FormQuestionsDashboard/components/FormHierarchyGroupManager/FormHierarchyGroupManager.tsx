import AddIcon from '@mui/icons-material/Add';
import { Box, Typography } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { useFetchBrowseHierarchyGroups } from '@v2/services/forms/hierarchy-group/browse-hierarchy-groups/hooks/useFetchBrowseHierarchyGroups';
import { useMutateUpsertHierarchyGroups } from '@v2/services/forms/hierarchy-group/upsert-hierarchy-groups/hooks/useMutateUpsertHierarchyGroups';
import { useMutateDeleteHierarchyGroup } from '@v2/services/forms/hierarchy-group/delete-hierarchy-group/hooks/useMutateDeleteHierarchyGroup';
import { useFetchBrowseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/hooks/useFetchBrowseFormQuestionsAnswersRisks';
import { useMemo, useState } from 'react';
import {
  HierarchyGroupsTable,
  HierarchyGroupRow,
} from './components/HierarchyGroupsTable';
import { UpsertHierarchyGroupModal } from './components/UpsertHierarchyGroupModal';
import { DeleteHierarchyGroupModal } from './components/DeleteHierarchyGroupModal';
import {
  buildHierarchyGroupOptionLabels,
  type HierarchyGroupOption,
} from './helpers/formatHierarchyGroupOptionLabel';

interface FormHierarchyGroupManagerProps {
  formApplication: FormApplicationReadModel;
  accessCompanyId: string;
  inline?: boolean;
}

export const FormHierarchyGroupManager = ({
  formApplication,
  accessCompanyId,
}: FormHierarchyGroupManagerProps) => {
  const [upsertModalOpen, setUpsertModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<HierarchyGroupRow | null>(
    null,
  );
  const [deletingGroup, setDeletingGroup] = useState<HierarchyGroupRow | null>(
    null,
  );

  const { hierarchyGroups } = useFetchBrowseHierarchyGroups({
    companyId: accessCompanyId,
    applicationId: formApplication.id,
  });

  const { mutate: upsertGroups, isPending: isUpserting } =
    useMutateUpsertHierarchyGroups();
  const { mutate: deleteGroup, isPending: isDeleting } =
    useMutateDeleteHierarchyGroup();

  const { formQuestionsAnswersRisks } = useFetchBrowseFormQuestionsAnswersRisks(
    {
      companyId: accessCompanyId,
      applicationId: formApplication.id,
    },
  );

  const entityMap = formQuestionsAnswersRisks?.entityMap ?? {};
  const eligibleEntityMap = formQuestionsAnswersRisks?.eligibleEntityMap ?? {};

  const eligibleHierarchies = useMemo((): HierarchyGroupOption[] => {
    return Object.values(eligibleEntityMap).map((h) => ({
      id: h.id,
      name: h.name,
      establishment: h.establishment,
      companyName: h.companyName,
      participantCount: h.participantCount,
    }));
  }, [eligibleEntityMap]);

  const hierarchyOptionLabels = useMemo(
    () => buildHierarchyGroupOptionLabels(eligibleHierarchies),
    [eligibleHierarchies],
  );

  const assignedHierarchyIds = useMemo(() => {
    const ids = new Set<string>();
    hierarchyGroups.forEach((g) => {
      if (editingGroup && g.id === editingGroup.id) return;
      g.hierarchyIds.forEach((id) => ids.add(id));
    });
    return ids;
  }, [hierarchyGroups, editingGroup]);

  const tableRows: HierarchyGroupRow[] = useMemo(() => {
    const resolveLabel = (id: string): string => {
      if (hierarchyOptionLabels.has(id)) {
        return hierarchyOptionLabels.get(id)!;
      }
      const eligible = eligibleEntityMap[id];
      if (eligible) return eligible.name;
      return entityMap[id]?.name ?? id;
    };

    return hierarchyGroups.map((group) => ({
      id: group.id,
      name: group.name,
      hierarchyIds: group.hierarchyIds,
      hierarchyNames: group.hierarchyIds.map((id) => resolveLabel(id)),
    }));
  }, [hierarchyGroups, hierarchyOptionLabels, eligibleEntityMap, entityMap]);

  const modalHierarchies = useMemo((): HierarchyGroupOption[] => {
    const byId = new Map(eligibleHierarchies.map((h) => [h.id, h]));

    const selectedIds = editingGroup?.hierarchyIds ?? [];
    for (const id of selectedIds) {
      if (byId.has(id)) continue;
      const fromEligible = eligibleEntityMap[id];
      const fromEntity = entityMap[id];
      const source = fromEligible ?? fromEntity;
      if (!source) continue;
      byId.set(id, {
        id: source.id,
        name: source.name,
        establishment: fromEligible?.establishment,
        companyName: fromEligible?.companyName,
        participantCount: fromEligible?.participantCount,
      });
    }

    return Array.from(byId.values());
  }, [eligibleHierarchies, editingGroup, eligibleEntityMap, entityMap]);

  const modalOptionLabels = useMemo(
    () => buildHierarchyGroupOptionLabels(modalHierarchies),
    [modalHierarchies],
  );

  const handleOpenAddModal = () => {
    setEditingGroup(null);
    setUpsertModalOpen(true);
  };

  const handleOpenEditModal = (group: HierarchyGroupRow) => {
    setEditingGroup(group);
    setUpsertModalOpen(true);
  };

  const handleOpenDeleteModal = (group: HierarchyGroupRow) => {
    setDeletingGroup(group);
    setDeleteModalOpen(true);
  };

  const handleCloseUpsertModal = () => {
    setUpsertModalOpen(false);
    setEditingGroup(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingGroup(null);
  };

  const handleSave = (data: { name: string; hierarchyIds: string[] }) => {
    const groups = editingGroup
      ? hierarchyGroups.map((g) =>
          g.id === editingGroup.id
            ? { id: g.id, name: data.name, hierarchyIds: data.hierarchyIds }
            : { id: g.id, name: g.name, hierarchyIds: g.hierarchyIds },
        )
      : [
          ...hierarchyGroups.map((g) => ({
            id: g.id,
            name: g.name,
            hierarchyIds: g.hierarchyIds,
          })),
          { name: data.name, hierarchyIds: data.hierarchyIds },
        ];

    upsertGroups(
      {
        companyId: accessCompanyId,
        applicationId: formApplication.id,
        groups,
      },
      {
        onSuccess: handleCloseUpsertModal,
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingGroup) return;

    deleteGroup(
      {
        companyId: accessCompanyId,
        applicationId: formApplication.id,
        groupId: deletingGroup.id,
      },
      {
        onSuccess: handleCloseDeleteModal,
      },
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <SFlex justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Agrupamentos de Setores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Agrupe setores para combinar seus dados nos indicadores. Na análise
            de riscos, os setores continuarão sendo exibidos individualmente,
            mas com a probabilidade calculada pelo grupo.
          </Typography>
        </Box>
        <SButton
          variant="contained"
          color="primary"
          text="Adicionar"
          icon={<AddIcon />}
          onClick={handleOpenAddModal}
        />
      </SFlex>

      <HierarchyGroupsTable
        groups={tableRows}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />

      <UpsertHierarchyGroupModal
        open={upsertModalOpen}
        onClose={handleCloseUpsertModal}
        onSave={handleSave}
        availableHierarchies={modalHierarchies}
        eligibleHierarchyIds={new Set(Object.keys(eligibleEntityMap))}
        hierarchyOptionLabels={modalOptionLabels}
        assignedHierarchyIds={assignedHierarchyIds}
        initialData={
          editingGroup
            ? {
                name: editingGroup.name,
                hierarchyIds: editingGroup.hierarchyIds,
              }
            : undefined
        }
        loading={isUpserting}
      />

      <DeleteHierarchyGroupModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        groupName={deletingGroup?.name ?? ''}
        loading={isDeleting}
      />
    </Box>
  );
};
