import React, { useCallback, useEffect, useRef, useState } from 'react';

import { initialCharacterizationState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';
import {
  CharacterizationTypeEnum,
  getIsEnvironment,
} from 'project/enum/characterization-type.enum';
import {
  selectGhoId,
  selectGhoOpen,
  setGhoSearch,
  setGhoSearchSelect,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRiskAddExpand,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IGho } from 'core/interfaces/api/IGho';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useMutCreateGho } from 'core/services/hooks/mutations/checklist/gho/useMutCreateGho';
import { useMutDeleteGho } from 'core/services/hooks/mutations/checklist/gho/useMutDeleteGho';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { GhoToolHeader } from './components/GhoToolHeader';
import { GhoToolTopButtons } from './components/GhoToolTopButtons';
import { GhoToolTreeFilter } from './components/GhoToolTreeFilter';
import { GhoToolView } from './components/GhoToolView';
import { STBoxContainer, STBoxStack, STTableContainer } from './styles';

const homoCharacterizationTabs = new Set<HomoTypeEnum>([
  HomoTypeEnum.ENVIRONMENT,
  HomoTypeEnum.WORKSTATION,
  HomoTypeEnum.EQUIPMENT,
  HomoTypeEnum.ACTIVITIES,
]);

const modalPayloadForHomoFilter = (
  homoFilter: HomoTypeEnum,
  companyId: string,
  workspaceId: string,
): Partial<typeof initialCharacterizationState> => {
  const base = { companyId, workspaceId };
  let charType: CharacterizationTypeEnum | undefined;
  if (homoFilter === HomoTypeEnum.ENVIRONMENT) {
    charType = CharacterizationTypeEnum.GENERAL;
  } else if (homoFilter === HomoTypeEnum.WORKSTATION) {
    charType = CharacterizationTypeEnum.WORKSTATION;
  } else if (homoFilter === HomoTypeEnum.EQUIPMENT) {
    charType = CharacterizationTypeEnum.EQUIPMENT;
  } else if (homoFilter === HomoTypeEnum.ACTIVITIES) {
    charType = CharacterizationTypeEnum.ACTIVITIES;
  }

  if (!charType) return base;

  return {
    ...base,
    type: charType,
    characterizationType: getIsEnvironment(charType)
      ? ('environment' as const)
      : ('characterization' as const),
  } as Partial<typeof initialCharacterizationState>;
};

export const GhoTool = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { pathname, query } = useRouter();
  const { data: company } = useQueryCompany();
  const { preventDelete } = usePreventAction();
  const { onOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const selectedGhoId = useAppSelector(selectGhoId);
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const selectExpanded = useAppSelector(selectRiskAddExpand);
  const addMutation = useMutCreateGho();
  const deleteMutation = useMutDeleteGho();

  useEffect(() => {
    dispatch(setGhoSearch(''));
    dispatch(setGhoSearchSelect(''));
  }, [dispatch]);

  // HomoTypeEnum.GSE is 0 — do not use `|| null` or the default becomes null and breaks the list filter.
  const [filter, setFilter] = useState<HomoTypeEnum | null>(HomoTypeEnum.GSE);

  const handleAddGHO = async () => {
    onOpenModal(ModalEnum.GHO_ADD);
  };

  const handleEditGHO = (data: IGho) => {
    onOpenModal(ModalEnum.GHO_ADD, {
      id: data.id,
      name: data.name,
      status: data.status,
      description: data.description,
    });
  };

  const handleDeleteGHO = useCallback(
    (id: string, data?: IGho) => {
      preventDelete(
        async () => {
          await deleteMutation.mutateAsync(id).catch(() => {});
          dispatch(setGhoState({ hierarchies: [], data: null }));
        },
        <span>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Deletar {data?.name}
          </p>
          Você tem certeza que deseja remover permanentemente o grupo similar de
          esposição <b>{data?.name}</b>.
          <br />
          <br />
          Todos os dados de <b>Fatores de Risco / Perigos</b> vinculados a ele
          seram perdidos
        </span>,
        { inputConfirm: true },
      );
    },
    [deleteMutation, dispatch, preventDelete],
  );

  const handleSelectGHO = useCallback(
    (gho: IGho | null, hierarchies: string[]) => {
      if (!gho) {
        if (!selectExpanded) dispatch(setRiskAddToggleExpand());
        return dispatch(setGhoState({ hierarchies: [], data: null }));
      }

      const data = {
        hierarchies: hierarchies,
        data: gho,
      };

      if (selectExpanded) dispatch(setRiskAddToggleExpand());
      dispatch(setGhoState(data));
    },
    [dispatch, selectExpanded],
  );

  const handleFilter = (filter: HomoTypeEnum | null) => {
    setFilter(filter);
  };

  const isOrgHierarquiaContext =
    pathname.includes('/empresas/') && pathname.includes('/hierarquia');
  const tabWorkspaceId = isOrgHierarquiaContext
    ? (query.tabWorkspaceId as string | undefined)
    : undefined;

  const handleAddCharacterization = useCallback(() => {
    if (!company?.id || filter == null || !homoCharacterizationTabs.has(filter))
      return;

    const openModal = (workId: string) => {
      onOpenModal(
        ModalEnum.CHARACTERIZATION_ADD,
        modalPayloadForHomoFilter(filter, company.id, workId),
      );
    };

    if (tabWorkspaceId) {
      openModal(tabWorkspaceId);
      return;
    }

    const workspaces = company.workspace || [];
    if (workspaces.length === 1) {
      openModal(workspaces[0].id);
      return;
    }

    onOpenModal(ModalEnum.WORKSPACE_SELECT, {
      title: 'Selecione para qual Estabelecimento deseja adicionar',
      onSelect: (workspace: IWorkspace | IWorkspace[]) => {
        const w = Array.isArray(workspace) ? workspace[0] : workspace;
        if (w?.id) openModal(w.id);
      },
    } as typeof initialWorkspaceSelectState);
  }, [company?.id, company?.workspace, filter, onOpenModal, tabWorkspaceId]);

  return (
    <>
      {isGhoOpen && (
        <STBoxContainer expanded={selectExpanded ? 1 : 0}>
          <GhoToolTopButtons handleSelectGHO={handleSelectGHO} />
          <STTableContainer>
            <GhoToolHeader
              handleSelectGHO={handleSelectGHO}
              handleEditGHO={handleEditGHO}
              handleAddGHO={handleAddGHO}
              handleAddCharacterization={
                filter != null && homoCharacterizationTabs.has(filter)
                  ? handleAddCharacterization
                  : undefined
              }
              isAddLoading={addMutation.isLoading}
              inputRef={inputRef}
              filter={filter}
            />

            <STBoxStack expanded={selectExpanded ? 1 : 0}>
              <GhoToolView
                handleEditGHO={handleEditGHO}
                handleSelectGHO={handleSelectGHO}
                handleDeleteGHO={handleDeleteGHO}
                selectedGhoId={selectedGhoId}
                isDeleteLoading={deleteMutation.isLoading}
                handleFilter={handleFilter}
                filter={filter}
              />
            </STBoxStack>
            <GhoToolTreeFilter />
          </STTableContainer>
        </STBoxContainer>
      )}
      <ModalAddProbability />
      <ModalExcelHierarchies />
    </>
  );
};

//  <Slide
//     direction="left"
//     in={isGhoOpen || isRiskOpen}
//     mountOnEnter
//     unmountOnExit
//   ></Slide>
