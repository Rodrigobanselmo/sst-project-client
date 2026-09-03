import React, { FC, useEffect, useMemo, useState } from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import {
  selectHierarchySearch,
  selectModalSelectIds,
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
import { getGseCargoRowPresentation } from '../gse-cargo-row-presentation.util';
import { buildGseMembershipByHierarchyId } from '../gse-cargo-membership.util';
import { groupModalHierarchyItemsBySector } from '../group-modal-hierarchy-by-sector.util';
import {
  filterModalIdsByWorkspace,
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

  const [filter, setFilter] = useState<HierarchyEnum | 'GHO'>(
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
    dispatch(setModalIds(selectedData.hierarchiesIds));
  }, [dispatch, selectedData.hierarchiesIds]);

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

  const currentWorkspaceSelectedIds = useMemo(() => {
    if (!workspaceSelected?.id) return new Set<string>();
    return new Set(
      filterModalIdsByWorkspace(modalSelectIds, workspaceSelected.id),
    );
  }, [modalSelectIds, workspaceSelected?.id]);

  const gseSelectedList = useMemo(() => {
    if (!isGseCargoSelect || !workspaceSelected?.id) return [];

    return filterModalIdsByWorkspace(
      modalSelectIds,
      workspaceSelected.id,
    ).flatMap((modalId) => {
      const { hierarchyId, workspaceId } = splitHierarchyModalId(modalId);
      const hierarchy = hierarchyById.get(hierarchyId);
      if (!hierarchy) return [];

      const workspaceName =
        company?.workspace?.find((workspace) => workspace.id === workspaceId)
          ?.name || workspaceSelected.name;

      return [
        {
          ...toSectorGroupedCargoModalRow(hierarchy, { workspaceName }),
          id: modalId,
        },
      ];
    });
  }, [
    company?.workspace,
    hierarchyById,
    isGseCargoSelect,
    modalSelectIds,
    workspaceSelected?.id,
    workspaceSelected?.name,
  ]);

  const gseAvailableGrouped = useMemo(() => {
    if (!isGseCargoSelect || filter !== HierarchyEnum.OFFICE) return [];
    return groupModalHierarchyItemsBySector(
      hierarchyList
        .filter((hierarchy) => !currentWorkspaceSelectedIds.has(hierarchy.id))
        .map((hierarchy) =>
          toSectorGroupedCargoModalRow(hierarchy, {
            workspaceName: workspaceSelected?.name,
          }),
        ),
    );
  }, [
    currentWorkspaceSelectedIds,
    filter,
    hierarchyList,
    isGseCargoSelect,
    workspaceSelected?.name,
  ]);

  const gseSelectedGrouped = useMemo(() => {
    if (!isGseCargoSelect) return [];
    return groupModalHierarchyItemsBySector(gseSelectedList);
  }, [gseSelectedList, isGseCargoSelect]);

  const characterizationSelectedList = useMemo(() => {
    if (!isCharacterizationCargoSelect || !workspaceSelected?.id) return [];

    return filterModalIdsByWorkspace(
      modalSelectIds,
      workspaceSelected.id,
    ).flatMap((modalId) => {
      const { hierarchyId } = splitHierarchyModalId(modalId);
      const hierarchy = hierarchyById.get(hierarchyId);
      if (!hierarchy) return [];

      return [
        {
          ...toCharacterizationCargoModalRow(hierarchy),
          id: modalId,
        },
      ];
    });
  }, [
    hierarchyById,
    isCharacterizationCargoSelect,
    modalSelectIds,
    workspaceSelected?.id,
  ]);

  const characterizationAvailableGrouped = useMemo(() => {
    if (!isCharacterizationCargoSelect) return [];
    return groupModalHierarchyItemsBySector(
      hierarchyList.map((hierarchy) => toCharacterizationCargoModalRow(hierarchy)),
    );
  }, [hierarchyList, isCharacterizationCargoSelect]);

  const characterizationSelectedGrouped = useMemo(() => {
    if (!isCharacterizationCargoSelect) return [];
    return groupModalHierarchyItemsBySector(characterizationSelectedList);
  }, [characterizationSelectedList, isCharacterizationCargoSelect]);

  const onSelectAll = () => {
    if (isGseCargoSelect || isCharacterizationCargoSelect) {
      return dispatch(
        setModalIds(
          uniqueModalIds([
            ...modalSelectIds,
            ...hierarchyList.map((hierarchy) => hierarchy.id),
          ]),
        ),
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
                  : hierarchyConstant[filter].placeholder
              }
              setFilter={(value) => setFilter(value)}
              filter={filter}
              onSelectAll={onSelectAll}
              selectedData={selectedData}
            />
            <SFlex direction="column" gap={5} mb={10}>
              {filter !== 'GHO' &&
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
                filter !== HierarchyEnum.OFFICE &&
                isGseCargoSelect &&
                hierarchyList.map((hierarchy) => {
                  const presentation = getGseCargoRowPresentation({
                    workspaceName: workspaceSelected.name,
                    cargoName: hierarchy.name,
                    parents: hierarchy.parents,
                  });

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
                      text={presentation.cargoName}
                      tooltipText=""
                      textNoBreak
                      gseLabelContrast
                      startContent={
                        <GseCargoRowContextIcons
                          workspaceTooltip={presentation.workspaceTooltip}
                          sectorTooltip={presentation.sectorTooltip}
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
                onClick={() =>
                  dispatch(
                    setModalIds(
                      isGseCargoSelect || isCharacterizationCargoSelect
                        ? keepModalIdsOutsideWorkspace(
                            modalSelectIds,
                            workspaceSelected?.id,
                          )
                        : [],
                    ),
                  )
                }
              />
            </SFlex>
            <Divider sx={{ mb: 10, mt: 7 }} />
            <SFlex direction="column" gap={5} mb={10}>
              {isGseCargoSelect
                ? gseSelectedGrouped.map((row) => {
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
                            dispatch(setRemoveModalId(hierarchy.id))
                          }
                          active
                          data={hierarchy}
                          activeRemove={true}
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
                                splitHierarchyModalId(hierarchy.id).hierarchyId,
                              )}
                            />
                          }
                        />
                      </Box>
                    );
                  })
                : isCharacterizationCargoSelect
                  ? characterizationSelectedGrouped.map((row) => {
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
                              dispatch(setRemoveModalId(hierarchy.id))
                            }
                            active
                            data={hierarchy}
                            activeRemove={true}
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
                                  splitHierarchyModalId(hierarchy.id).hierarchyId,
                                )}
                              />
                            }
                          />
                        </Box>
                      );
                    })
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
