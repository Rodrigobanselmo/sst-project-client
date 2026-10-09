import React, { FC, useEffect, useMemo, useState } from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import {
  selectHierarchySearch,
  selectModalSelectIds,
  markGseCargoSelectionTouched,
  setAddModalId,
  setHierarchySearch,
  setModalIds,
  setRemoveModalId,
} from 'store/reducers/hierarchy/hierarchySlice';

import { SAddIcon } from 'assets/icons/SAddIcon';
import SCloseIcon from 'assets/icons/SCloseIcon';
import { SEditIcon } from 'assets/icons/SEditIcon';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHierarchyTypeLabels } from 'core/hooks/useHierarchyTypeLabels';
import {
  IListHierarchyQuery,
  useListHierarchyQuery,
} from 'core/hooks/useListHierarchyQuery';
import { useModal } from 'core/hooks/useModal';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { sortString } from 'core/utils/sorts/string.sort';

import { initialHierarchySelectState } from '..';

import { initialAutomateSubOfficeState } from '../../ModalAutomateSubOffice/hooks/useHandleActions';
import { buildCharacterizationMembershipByHierarchyId } from '../characterization-cargo-membership.util';
import {
  hierarchyMatchesSectorGroupedSearch,
  toCharacterizationCargoModalRow,
  toSectorGroupedCargoModalRow,
} from '../characterization-cargo-modal-row.util';
import { buildGseMembershipByHierarchyId } from '../gse-cargo-membership.util';
import { groupModalHierarchyItemsBySector } from '../group-modal-hierarchy-by-sector.util';
import {
  keepModalIdsOutsideWorkspace,
  splitHierarchyModalId,
  uniqueModalIds,
} from '../gse-workspace-modal-selection.util';
import { GseCargoMembershipIcons } from './GseCargoMembershipIcons';
import { GseCargoRowContextIcons } from './GseCargoRowContextIcons';
import { CharacterizationCargoMembershipIcons } from './CharacterizationCargoMembershipIcons';
import { ModalInputHierarchy } from './ModalInputHierarchy';
import { ModalItemHierarchy } from './ModalItemHierarchy';
import { ModalListGHO } from './ModalListGHO';
import { STGridBox } from './styles';
import { IGho } from 'core/interfaces/api/IGho';
import { buildGseCargoModalView } from 'core/utils/gse-effective-office-membership.util';
import {
  indexStructureNodes,
  isOrganizationalStructure,
  pruneRedundantHierarchyModalIds,
  STRUCTURE_COVERAGE_TOOLTIP,
  STRUCTURE_FILTER,
  structureAppliesToWorkspace,
  structureBlockedByAncestor,
} from '../structure-hierarchy-selection.util';

export const ModalSelectHierarchyData: FC<
  { children?: any } & {
    company: ICompany;
    initWorkspaceSelected: IWorkspace;
    selectedData: typeof initialHierarchySelectState;
    handleSingleSelect: (hierarchy: IListHierarchyQuery) => void;
    setSelectData: React.Dispatch<React.SetStateAction<any>>;
  }
> = ({
  company,
  initWorkspaceSelected,
  selectedData,
  handleSingleSelect,
  setSelectData,
}) => {
  const { data: ghoQueryRaw } = useQueryGHOAll();

  const dispatch = useAppDispatch();
  const { onStackOpenModal } = useModal();
  const search = useAppSelector(selectHierarchySearch);
  const modalSelectIds = useAppSelector(selectModalSelectIds);
  const [workspaceSelected, setWorkspaceSelected] = useState(
    initWorkspaceSelected,
  );

  const ghoQuery = useMemo((): IGho[] => {
    if (!workspaceSelected?.id) return [];

    return ghoQueryRaw
      .filter((i) => i.workspaces?.find((w) => w.id == workspaceSelected.id))
      .map<IGho>((item) => ({
        ...item,
        hierarchies: item.hierarchies
          ?.filter((i) =>
            i.workspaces?.find((w) => w.id == workspaceSelected.id),
          )
          .map((i) => ({ ...i, workspaceId: workspaceSelected.id })),
      }));
  }, [ghoQueryRaw, workspaceSelected]);

  const showGho =
    selectedData.selectByGHO && ghoQuery.length && !selectedData.forceCargoFilter;
  const forceCargoFilter = !!selectedData.forceCargoFilter;
  const isCharacterizationCargoSelect = !!selectedData.characterizationCargoSelect;
  const isGseCargoSelect = !!selectedData.gseCargoSelect;

  const noteGseCargoUserEdit = () => {
    if (!isGseCargoSelect) return;
    dispatch(markGseCargoSelectionTouched());
  };

  const [filter, setFilter] = useState<HierarchyEnum | 'GHO' | 'STRUCTURE'>(
    forceCargoFilter ? HierarchyEnum.OFFICE : showGho ? 'GHO' : HierarchyEnum.OFFICE,
  );
  const [allTypes, setAllTypes] = useState<Record<HierarchyEnum, boolean>>(
    {} as Record<HierarchyEnum, boolean>,
  );

  useEffect(() => {
    if (showGho && !forceCargoFilter) setFilter('GHO');
  }, [showGho, forceCargoFilter]);

  useEffect(() => {
    if (!forceCargoFilter) return;
    setFilter(HierarchyEnum.OFFICE);
    dispatch(setHierarchySearch(''));
  }, [dispatch, forceCargoFilter, isCharacterizationCargoSelect]);

  useEffect(() => {
    if (selectedData.gseCargoSelect && !selectedData.gseCargoHydrated) return;
    dispatch(setModalIds(selectedData.hierarchiesIds));
  }, [
    dispatch,
    selectedData.gseCargoHydrated,
    selectedData.gseCargoSelect,
    selectedData.hierarchiesIds,
  ]);

  useEffect(() => {
    if (selectedData.gseCargoSelect || selectedData.characterizationCargoSelect) return;
    dispatch(setModalIds(selectedData.hierarchiesIds));
  }, [
    workspaceSelected?.name,
    dispatch,
    selectedData.gseCargoSelect,
    selectedData.characterizationCargoSelect,
    selectedData.hierarchiesIds,
  ]);

  const { hierarchyListData } = useListHierarchyQuery();
  const hierarchyTypeLabels = useHierarchyTypeLabels();

  const hierarchyList = useMemo((): IListHierarchyQuery[] => {
    const typesSelected: Record<HierarchyEnum, boolean> = {} as Record<
      HierarchyEnum,
      boolean
    >;

    const list = hierarchyListData()
      .filter((hierarchy) => {
        (typesSelected as any)[hierarchy.type] = true;
        // eslint-disable-next-line prettier/prettier
        const isWorkspace =
          workspaceSelected &&
          hierarchy.workspaceIds.includes(workspaceSelected?.id);
        // eslint-disable-next-line prettier/prettier
        const isToFilter =
          search &&
          !hierarchyMatchesSectorGroupedSearch(hierarchy, search, {
            includeSectorPath: isGseCargoSelect,
          });

        if (filter === 'GHO') return !isToFilter && isWorkspace;
        if (filter === STRUCTURE_FILTER) return false;
        return (hierarchy as any).type === filter && !isToFilter && isWorkspace;
      })
      .map((hierarchy) => ({
        ...hierarchy,
        id: hierarchy.id + '//' + workspaceSelected?.id,
      }));

    setAllTypes(typesSelected);

    return list;
  }, [filter, hierarchyListData, isGseCargoSelect, search, workspaceSelected]);

  const hierarchyListSelected = useMemo(() => {
    return hierarchyListData().map((hierarchy) => ({
      ...hierarchy,
      id: hierarchy.id + '//' + workspaceSelected?.id,
    }));
  }, [hierarchyListData, workspaceSelected?.id]);

  const hierarchyById = useMemo(() => {
    const map = new Map<string, IListHierarchyQuery>();
    hierarchyListData().forEach((hierarchy) => {
      map.set(hierarchy.id, hierarchy);
    });
    return map;
  }, [hierarchyListData]);

  const gseMembershipByHierarchyId = useMemo(() => {
    if (!isGseCargoSelect || !workspaceSelected?.id) {
      return new Map();
    }
    return buildGseMembershipByHierarchyId(ghoQueryRaw, workspaceSelected.id);
  }, [ghoQueryRaw, isGseCargoSelect, workspaceSelected?.id]);

  const characterizationMembershipByHierarchyId = useMemo(() => {
    if (!isCharacterizationCargoSelect || !workspaceSelected?.id) {
      return new Map();
    }
    return buildCharacterizationMembershipByHierarchyId(
      ghoQueryRaw,
      workspaceSelected.id,
    );
  }, [ghoQueryRaw, isCharacterizationCargoSelect, workspaceSelected?.id]);

  const gseModalView = useMemo(() => {
    if (!isGseCargoSelect || !workspaceSelected?.id) {
      return {
        explicitModalIds: modalSelectIds,
        availableOfficeModalIds: [] as string[],
        selected: [],
        groups: [],
        orphanExplicitModalIds: [] as string[],
      };
    }

    return buildGseCargoModalView({
      workspaceId: workspaceSelected.id,
      modalSelectIds,
      typeLabels: hierarchyTypeLabels,
      nodes: hierarchyListData().map((hierarchy) => ({
        id: String(hierarchy.id).split('//')[0],
        parentId: hierarchy.parentId
          ? String(hierarchy.parentId).split('//')[0]
          : null,
        type: hierarchy.type,
        name: hierarchy.name,
        workspaceIds: hierarchy.workspaceIds || [],
      })),
    });
  }, [
    hierarchyListData,
    hierarchyTypeLabels,
    isGseCargoSelect,
    modalSelectIds,
    workspaceSelected?.id,
  ]);

  const gseAvailableOfficeIds = useMemo(
    () => new Set(gseModalView.availableOfficeModalIds),
    [gseModalView.availableOfficeModalIds],
  );

  const gseAvailableGrouped = useMemo(() => {
    if (!isGseCargoSelect || filter !== HierarchyEnum.OFFICE) return [];
    return groupModalHierarchyItemsBySector(
      hierarchyList
        .filter((hierarchy) => gseAvailableOfficeIds.has(hierarchy.id))
        .map((hierarchy) =>
          toSectorGroupedCargoModalRow(hierarchy, {
            workspaceName: workspaceSelected?.name,
          }),
        ),
    );
  }, [
    filter,
    gseAvailableOfficeIds,
    hierarchyList,
    isGseCargoSelect,
    workspaceSelected?.name,
  ]);

  const gseSelectedGroups = gseModalView.groups;

  const characterizationModalView = useMemo(() => {
    if (!isCharacterizationCargoSelect || !workspaceSelected?.id) {
      return {
        explicitModalIds: modalSelectIds,
        availableOfficeModalIds: [] as string[],
        selected: [],
        groups: [],
        orphanExplicitModalIds: [] as string[],
      };
    }

    return buildGseCargoModalView({
      workspaceId: workspaceSelected.id,
      modalSelectIds,
      typeLabels: hierarchyTypeLabels,
      nodes: hierarchyListData().map((hierarchy) => ({
        id: String(hierarchy.id).split('//')[0],
        parentId: hierarchy.parentId
          ? String(hierarchy.parentId).split('//')[0]
          : null,
        type: hierarchy.type,
        name: hierarchy.name,
        workspaceIds: hierarchy.workspaceIds || [],
      })),
    });
  }, [
    hierarchyListData,
    hierarchyTypeLabels,
    isCharacterizationCargoSelect,
    modalSelectIds,
    workspaceSelected?.id,
  ]);

  const characterizationAvailableOfficeIds = useMemo(
    () => new Set(characterizationModalView.availableOfficeModalIds),
    [characterizationModalView.availableOfficeModalIds],
  );

  const characterizationSelectedGroups = characterizationModalView.groups;

  const gseOrphanExplicit = useMemo(() => {
    if (!isGseCargoSelect) return [];
    return gseModalView.orphanExplicitModalIds.flatMap((modalId) => {
      const { hierarchyId } = splitHierarchyModalId(modalId);
      const hierarchy = hierarchyById.get(hierarchyId);
      if (!hierarchy) return [];
      return [{ ...hierarchy, id: modalId }];
    });
  }, [gseModalView.orphanExplicitModalIds, hierarchyById, isGseCargoSelect]);

  const characterizationOrphanExplicit = useMemo(() => {
    if (!isCharacterizationCargoSelect) return [];
    return characterizationModalView.orphanExplicitModalIds.flatMap((modalId) => {
      const { hierarchyId } = splitHierarchyModalId(modalId);
      const hierarchy = hierarchyById.get(hierarchyId);
      if (!hierarchy) return [];
      return [{ ...hierarchy, id: modalId }];
    });
  }, [
    characterizationModalView.orphanExplicitModalIds,
    hierarchyById,
    isCharacterizationCargoSelect,
  ]);

  const characterizationAvailableGrouped = useMemo(() => {
    if (!isCharacterizationCargoSelect) return [];
    return groupModalHierarchyItemsBySector(
      hierarchyList
        .filter((hierarchy) =>
          characterizationAvailableOfficeIds.has(hierarchy.id),
        )
        .map((hierarchy) => toCharacterizationCargoModalRow(hierarchy)),
    );
  }, [
    characterizationAvailableOfficeIds,
    hierarchyList,
    isCharacterizationCargoSelect,
  ]);

  const structureList = useMemo(() => {
    if (filter !== STRUCTURE_FILTER || !workspaceSelected?.id) return [];

    const nodes = hierarchyListData();
    const indexed = indexStructureNodes(nodes);
    const explicit = new Set(
      modalSelectIds
        .filter((modalId) => modalId.split('//')[1] === workspaceSelected.id)
        .map((modalId) => modalId.split('//')[0]),
    );

    return nodes
      .filter((hierarchy) => {
        if (!isOrganizationalStructure(hierarchy.type)) return false;
        if (
          !structureAppliesToWorkspace(
            hierarchy.id,
            indexed.byId,
            indexed.childrenById,
            workspaceSelected.id,
          )
        ) {
          return false;
        }
        if (structureBlockedByAncestor(hierarchy.id, explicit, indexed.byId)) {
          return false;
        }
        return (
          !search ||
          hierarchyMatchesSectorGroupedSearch(hierarchy, search, {
            includeSectorPath: true,
          })
        );
      })
      .map((hierarchy) => ({
        ...hierarchy,
        id: `${hierarchy.id}//${workspaceSelected.id}`,
      }));
  }, [
    filter,
    hierarchyListData,
    modalSelectIds,
    search,
    workspaceSelected?.id,
  ]);

  const selectStructures = (modalIds: string[]) => {
    if (!workspaceSelected?.id || !modalIds.length) return;
    const next = pruneRedundantHierarchyModalIds(
      uniqueModalIds([...modalSelectIds, ...modalIds]),
      hierarchyListData(),
    );
    if (isGseCargoSelect) noteGseCargoUserEdit();
    dispatch(setModalIds(next));
  };

  const onSelectAll = () => {
    if (filter === STRUCTURE_FILTER && (isGseCargoSelect || isCharacterizationCargoSelect)) {
      selectStructures(structureList.map((hierarchy) => hierarchy.id));
      return;
    }

    if (isGseCargoSelect) {
      const visibleAvailable = hierarchyList
        .map((hierarchy) => hierarchy.id)
        .filter((id) => gseAvailableOfficeIds.has(id));
      noteGseCargoUserEdit();
      return dispatch(
        setModalIds(uniqueModalIds([...modalSelectIds, ...visibleAvailable])),
      );
    }

    if (isCharacterizationCargoSelect) {
      const visibleAvailable = hierarchyList
        .map((hierarchy) => hierarchy.id)
        .filter((id) => characterizationAvailableOfficeIds.has(id));
      return dispatch(
        setModalIds(uniqueModalIds([...modalSelectIds, ...visibleAvailable])),
      );
    }

    if (filter === 'GHO') {
      const hierarchyListIds = removeDuplicate(
        ghoQuery
          .map((gho) =>
            (gho.hierarchies || []).map(
              (hierarchy) => hierarchy.id + '//' + workspaceSelected?.id,
            ),
          )
          .reduce((acc, curr) => [...acc, ...curr], [] as string[]),
        {
          simpleCompare: true,
        },
      );

      const uniqueHierarchyList = hierarchyListIds.filter(
        (ghoHierarchyId) =>
          !!hierarchyList.find((hierarchy) => hierarchy.id === ghoHierarchyId),
      );

      return dispatch(setModalIds(uniqueHierarchyList));
    }
    dispatch(setModalIds(hierarchyList.map((hierarchy) => hierarchy.id)));
  };

  const onSelectEditALl = () => {
    setSelectData({
      ...selectedData,
      hierarchiesIds: selectedData.allHierarchiesIds,
    });
  };

  const onSelectWorkspace = (workspace: IWorkspace) => {
    if (selectedData.lockWorkspace) return;
    setWorkspaceSelected(workspace);
  };

  const onEmployeeAdd = () => {
    return onStackOpenModal(ModalEnum.AUTOMATE_SUB_OFFICE, {
      callback: (hierarchy) => {
        setTimeout(() => {
          setFilter(HierarchyEnum.SUB_OFFICE);
          setTimeout(() => {
            if (hierarchy?.id)
              document
                .getElementById(
                  IdsEnum.HIERARCHY_MODAL_SELECT_ITEM.replace(
                    ':id',
                    hierarchy.id,
                  ),
                )
                ?.click();
          }, 500);
        }, 500);
      },
    } as typeof initialAutomateSubOfficeState);
  };

  if (workspaceSelected === undefined) return null;

  const workspaceOptions = useMemo(() => {
    const workspaces = company?.workspace || [];
    const filtered = selectedData?.workspaceIdsFilter?.length
      ? workspaces.filter((w) => selectedData.workspaceIdsFilter.includes(w.id))
      : workspaces;
    return filtered.sort((a, b) => sortString(a, b, 'name'));
  }, [company?.workspace, selectedData?.workspaceIdsFilter]);

  return (
    <Box mt={8} maxHeight={'calc(95vh - 150px)'} overflow="auto">
      <SFlex direction="column" gap={5}>
        <Box minWidth={300} maxWidth={400} mt={3}>
          <SSearchSelect
            value={workspaceSelected}
            options={workspaceOptions}
            label="Estabelecimento"
            placeholder="Selecionar estabelecimento..."
            disabled={selectedData.lockWorkspace}
            getOptionLabel={(option: IWorkspace) => option.name}
            getOptionValue={(option: IWorkspace) => option.id}
            onChange={(option: IWorkspace | null) => {
              if (selectedData.lockWorkspace) return;
              if (option) {
                onSelectWorkspace(option);
              }
            }}
          />
        </Box>
        <SFlex gap={10} mt={10}>
          <Box flex={1}>
            <SFlex gap={4} align="center">
              <SText mr={4}>Adicinar</SText>
              <STagButton
                width="150px"
                text={'adicionar todos'}
                iconProps={{ sx: { color: 'success.main' } }}
                icon={SAddIcon}
                onClick={() => onSelectAll?.()}
              />
              {!isCharacterizationCargoSelect && (
                <STagButton
                  width="150px"
                  text={'editar ativos'}
                  iconProps={{ sx: { color: 'info.main' } }}
                  icon={SEditIcon}
                  onClick={() => onSelectEditALl?.()}
                />
              )}
            </SFlex>
            <Divider sx={{ mb: 10, mt: 7 }} />
            <ModalInputHierarchy
              listFilter={allTypes}
              onEmployeeAdd={onEmployeeAdd}
              onSearch={(value) => dispatch(setHierarchySearch(value))}
              placeholder={
                filter === 'GHO'
                  ? 'Nome do GSE...'
                  : filter === STRUCTURE_FILTER
                    ? 'Nome da estrutura...'
                    : hierarchyConstant[filter].placeholder
              }
              setFilter={(value) => setFilter(value)}
              filter={filter}
              onSelectAll={onSelectAll}
              selectedData={selectedData}
            />
            <SFlex direction="column" gap={5} mb={10}>
              {filter === STRUCTURE_FILTER &&
                (isGseCargoSelect || isCharacterizationCargoSelect) &&
                structureList.map((hierarchy) => (
                  <ModalItemHierarchy
                    key={hierarchy.id}
                    onClick={() => {
                      if (selectedData.singleSelect) {
                        handleSingleSelect(hierarchy);
                        return;
                      }
                      selectStructures([hierarchy.id]);
                    }}
                    id={IdsEnum.HIERARCHY_MODAL_SELECT_ITEM.replace(
                      ':id',
                      hierarchy.id.split('//')[0],
                    )}
                    data={hierarchy}
                    text={hierarchy.name}
                    tooltipText={STRUCTURE_COVERAGE_TOOLTIP}
                    textNoBreak
                    gseLabelContrast={isGseCargoSelect}
                    endIcon={
                      isCharacterizationCargoSelect ? (
                        <CharacterizationCargoMembershipIcons
                          memberships={characterizationMembershipByHierarchyId.get(
                            hierarchy.id.split('//')[0],
                          )}
                        />
                      ) : (
                        <GseCargoMembershipIcons
                          memberships={gseMembershipByHierarchyId.get(
                            hierarchy.id.split('//')[0],
                          )}
                        />
                      )
                    }
                  />
                ))}
              {filter === HierarchyEnum.OFFICE &&
                isCharacterizationCargoSelect &&
                characterizationAvailableGrouped.map((row) => {
                  if (row.kind === 'group') {
                    return (
                      <Box key={row.id} sx={{ pt: 1 }}>
                        <SText fontWeight="600" fontSize={13}>
                          {row.sectorGroupName}
                        </SText>
                      </Box>
                    );
                  }

                  const hierarchy = row.item;

                  return (
                    <Box key={hierarchy.id} sx={{ pl: 3 }}>
                      <ModalItemHierarchy
                        onClick={() =>
                          selectedData.singleSelect
                            ? handleSingleSelect(hierarchy)
                            : dispatch(setAddModalId(hierarchy.id))
                        }
                        id={IdsEnum.HIERARCHY_MODAL_SELECT_ITEM.replace(
                          ':id',
                          hierarchy.id.split('//')[0],
                        )}
                        data={hierarchy}
                        text={hierarchy.displayName}
                        tooltipText=""
                        textNoBreak
                        startContent={
                          <GseCargoRowContextIcons
                            sectorTooltip={hierarchy.sectorTooltip}
                          />
                        }
                        endIcon={
                          <CharacterizationCargoMembershipIcons
                            memberships={characterizationMembershipByHierarchyId.get(
                              hierarchy.id.split('//')[0],
                            )}
                          />
                        }
                      />
                    </Box>
                  );
                })}
              {filter === HierarchyEnum.OFFICE &&
                isGseCargoSelect &&
                gseAvailableGrouped.map((row) => {
                  if (row.kind === 'group') {
                    return (
                      <Box key={row.id} sx={{ pt: 1 }}>
                        <SText fontWeight="600" fontSize={13}>
                          {row.sectorGroupName}
                        </SText>
                      </Box>
                    );
                  }

                  const hierarchy = row.item;

                  return (
                    <Box key={hierarchy.id} sx={{ pl: 3 }}>
                      <ModalItemHierarchy
                        onClick={() => {
                          if (selectedData.singleSelect) {
                            handleSingleSelect(hierarchy);
                            return;
                          }
                          noteGseCargoUserEdit();
                          dispatch(setAddModalId(hierarchy.id));
                        }}
                        id={IdsEnum.HIERARCHY_MODAL_SELECT_ITEM.replace(
                          ':id',
                          hierarchy.id.split('//')[0],
                        )}
                        data={hierarchy}
                        text={hierarchy.displayName}
                        tooltipText=""
                        textNoBreak
                        gseLabelContrast
                        startContent={
                          <GseCargoRowContextIcons
                            workspaceTooltip={hierarchy.workspaceTooltip}
                            sectorTooltip={hierarchy.sectorTooltip}
                          />
                        }
                        endIcon={
                          <GseCargoMembershipIcons
                            memberships={gseMembershipByHierarchyId.get(
                              hierarchy.id.split('//')[0],
                            )}
                          />
                        }
                      />
                    </Box>
                  );
                })}
              {filter !== 'GHO' &&
                !isCharacterizationCargoSelect &&
                !isGseCargoSelect &&
                hierarchyList.map((hierarchy) => {
                  return (
                    <ModalItemHierarchy
                      onClick={() =>
                        selectedData.singleSelect
                          ? handleSingleSelect(hierarchy)
                          : dispatch(setAddModalId(hierarchy.id))
                      }
                      key={hierarchy.id}
                      id={IdsEnum.HIERARCHY_MODAL_SELECT_ITEM.replace(
                        ':id',
                        hierarchy.id.split('//')[0],
                      )}
                      data={hierarchy}
                    />
                  );
                })}{' '}
              {filter === 'GHO' && <ModalListGHO ghoQuery={ghoQuery} />}
            </SFlex>
          </Box>
          <Box flex={1}>
            <SFlex gap={4} align="center">
              <SText mr={4}>Selecionados</SText>
              <STagButton
                width="150px"
                text={'remover todos'}
                iconProps={{ sx: { color: 'error.main' } }}
                icon={SCloseIcon}
                onClick={() => {
                  if (isGseCargoSelect) noteGseCargoUserEdit();
                  dispatch(
                    setModalIds(
                      isGseCargoSelect || isCharacterizationCargoSelect
                        ? keepModalIdsOutsideWorkspace(
                            modalSelectIds,
                            workspaceSelected?.id,
                          )
                        : [],
                    ),
                  );
                }}
              />
            </SFlex>
            <Divider sx={{ mb: 10, mt: 7 }} />
            <SFlex direction="column" gap={5} mb={10}>
              {isGseCargoSelect
                ? (
                    <>
                      {gseSelectedGroups.map((group) => {
                        if (group.kind === 'direct') {
                          const hierarchy = hierarchyById.get(group.officeId);
                          if (!hierarchy) return null;
                          const data = { ...hierarchy, id: group.sourceModalId };
                          return (
                            <ModalItemHierarchy
                              key={group.sourceModalId}
                              onClick={() => {
                                noteGseCargoUserEdit();
                                dispatch(setRemoveModalId(group.sourceModalId));
                              }}
                              active
                              selectedOverride
                              data={data}
                              activeRemove
                              text={hierarchy.name}
                              textNoBreak
                              gseLabelContrast
                              endIcon={
                                <GseCargoMembershipIcons
                                  memberships={gseMembershipByHierarchyId.get(
                                    group.officeId,
                                  )}
                                />
                              }
                            />
                          );
                        }

                        const source = hierarchyById.get(group.sourceHierarchyId);
                        if (!source) return null;
                        const sourceData = { ...source, id: group.sourceModalId };
                        return (
                          <Box key={group.sourceModalId}>
                            <ModalItemHierarchy
                              onClick={() => {
                                noteGseCargoUserEdit();
                                dispatch(setRemoveModalId(group.sourceModalId));
                              }}
                              active
                              selectedOverride
                              data={sourceData}
                              activeRemove
                              text={source.name}
                              textNoBreak
                              gseLabelContrast
                              endIcon={
                                <GseCargoMembershipIcons
                                  memberships={gseMembershipByHierarchyId.get(
                                    group.sourceHierarchyId,
                                  )}
                                />
                              }
                            />
                            {group.offices.map((office) => {
                              const hierarchy = hierarchyById.get(office.officeId);
                              if (!hierarchy) return null;
                              return (
                                <Box
                                  key={office.modalId}
                                  sx={{ pl: 4, opacity: 0.72, mt: 0.5 }}
                                >
                                  <ModalItemHierarchy
                                    active
                                    selectedOverride
                                    hideCheckbox
                                    data={{ ...hierarchy, id: office.modalId }}
                                    activeRemove={false}
                                    text={office.officeName}
                                    tooltipText={office.originLabel}
                                    textNoBreak
                                    gseLabelContrast
                                  />
                                  <SText fontSize={11} color="text.secondary" sx={{ pl: 1 }}>
                                    {office.originLabel}
                                  </SText>
                                </Box>
                              );
                            })}
                          </Box>
                        );
                      })}
                      {gseOrphanExplicit.map((hierarchy) => (
                        <ModalItemHierarchy
                          key={hierarchy.id}
                          onClick={() => {
                            noteGseCargoUserEdit();
                            dispatch(setRemoveModalId(hierarchy.id));
                          }}
                          active
                          data={hierarchy}
                          activeRemove
                          textNoBreak
                          gseLabelContrast
                        />
                      ))}
                    </>
                  )
                : isCharacterizationCargoSelect
                  ? (
                    <>
                      {characterizationSelectedGroups.map((group) => {
                        if (group.kind === 'direct') {
                          const hierarchy = hierarchyById.get(group.officeId);
                          if (!hierarchy) return null;
                          const data = { ...hierarchy, id: group.sourceModalId };
                          return (
                            <ModalItemHierarchy
                              key={group.sourceModalId}
                              onClick={() =>
                                dispatch(setRemoveModalId(group.sourceModalId))
                              }
                              active
                              selectedOverride
                              data={data}
                              activeRemove
                              text={hierarchy.name}
                              textNoBreak
                              endIcon={
                                <CharacterizationCargoMembershipIcons
                                  memberships={characterizationMembershipByHierarchyId.get(
                                    group.officeId,
                                  )}
                                />
                              }
                            />
                          );
                        }

                        const source = hierarchyById.get(group.sourceHierarchyId);
                        if (!source) return null;
                        const sourceData = { ...source, id: group.sourceModalId };
                        return (
                          <Box key={group.sourceModalId}>
                            <ModalItemHierarchy
                              onClick={() =>
                                dispatch(setRemoveModalId(group.sourceModalId))
                              }
                              active
                              selectedOverride
                              data={sourceData}
                              activeRemove
                              text={source.name}
                              textNoBreak
                              endIcon={
                                <CharacterizationCargoMembershipIcons
                                  memberships={characterizationMembershipByHierarchyId.get(
                                    group.sourceHierarchyId,
                                  )}
                                />
                              }
                            />
                            {group.offices.map((office) => {
                              const hierarchy = hierarchyById.get(office.officeId);
                              if (!hierarchy) return null;
                              return (
                                <Box
                                  key={office.modalId}
                                  sx={{ pl: 4, opacity: 0.72, mt: 0.5 }}
                                >
                                  <ModalItemHierarchy
                                    active
                                    selectedOverride
                                    hideCheckbox
                                    data={{ ...hierarchy, id: office.modalId }}
                                    activeRemove={false}
                                    text={office.officeName}
                                    tooltipText={office.originLabel}
                                    textNoBreak
                                  />
                                  <SText
                                    fontSize={11}
                                    color="text.secondary"
                                    sx={{ pl: 1 }}
                                  >
                                    {office.originLabel}
                                  </SText>
                                </Box>
                              );
                            })}
                          </Box>
                        );
                      })}
                      {characterizationOrphanExplicit.map((hierarchy) => (
                        <ModalItemHierarchy
                          key={hierarchy.id}
                          onClick={() =>
                            dispatch(setRemoveModalId(hierarchy.id))
                          }
                          active
                          data={hierarchy}
                          activeRemove
                          textNoBreak
                          endIcon={
                            <CharacterizationCargoMembershipIcons
                              memberships={characterizationMembershipByHierarchyId.get(
                                splitHierarchyModalId(hierarchy.id).hierarchyId,
                              )}
                            />
                          }
                        />
                      ))}
                    </>
                  )
                  : hierarchyListSelected.map((hierarchy) => {
                      return (
                        <ModalItemHierarchy
                          onClick={() => dispatch(setRemoveModalId(hierarchy.id))}
                          active
                          key={hierarchy.id}
                          data={hierarchy}
                          activeRemove={true}
                        />
                      );
                    })}
            </SFlex>
          </Box>
        </SFlex>
      </SFlex>
    </Box>
  );
};
